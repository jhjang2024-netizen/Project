import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { count: unreadCount } = await supabase
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
