import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // 프로필 없거나 이름 비어있으면 admin으로 생성/업데이트 (RLS 우회)
  const { data: profile } = await admin
    .from('profiles').select('id, name').eq('user_id', user.id).single()

  const nameFromMeta = (user.user_metadata?.name as string) || user.email?.split('@')[0] || ''
  const roleFromMeta = (user.user_metadata?.role as string) || 'child'

  if (!profile) {
    await admin.from('profiles').insert({ user_id: user.id, name: nameFromMeta, role: roleFromMeta })
  } else if (!profile.name || profile.name.trim() === '') {
    await admin.from('profiles').update({ name: nameFromMeta }).eq('user_id', user.id)
  }

  const { count: unreadCount } = await admin
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar unreadCount={unreadCount ?? 0} />
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav unreadCount={unreadCount ?? 0} />
    </div>
  )
}
