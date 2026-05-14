'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import type { Profile, HealthRecord } from '@/types'
import { Heart, Activity, Wind, Moon, Plus } from 'lucide-react'

interface Props {
  profile: Profile | null
  partner: Profile | null
  familyLinkId: string | null
  healthRecords: HealthRecord[]
}

const metricConfig = [
  { key: 'heart_rate', label: '심박수', unit: 'bpm', icon: Heart, color: 'text-red-500', bg: 'bg-red-50', normal: '60-100' },
  { key: 'steps', label: '걸음 수', unit: '보', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50', normal: '10,000+' },
  { key: 'oxygen_level', label: '산소 포화도', unit: '%', icon: Wind, color: 'text-cyan-500', bg: 'bg-cyan-50', normal: '95-100' },
  { key: 'sleep_hours', label: '수면 시간', unit: '시간', icon: Moon, color: 'text-purple-500', bg: 'bg-purple-50', normal: '7-9' },
] as const

type MetricKey = typeof metricConfig[number]['key']

export function HealthDashboard({ profile, partner, familyLinkId, healthRecords }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [values, setValues] = useState({ heart_rate: '', steps: '', oxygen_level: '', sleep_hours: '' })
  const [saving, setSaving] = useState(false)

  const latest = healthRecords[0]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!familyLinkId) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('health_records').insert({
      family_link_id: familyLinkId,
      heart_rate: values.heart_rate ? Number(values.heart_rate) : null,
      steps: values.steps ? Number(values.steps) : null,
      oxygen_level: values.oxygen_level ? Number(values.oxygen_level) : null,
      sleep_hours: values.sleep_hours ? Number(values.sleep_hours) : null,
    })
    setSaving(false)
    setShowForm(false)
    setValues({ heart_rate: '', steps: '', oxygen_level: '', sleep_hours: '' })
    window.location.reload()
  }

  const displayName = profile?.role === 'parent' ? '내' : (partner?.name ?? '부모님')

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">건강 확인</h1>
          <p className="text-sm text-gray-500 mt-0.5">{displayName} 건강 상태를 확인하세요</p>
        </div>
        {familyLinkId && (
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} />
            기록 추가
          </Button>
        )}
      </div>

      {/* 기록 입력 폼 */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>오늘 건강 기록</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {metricConfig.map(({ key, label, unit }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      {label} ({unit})
                    </label>
                    <Input
                      type="number"
                      placeholder={`예: ${key === 'heart_rate' ? '72' : key === 'steps' ? '8000' : key === 'oxygen_level' ? '98' : '7.5'}`}
                      value={values[key as MetricKey]}
                      onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button type="submit" loading={saving} className="flex-1">저장</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>취소</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 최신 지표 */}
      {!familyLinkId ? (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
          <CardContent className="py-10 text-center">
            <p className="text-gray-500 text-sm">가족을 연결하면 건강 기록을 공유할 수 있어요.</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => window.location.href = '/dashboard/family'}>
              가족 연결하기 →
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {metricConfig.map(({ key, label, unit, icon: Icon, color, bg, normal }) => {
            const val = latest ? latest[key as MetricKey] : null
            return (
              <Card key={key} className="border-0 shadow-sm">
                <CardContent className="pt-5 pb-4">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon size={20} className={color} />
                  </div>
                  <p className="text-2xl font-black text-gray-900">
                    {val != null ? val.toLocaleString('ko-KR') : '—'}
                    {val != null && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  <p className="text-xs text-gray-300 mt-1">정상: {normal} {unit}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* 기록 히스토리 */}
      {healthRecords.length > 0 && (
        <Card>
          <CardHeader><CardTitle>최근 기록</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthRecords.slice(0, 7).map(rec => (
                <div key={rec.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <p className="text-xs text-gray-400">
                    {new Date(rec.recorded_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
                  </p>
                  <div className="flex gap-4 text-xs">
                    {rec.heart_rate && <span className="text-red-500">❤️ {rec.heart_rate}</span>}
                    {rec.steps && <span className="text-blue-500">🚶 {rec.steps.toLocaleString('ko-KR')}</span>}
                    {rec.oxygen_level && <span className="text-cyan-500">💨 {rec.oxygen_level}%</span>}
                    {rec.sleep_hours && <span className="text-purple-500">🌙 {rec.sleep_hours}h</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
