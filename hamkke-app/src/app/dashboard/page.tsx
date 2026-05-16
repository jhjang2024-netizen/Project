import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DashboardHome } from '@/components/features/dashboard/dashboard-home'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const { data: familyLinks } = await admin
    .from('family_links')
    .select(`
      *,
      child:profiles!family_links_child_id_fkey(*),
      parent:profiles!family_links_parent_id_fkey(*)
    `)
    .or(`child_id.eq.${profile?.id},parent_id.eq.${profile?.id}`)
    .eq('status', 'accepted')

  const { data: recentActivities } = await admin
    .from('activities')
    .select('*')
    .in('family_link_id', (familyLinks ?? []).map(fl => fl.id))
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: callLogs } = await admin
    .from('call_logs')
    .select('*')
    .in('family_link_id', (familyLinks ?? []).map(fl => fl.id))
    .order('called_at', { ascending: false })
    .limit(30)

  return (
    <DashboardHome
      profile={profile}
      familyLinks={familyLinks ?? []}
      recentActivities={recentActivities ?? []}
      callLogs={callLogs ?? []}
    />
  )
}
