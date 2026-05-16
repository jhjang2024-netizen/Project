import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CallSettingsClient } from './call-settings-client'

export default async function CallPage() {
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

  const [{ data: callSettings }, { data: callLogs }] = await Promise.all([
    familyLinkId
      ? admin.from('call_settings').select('*').eq('family_link_id', familyLinkId).single()
      : Promise.resolve({ data: null }),
    familyLinkId
      ? admin.from('call_logs').select('*').eq('family_link_id', familyLinkId).order('called_at', { ascending: false }).limit(20)
      : Promise.resolve({ data: [] }),
  ])

  return (
    <CallSettingsClient
      familyLinkId={familyLinkId}
      callSettings={callSettings}
      callLogs={callLogs ?? []}
    />
  )
}
