import { createClient } from '@/lib/supabase/server'
import { FamilyClient } from './family-client'

export default async function FamilyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const { data: familyLinks } = await supabase
    .from('family_links')
    .select(`*, child:profiles!family_links_child_id_fkey(*), parent:profiles!family_links_parent_id_fkey(*)`)
    .or(`child_id.eq.${profile?.id},parent_id.eq.${profile?.id}`)

  return (
    <FamilyClient
      profile={profile}
      familyLinks={familyLinks ?? []}
    />
  )
}
