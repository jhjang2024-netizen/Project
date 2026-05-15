'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import type { Profile, FamilyLink } from '@/types'
import { Users, Copy, Check, Link2 } from 'lucide-react'

interface Props {
  profile: Profile | null
  familyLinks: FamilyLink[]
}

export function FamilyClient({ profile, familyLinks }: Props) {
  const [inviteCode, setInviteCode] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)

  async function generateCode() {
    if (!profile) return
    setGenerating(true)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const supabase = createClient()
    await supabase.from('profiles').update({ invite_code: code }).eq('id', profile.id)
    setInviteCode(code)
    setGenerating(false)
  }

  async function copyCode() {
    await navigator.clipboard.writeText(inviteCode || profile?.invite_code || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function connectFamily() {
    if (!profile || !inputCode.trim()) return
    setConnecting(true)
    setError('')
    const res = await fetch('/api/family-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode: inputCode.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? '연결에 실패했습니다.')
      setConnecting(false)
      return
    }
    setConnecting(false)
    window.location.reload()
  }

  const accepted = familyLinks.filter(fl => fl.status === 'accepted')
  const myCode = inviteCode || profile?.invite_code || ''

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900">가족 관리</h1>
        <p className="text-sm text-gray-500 mt-0.5">가족을 연결하고 함께 사용해 보세요</p>
      </div>

      {/* 연결된 가족 */}
      {accepted.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-orange-500" />
              <CardTitle>연결된 가족</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accepted.map(link => {
                const other = profile?.role === 'child' ? link.parent : link.child
                return (
                  <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">{profile?.role === 'child' ? '👴' : '👦'}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{other?.name}</p>
                        <p className="text-xs text-gray-400">{profile?.role === 'child' ? '부모님' : '자녀'}</p>
                      </div>
                    </div>
                    <Badge variant="success">연결됨</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 초대 코드 생성 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 size={18} className="text-gray-500" />
            <CardTitle>내 초대 코드</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            이 코드를 {profile?.role === 'child' ? '부모님' : '자녀'}에게 전달해 가족 연결을 시작하세요.
          </p>
          {myCode ? (
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3 font-mono font-bold text-xl text-center tracking-widest text-gray-900">
                {myCode}
              </div>
              <Button variant="ghost" onClick={copyCode}>
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </Button>
            </div>
          ) : (
            <Button onClick={generateCode} loading={generating} className="w-full">
              초대 코드 생성
            </Button>
          )}
          {myCode && (
            <Button variant="ghost" size="sm" onClick={generateCode} loading={generating}>
              새 코드 생성
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 코드로 연결 */}
      {accepted.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>초대 코드로 연결</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              {profile?.role === 'child' ? '부모님' : '자녀'}의 초대 코드를 입력하세요.
            </p>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="초대 코드 입력"
                value={inputCode}
                onChange={e => setInputCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="font-mono tracking-widest text-lg"
              />
              <Button onClick={connectFamily} loading={connecting} disabled={inputCode.length < 6}>
                연결
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
