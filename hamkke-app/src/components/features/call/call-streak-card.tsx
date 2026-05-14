'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CallPopup } from './call-popup'
import { Phone } from 'lucide-react'

interface Props {
  streakDay: number
  partnerName: string
}

export function CallStreakCard({ streakDay, partnerName }: Props) {
  const [showPopup, setShowPopup] = useState(false)

  return (
    <>
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-0 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{streakDay > 0 ? '🔥' : '📞'}</span>
                <span className="text-sm font-semibold text-white/70">안부 전화</span>
              </div>
              <p className="text-3xl font-black">
                {streakDay > 0 ? `${streakDay}일 연속` : '아직 기록 없음'}
              </p>
              <p className="text-sm text-white/55 mt-1">
                {streakDay > 0
                  ? `${partnerName}님과 ${streakDay}일째 연속 통화 중`
                  : `${partnerName}님께 안부 전화를 드려보세요`}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowPopup(true)}
              className="shrink-0"
            >
              <Phone size={15} />
              지금 전화
            </Button>
          </div>
        </CardContent>
      </Card>

      <CallPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        partnerName={partnerName}
        streakDay={streakDay}
      />
    </>
  )
}
