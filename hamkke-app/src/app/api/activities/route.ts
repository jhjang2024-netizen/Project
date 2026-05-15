import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { family_link_id, type, title, description, venue, match_score, ai_reason, price_estimate } = body

  const { data: activity, error } = await supabase.from('activities').insert({
    family_link_id,
    type,
    title,
    description,
    venue,
    match_score,
    ai_reason,
    price_estimate,
    status: 'suggested',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: familyLink } = await supabase
    .from('family_links')
    .select('*, child:profiles!family_links_child_id_fkey(*), parent:profiles!family_links_parent_id_fkey(*)')
    .eq('id', family_link_id)
    .single()

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (familyLink && myProfile) {
    const partnerProfile = myProfile.role === 'child' ? familyLink.parent : familyLink.child
    if (partnerProfile) {
      await supabase.from('notifications').insert({
        user_id: partnerProfile.user_id,
        type: 'activity_request',
        title: '새 활동 제안이 왔어요 ✨',
        body: `${myProfile.name}님이 "${title}"을(를) 제안했어요.`,
        data: { activity_id: activity.id, family_link_id },
      })
    }
  }

  return NextResponse.json({ activity })
}
