import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { family_link_id, duration_seconds } = await req.json()

  const { data: lastLog } = await supabase
    .from('call_logs')
    .select('*')
    .eq('family_link_id', family_link_id)
    .order('called_at', { ascending: false })
    .limit(1)
    .single()

  const today = new Date()
  const todayStr = today.toDateString()
  const yesterdayStr = new Date(today.getTime() - 86_400_000).toDateString()

  if (lastLog) {
    const lastDateStr = new Date(lastLog.called_at).toDateString()
    if (lastDateStr === todayStr) {
      return NextResponse.json({ streakDay: lastLog.streak_day, alreadyCalled: true })
    }
  }

  let streakDay = 1
  if (lastLog) {
    const lastDateStr = new Date(lastLog.called_at).toDateString()
    if (lastDateStr === yesterdayStr) {
      streakDay = lastLog.streak_day + 1
    }
  }

  const { data: log } = await supabase.from('call_logs').insert({
    family_link_id,
    caller_id: user.id,
    duration_seconds,
    streak_day: streakDay,
  }).select().single()

  return NextResponse.json({ streakDay, log })
}
