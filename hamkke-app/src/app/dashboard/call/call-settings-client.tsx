'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import type { CallLog, CallSettings } from '@/types'
import { Phone, Bell, Flame } from 'lucide-react'

interface Props {
  familyLinkId: string | null
  callSettings: CallSettings | null
  callLogs: CallLog[]
}

export function CallSettingsClient({ familyLinkId, callSettings, callLogs }: Props) {
  const [notifyTime, setNotifyTime] = useState(callSettings?.notify_time ?? '19:00')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!familyLinkId) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('call_settings').upsert({
      family_link_id: familyLinkId,
      notify_time: notifyTime,
      is_active: true,
    }, { onConflict: 'family_link_id' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const currentStreak = callLogs.length > 0 ? callLogs[0].streak_day : 0

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900">안부 전화</h1>
        <p className="text-sm text-gray-500 mt-0.5">연속 통화 기록과 알림을 관리하세요</p>
      </div>

      {/* 스트릭 카드 */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Flame size={32} className="text-orange-400" />
            <div>
              <p className="text-3xl font-black">{currentStreak}일 연속</p>
              <p className="text-sm text-white/60">현재 연속 통화 기록</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 알림 설정 */}
      {familyLinkId ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-orange-500" />
              <CardTitle>알림 시간 설정</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">매일 설정한 시간에 안부 전화 알림을 보내드려요.</p>
            <div className="flex gap-3">
              <Input
                type="time"
                value={notifyTime}
                onChange={e => setNotifyTime(e.target.value)}
                className="w-40"
              />
              <Button onClick={handleSave} loading={saving}>
                {saved ? '저장됨 ✓' : '저장'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
          <CardContent className="py-10 text-center">
            <p className="text-gray-500 text-sm">가족을 먼저 연결해야 알림을 설정할 수 있어요.</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => window.location.href = '/dashboard/family'}>
              가족 연결하기 →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 통화 기록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone size={18} className="text-gray-500" />
            <CardTitle>최근 통화 기록</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {callLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">📞</p>
              <p className="text-sm">아직 통화 기록이 없어요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {callLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📞</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(log.called_at)}</p>
                      <p className="text-xs text-gray-400">
                        {log.duration_seconds
                          ? `${Math.floor(log.duration_seconds / 60)}분 ${log.duration_seconds % 60}초`
                          : '기록 없음'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame size={14} />
                    <span className="text-sm font-bold">{log.streak_day}일</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
