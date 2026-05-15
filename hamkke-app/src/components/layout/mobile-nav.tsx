'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Heart, Phone, Users, Bell } from 'lucide-react'
import { useUnreadCount } from '@/lib/hooks/use-unread-count'

const navItems = [
  { href: '/dashboard',               icon: Home,  label: '홈' },
  { href: '/dashboard/health',        icon: Heart, label: '건강' },
  { href: '/dashboard/call',          icon: Phone, label: '안부전화' },
  { href: '/dashboard/family',        icon: Users, label: '가족' },
  { href: '/dashboard/notifications', icon: Bell,  label: '알림', badge: true },
]

export function MobileNav() {
  const pathname = usePathname()
  const unreadCount = useUnreadCount()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-pb">
      <div className="flex">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          const showBadge = badge && unreadCount > 0
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors relative',
                active ? 'text-gray-900' : 'text-gray-400'
              )}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
