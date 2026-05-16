'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UserRole } from '@/types'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [role, setRole] = useState<UserRole>('child')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step === 1) { setStep(2); return }

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '가입에 실패했습니다.')
        setLoading(false)
        return
      }
      if (data.requiresConfirmation) {
        setSuccess('가입 확인 이메일을 발송했습니다. 받은편지함을 확인한 후 로그인해 주세요.')
        setLoading(false)
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('Failed to fetch') || msg.includes('json')) {
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.')
      } else {
        setError(msg)
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white font-black">함</div>
          <span className="text-2xl font-black tracking-tight text-gray-900">함께</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* 진행 표시 */}
          <div className="flex gap-2 mb-6">
            {[1, 2].map(n => (
              <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${step >= n ? 'bg-gray-900' : 'bg-gray-100'}`} />
            ))}
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {step === 1 ? '어떤 분이세요?' : '계정 만들기'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {step === 1 ? '역할을 선택하면 맞춤 기능을 제공해 드립니다.' : '마지막 단계입니다!'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: 'child', emoji: '👶', label: '자녀', desc: '부모님과 활동을\n함께 계획해요' },
                    { value: 'parent', emoji: '👴', label: '부모님', desc: '자녀가 준비한\n활동을 확인해요' },
                  ] as const).map(({ value, emoji, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        role === value
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="text-2xl mb-2">{emoji}</div>
                      <div className="font-bold text-sm">{label}</div>
                      <div className={`text-xs mt-1 whitespace-pre-line ${role === value ? 'text-white/70' : 'text-gray-400'}`}>{desc}</div>
                    </button>
                  ))}
                </div>
                <Input id="name" label="이름" placeholder="홍길동" value={name} onChange={e => setName(e.target.value)} required />
                <Button type="submit" className="w-full" size="lg" disabled={!name}>다음 →</Button>
              </>
            ) : (
              <>
                <Input id="email" type="email" label="이메일" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                <Input id="password" type="password" label="비밀번호" placeholder="8자 이상 입력" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
                {error && <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</div>}
                {success && <div className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">{success}</div>}
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="lg" className="flex-1" onClick={() => setStep(1)}>← 이전</Button>
                  <Button type="submit" loading={loading} size="lg" className="flex-1">가입 완료</Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-gray-900 font-semibold hover:underline">로그인</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
