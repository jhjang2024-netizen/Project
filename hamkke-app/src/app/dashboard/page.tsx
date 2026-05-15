import { createClient } from '@/lib/supabase/server'
import { DashboardHome } from '@/components/features/dashboard/dashboard-home'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const { data: familyLinks } = await supabase
    .from('family_links')
    .select(`
      *,
      child:profiles!family_links_child_id_fkey(*),
      parent:profiles!family_links_parent_id_fkey(*)
    `)
    .or(`child_id.eq.${profile?.id},parent_id.eq.${profile?.id}`)
    .eq('status', 'accepted')

  const familyLinkIds = (familyLinks ?? []).map(fl => fl.id)

  const [{ data: recentActivities }, { data: suggestedActivities }, { data: callLogs }] =
    await Promise.all([
      supabase
        .from('activities')
        .select('*')
        .in('family_link_id', familyLinkIds)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('activities')
        .select('*')
        .in('family_link_id', familyLinkIds)
        .eq('status', 'suggested')
        .order('created_at', { ascending: false }),
      supabase
        .from('call_logs')
        .select('*')
        .in('family_link_id', familyLinkIds)
        .order('called_at', { ascending: false })
        .limit(30),
    ])

  return (
    <DashboardHome
      profile={profile}
      familyLinks={familyLinks ?? []}
      recentActivities={recentActivities ?? []}
      suggestedActivities={suggestedActivities ?? []}
      callLogs={callLogs ?? []}
    />
  )
}
