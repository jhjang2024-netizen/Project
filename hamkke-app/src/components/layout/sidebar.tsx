'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home, Heart, Phone, Users, Bell, Settings, LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard',               icon: Home,  label: '홈' },
  { href: '/dashboard/health',        icon: Heart, label: '건강 관리' },
  { href: '/dashboard/call',          icon: Phone, label: '안부 전화' },
  { href: '/dashboard/family',        icon: Users, label: '가족 연결' },
  { href: '/dashboard/notifications', icon: Bell,  label: '알림' },
]

export function Sidebar({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-gray-900 text-white">
      {/* 로고 */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-sm">함</div>
          <span className="text-xl font-black tracking-tight">함께</span>
        </Link>
        <p className="text-xs text-white/40 mt-1">AI 가족 동행 플랫폼</p>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/8 hover:text-white/90'
              )}
            >
              <span className="relative">
                <Icon size={18} />
                {href === '/dashboard/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* 하단 */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white/90 transition-colors"
        >
          <Settings size={18} />
          설정
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-colors"
        >
          <LogOut size={18} />
          로그아웃
        </button>
      </div>
    </aside>
  )
}
