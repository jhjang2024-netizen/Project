'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ActivityRecommendation } from '@/lib/claude/recommendations'
import { Check, X, Send } from 'lucide-react'

interface Props {
  recommendation: ActivityRecommendation
  familyLinkId?: string
}

const TYPE_LABEL: Record<string, string> = {
  movie: '영화', performance: '공연', restaurant: '맛집', travel: '여행', event: '행사',
}

export function ActivityCard({ recommendation: rec, familyLinkId }: Props) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'suggested' | 'dismissed'>('idle')

  async function handleSuggest() {
    if (!familyLinkId) return
    setStatus('saving')
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        family_link_id: familyLinkId,
        type: rec.type,
        title: rec.title,
        description: rec.description,
        venue: rec.venue,
        match_score: rec.matchScore,
        ai_reason: rec.reason,
        price_estimate: rec.priceEstimate,
      }),
    })
    setStatus(res.ok ? 'suggested' : 'idle')
  }

  if (status === 'dismissed') return null

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{rec.emoji}</span>
          <div>
            <p className="font-bold text-sm text-gray-900 leading-tight">{rec.title}</p>
            <p className="text-xs text-gray-400">{rec.venue}</p>
          </div>
        </div>
        <Badge variant="success">{rec.matchScore}% 일치</Badge>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed">{rec.reason}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {TYPE_LABEL[rec.type]} · 약 {rec.priceEstimate.toLocaleString('ko-KR')}원
        </span>
        {status === 'suggested' ? (
          <Badge variant="info"><Send size={10} /> 제안됨</Badge>
        ) : (
          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => setStatus('dismissed')} disabled={status === 'saving'}>
              <X size={12} />
            </Button>
            <Button size="sm" onClick={handleSuggest} loading={status === 'saving'}>
              <Send size={12} /> 제안하기
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
