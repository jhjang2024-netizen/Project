'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Heart, Phone, Users, Bell } from 'lucide-react'

const navItems = [
  { href: '/dashboard',        icon: Home,   label: '홈' },
  { href: '/dashboard/health', icon: Heart,  label: '건강' },
  { href: '/dashboard/call',   icon: Phone,  label: '안부전화' },
  { href: '/dashboard/family', icon: Users,  label: '가족' },
  { href: '/dashboard/notifications', icon: Bell, label: '알림' },
]

export function MobileNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-pb">
      <div className="flex">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                active ? 'text-gray-900' : 'text-gray-400'
              )}
            >
              <span className="relative">
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {href === '/dashboard/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-orange-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
