import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const body = await req.json()
  const { familyLinkId, heartRate, steps, oxygenLevel, sleepHours } = body

  const admin = createAdminClient()

  const { error } = await admin.from('health_records').insert({
    family_link_id: familyLinkId,
    heart_rate: heartRate ?? null,
    steps: steps ?? null,
    oxygen_level: oxygenLevel ?? null,
    sleep_hours: sleepHours ?? null,
  })
  if (error) return NextResponse.json({ error: '기록 실패' }, { status: 500 })

  // 건강 이상 감지 → 가족에게 알림
  const alerts: string[] = []
  if (heartRate && (heartRate < 50 || heartRate > 120)) alerts.push(`심박수 ${heartRate}bpm`)
  if (oxygenLevel && oxygenLevel < 92) alerts.push(`산소 포화도 ${oxygenLevel}%`)
  if (steps && steps < 2000) alerts.push(`걸음 수 ${steps.toLocaleString('ko-KR')}보`)

  if (alerts.length > 0) {
    const { data: link } = await admin
      .from('family_links')
      .select('child_id, parent_id, child:profiles!family_links_child_id_fkey(user_id, name), parent:profiles!family_links_parent_id_fkey(user_id, name)')
      .eq('id', familyLinkId)
      .single()

    if (link) {
      const child = (link.child as unknown) as { user_id: string; name: string } | null
      const parent = (link.parent as unknown) as { user_id: string; name: string } | null
      const partnerUserId = child?.user_id === user.id ? parent?.user_id : child?.user_id
      const myProfile = await admin.from('profiles').select('name').eq('user_id', user.id).single()
      const myName = myProfile.data?.name ?? '가족'

      if (partnerUserId) {
        await admin.from('notifications').insert({
          user_id: partnerUserId,
          type: 'health_alert',
          title: `${myName}님 건강 수치를 확인해 주세요`,
          body: alerts.join(', ') + ' 이상이 감지됐습니다.',
          data: { family_link_id: familyLinkId },
        })
      }
    }
  }

  return NextResponse.json({ success: true })
}
