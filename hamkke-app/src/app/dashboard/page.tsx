import { createClient } from '@/lib/supabase/server'
import { DashboardHome } from '@/components/features/dashboard/dashboard-home'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  if (!profile && user) {
    const name = (user.user_metadata?.name as string) || user.email?.split('@')[0] || ''
    const role = (user.user_metadata?.role as string) || 'child'
    const { data: newProfile } = await supabase
      .from('profiles')
      .upsert({ user_id: user.id, name, role }, { onConflict: 'user_id' })
      .select()
      .single()
    profile = newProfile
  }

  const { data: familyLinks } = await supabase
    .from('family_links')
    .select(`
      *,
      child:profiles!family_links_child_id_fkey(*),
      parent:profiles!family_links_parent_id_fkey(*)
    `)
    .or(`child_id.eq.${profile?.id},parent_id.eq.${profile?.id}`)
    .eq('status', 'accepted')

  const { data: recentActivities } = await supabase
    .from('activities')
    .select('*')
    .in('family_link_id', (familyLinks ?? []).map(fl => fl.id))
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: callLogs } = await supabase
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
