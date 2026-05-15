import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { familyLinkId, durationSeconds } = await req.json()
  if (!familyLinkId) return NextResponse.json({ error: 'familyLinkId 필요' }, { status: 400 })

  const admin = createAdminClient()

  const { data: lastLog } = await admin
    .from('call_logs')
    .select('*')
    .eq('family_link_id', familyLinkId)
    .order('called_at', { ascending: false })
    .limit(1)
    .single()

  const now = new Date()
  const today = now.toISOString().slice(0, 10)

  if (lastLog) {
    const lastDate = new Date(lastLog.called_at).toISOString().slice(0, 10)
    if (lastDate === today) {
      return NextResponse.json({ error: '오늘 이미 통화를 기록했습니다.' }, { status: 409 })
    }
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)
  const lastDate = lastLog ? new Date(lastLog.called_at).toISOString().slice(0, 10) : null
  const streakDay = lastLog && lastDate === yesterdayStr ? lastLog.streak_day + 1 : 1

  await admin.from('call_logs').insert({
    family_link_id: familyLinkId,
    caller_id: user.id,
    duration_seconds: durationSeconds ?? null,
    streak_day: streakDay,
  })

  // 가족 상대방에게 알림 생성
  const { data: link } = await admin
    .from('family_links')
    .select('child_id, parent_id, child:profiles!family_links_child_id_fkey(user_id, name), parent:profiles!family_links_parent_id_fkey(user_id, name)')
    .eq('id', familyLinkId)
    .single()

  if (link) {
    const myProfile = await admin.from('profiles').select('id, name').eq('user_id', user.id).single()
    const myName = myProfile.data?.name ?? '가족'
    const child = (link.child as unknown) as { user_id: string; name: string } | null
    const parent = (link.parent as unknown) as { user_id: string; name: string } | null
    const partnerUserId = child?.user_id === user.id ? parent?.user_id : child?.user_id

    if (partnerUserId) {
      await admin.from('notifications').insert({
        user_id: partnerUserId,
        type: 'call_reminder',
        title: `${myName}님이 안부 전화를 기록했어요`,
        body: `${streakDay}일 연속 통화 중이에요! 🔥`,
        data: { family_link_id: familyLinkId, streak_day: streakDay },
      })
    }
  }

  return NextResponse.json({ success: true, streakDay })
}
