'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Profile, Notification } from '@/types'
import { Bell, Phone, Heart, Users, Sparkles } from 'lucide-react'

interface Props {
  profile: Profile | null
  notifications: Notification[]
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  call_reminder: { icon: Phone, color: 'text-orange-500', bg: 'bg-orange-50' },
  health_alert:  { icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
  family_invite: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  activity_request: { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50' },
}

export function NotificationsClient({ notifications }: Props) {
  const [items, setItems] = useState(notifications)

  async function markRead(id: string) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    })
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    const unreadIds = items.filter(n => !n.read).map(n => n.id)
    if (!unreadIds.length) return
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: unreadIds }),
    })
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = items.filter(n => !n.read).length

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">알림</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : '모두 읽었어요'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            모두 읽음
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
          <CardContent className="py-16 text-center">
            <Bell size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">아직 알림이 없어요</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4 divide-y divide-gray-50">
            {items.map(n => {
              const cfg = typeConfig[n.type] ?? typeConfig.call_reminder
              const Icon = cfg.icon
              return (
                <div
                  key={n.id}
                  className={`flex gap-3 py-4 cursor-pointer ${!n.read ? 'opacity-100' : 'opacity-60'}`}
                  onClick={() => !n.read && markRead(n.id)}
                >
                  <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon size={18} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {new Date(n.created_at).toLocaleDateString('ko-KR', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
