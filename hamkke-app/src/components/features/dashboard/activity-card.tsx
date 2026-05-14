'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ActivityRecommendation } from '@/lib/claude/recommendations'
import { createClient } from '@/lib/supabase/client'
import { Check, X } from 'lucide-react'

interface Props {
  recommendation: ActivityRecommendation
  familyLinkId?: string
}

export function ActivityCard({ recommendation: rec, familyLinkId }: Props) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'rejected'>('idle')

  async function handleAction(action: 'approve' | 'reject') {
    if (!familyLinkId) return
    setStatus('saving')
    const supabase = createClient()
    await supabase.from('activities').insert({
      family_link_id: familyLinkId,
      type: rec.type,
      title: rec.title,
      description: rec.description,
      venue: rec.venue,
      match_score: rec.matchScore,
      ai_reason: rec.reason,
      price_estimate: rec.priceEstimate,
      status: action === 'approve' ? 'approved' : 'rejected',
    })
    setStatus(action === 'approve' ? 'saved' : 'rejected')
  }

  const typeLabel: Record<string, string> = {
    movie: '영화', performance: '공연', restaurant: '맛집', travel: '여행', event: '행사'
  }

  if (status === 'rejected') return null

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
          {typeLabel[rec.type]} · 약 {rec.priceEstimate.toLocaleString('ko-KR')}원
        </span>
        {status === 'saved' ? (
          <Badge variant="success"><Check size={10} /> 저장됨</Badge>
        ) : (
          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => handleAction('reject')} disabled={status === 'saving'}>
              <X size={12} />
            </Button>
            <Button size="sm" onClick={() => handleAction('approve')} loading={status === 'saving'}>
              <Check size={12} /> 저장
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
