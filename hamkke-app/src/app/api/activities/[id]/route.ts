import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status } = await req.json()

  const { data: activity } = await supabase
    .from('activities')
    .select('*')
    .eq('id', id)
    .single()

  if (!activity) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase
    .from('activities')
    .update({ status })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: familyLink } = await supabase
    .from('family_links')
    .select('*, child:profiles!family_links_child_id_fkey(*), parent:profiles!family_links_parent_id_fkey(*)')
    .eq('id', activity.family_link_id)
    .single()

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (familyLink && myProfile) {
    const otherProfile = myProfile.role === 'parent' ? familyLink.child : familyLink.parent
    if (otherProfile) {
      await supabase.from('notifications').insert({
        user_id: otherProfile.user_id,
        type: 'activity_request',
        title: status === 'approved' ? '활동이 수락되었어요! 🎉' : '활동이 거절되었어요',
        body: `"${activity.title}"이(가) ${status === 'approved' ? '수락' : '거절'}되었어요.`,
        data: { activity_id: id },
      })
    }
  }

  return NextResponse.json({ success: true })
}
