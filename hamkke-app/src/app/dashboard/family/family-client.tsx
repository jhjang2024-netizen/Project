'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import type { Profile, FamilyLink } from '@/types'
import { Users, Copy, Check, Link2, PhoneCall } from 'lucide-react'

interface Props {
  profile: Profile | null
  familyLinks: FamilyLink[]
}

export function FamilyClient({ profile, familyLinks }: Props) {
  const [inviteCode, setInviteCode] = useState(profile?.invite_code ?? '')
  const [inputCode, setInputCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)

  async function generateCode() {
    if (!profile) { setError('프로필을 불러오는 중입니다. 페이지를 새로고침해 주세요.'); return }
    setGenerating(true)
    setError('')
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('profiles').update({ invite_code: code }).eq('id', profile.id)
    if (updateError) { setError('코드 생성 실패: ' + updateError.message); setGenerating(false); return }
    setInviteCode(code)
    setGenerating(false)
  }

  async function copyCode() {
    await navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function connectFamily() {
    if (!inputCode.trim()) return
    setConnecting(true)
    setError('')
    const res = await fetch('/api/family-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode: inputCode.trim() }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? '연결에 실패했습니다.'); setConnecting(false); return }
    window.location.reload()
  }

  const accepted = familyLinks.filter(fl => fl.status === 'accepted')
  const isConnected = accepted.length > 0

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900">가족 관리</h1>
        <p className="text-sm text-gray-500 mt-0.5">가족을 연결하고 함께 사용해 보세요</p>
      </div>

      {error && <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</div>}

      {/* 연결된 가족 */}
      {isConnected && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-orange-500" />
              <CardTitle>연결된 가족</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {accepted.map(link => {
              const other = profile?.role === 'child' ? link.parent : link.child
              const phone = (other as Profile & { phone?: string })?.phone
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
                  <div className="flex items-center gap-2">
                    {phone && (
                      <a href={`tel:${phone}`}>
                        <Button size="sm" variant="ghost">
                          <PhoneCall size={14} /> 전화
                        </Button>
                      </a>
                    )}
                    <Badge variant="success">연결됨</Badge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* 연결 방법 안내 */}
      {!isConnected && (
        <Card className="border-orange-100 bg-orange-50">
          <CardContent className="pt-5 pb-4">
            <p className="text-sm font-semibold text-orange-800 mb-3">연결 방법</p>
            <ol className="text-sm text-orange-700 space-y-2 list-decimal list-inside">
              <li><b>내 초대 코드</b>를 아래에서 생성해서 상대방에게 전달하세요</li>
              <li>상대방이 <b>초대 코드로 연결</b> 칸에 코드를 입력하면 연결 완료!</li>
            </ol>
          </CardContent>
        </Card>
      )}

      {/* 초대 코드 생성 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 size={18} className="text-gray-500" />
            <CardTitle>① 내 초대 코드</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            코드를 생성해서 {profile?.role === 'child' ? '부모님' : '자녀'}에게 카카오톡으로 전달하세요.
          </p>
          {inviteCode ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3 font-mono font-bold text-2xl text-center tracking-widest text-gray-900 select-all">
                  {inviteCode}
                </div>
                <Button variant="ghost" onClick={copyCode} className="shrink-0">
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </Button>
              </div>
              {copied && <p className="text-xs text-green-600 text-center">클립보드에 복사됐습니다!</p>}
              <Button variant="ghost" size="sm" onClick={generateCode} loading={generating}>
                새 코드 생성
              </Button>
            </div>
          ) : (
            <Button onClick={generateCode} loading={generating} className="w-full" size="lg">
              초대 코드 생성하기
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 코드로 연결 */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>② 초대 코드로 연결</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              {profile?.role === 'child' ? '부모님' : '자녀'}에게 받은 6자리 코드를 입력하세요.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="예: AB1C2D"
                value={inputCode}
                onChange={e => setInputCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="font-mono tracking-widest text-lg text-center"
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
