import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 프로필이 없으면 자동 생성 (스키마 실행 전에 가입한 경우 대비)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    const name = (user.user_metadata?.name as string) || user.email?.split('@')[0] || ''
    const role = (user.user_metadata?.role as string) || 'child'
    await supabase.from('profiles').upsert({ user_id: user.id, name, role }, { onConflict: 'user_id' })
  }

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
