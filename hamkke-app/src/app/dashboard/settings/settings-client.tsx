'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { User, LogOut, ChevronRight } from 'lucide-react'

interface Props {
  profile: Profile | null
  userEmail: string
}

export function SettingsClient({ profile, userEmail }: Props) {
  const router = useRouter()
  const [name, setName] = useState(profile?.name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ name, phone }).eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900">설정</h1>
        <p className="text-sm text-gray-500 mt-0.5">계정 정보를 관리하세요</p>
      </div>

      {/* 프로필 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User size={18} className="text-gray-500" />
            <CardTitle>내 정보</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">이름</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="이름" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">이메일</label>
              <Input value={userEmail} disabled className="bg-gray-50 text-gray-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">전화번호</label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" type="tel" />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" loading={saving}>{saved ? '저장됨 ✓' : '저장'}</Button>
              <span className="text-xs text-gray-400">
                역할: {profile?.role === 'child' ? '자녀' : '부모님'}
              </span>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 링크 목록 */}
      <Card>
        <CardContent className="pt-4 divide-y divide-gray-50">
          {[
            { label: '가족 관리', href: '/dashboard/family' },
            { label: '안부 전화 설정', href: '/dashboard/call' },
            { label: '알림 설정', href: '/dashboard/notifications' },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center justify-between py-3.5 hover:text-gray-900 text-gray-700"
            >
              <span className="text-sm font-medium">{item.label}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </a>
          ))}
        </CardContent>
      </Card>

      {/* 로그아웃 */}
      <Button variant="danger" className="w-full" onClick={handleLogout}>
        <LogOut size={16} />
        로그아웃
      </Button>
    </div>
  )
}
