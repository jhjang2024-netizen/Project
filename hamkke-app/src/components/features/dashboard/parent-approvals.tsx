'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Activity } from '@/types'
import { Check, X, Sparkles } from 'lucide-react'

const TYPE_EMOJI: Record<string, string> = {
  movie: '🎬', performance: '🎭', restaurant: '🍽️', travel: '✈️', event: '🎪',
}
const TYPE_LABEL: Record<string, string> = {
  movie: '영화', performance: '공연', restaurant: '맛집', travel: '여행', event: '행사',
}

interface Props {
  activities: Activity[]
}

export function ParentApprovals({ activities }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(activities)
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  async function handleAction(activityId: string, status: 'approved' | 'rejected') {
    setLoading(prev => ({ ...prev, [activityId]: true }))
    await fetch(`/api/activities/${activityId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setItems(prev => prev.filter(a => a.id !== activityId))
    setLoading(prev => ({ ...prev, [activityId]: false }))
    router.refresh()
  }

  if (items.length === 0) return null

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-orange-500" />
          <CardTitle>자녀가 제안한 활동</CardTitle>
          <Badge variant="warning">{items.length}개 대기</Badge>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">수락하면 함께할 활동 목록에 추가돼요</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(act => (
          <div key={act.id} className="bg-white rounded-xl p-4 border border-orange-100 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{TYPE_EMOJI[act.type] ?? '🎯'}</span>
                <div>
                  <p className="font-bold text-sm text-gray-900">{act.title}</p>
                  {act.venue && <p className="text-xs text-gray-400">{act.venue}</p>}
                </div>
              </div>
              <Badge variant="default">{TYPE_LABEL[act.type] ?? act.type}</Badge>
            </div>

            {act.ai_reason && (
              <p className="text-xs text-gray-500 leading-relaxed">{act.ai_reason}</p>
            )}

            <div className="flex items-center justify-between">
              {act.price_estimate ? (
                <span className="text-xs text-gray-400">
                  약 {act.price_estimate.toLocaleString('ko-KR')}원
                </span>
              ) : <span />}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction(act.id, 'rejected')}
                  disabled={loading[act.id]}
                >
                  <X size={14} />
                  거절
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAction(act.id, 'approved')}
                  loading={loading[act.id]}
                >
                  <Check size={14} />
                  수락
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
