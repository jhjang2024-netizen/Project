import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { HealthDashboard } from './health-dashboard'

export default async function HealthPage() {
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
    .select(`*, child:profiles!family_links_child_id_fkey(*), parent:profiles!family_links_parent_id_fkey(*)`)
    .or(`child_id.eq.${profile?.id},parent_id.eq.${profile?.id}`)
    .eq('status', 'accepted')

  const familyLinkId = familyLinks?.[0]?.id ?? null

  const { data: healthRecords } = familyLinkId
    ? await admin.from('health_records').select('*').eq('family_link_id', familyLinkId).order('recorded_at', { ascending: false }).limit(30)
    : { data: [] }

  const partnerLink = familyLinks?.[0]
  const partner = partnerLink
    ? (profile?.role === 'child' ? partnerLink.parent : partnerLink.child)
    : null

  return (
    <HealthDashboard
      profile={profile}
      partner={partner}
      familyLinkId={familyLinkId}
      healthRecords={healthRecords ?? []}
    />
  )
}
