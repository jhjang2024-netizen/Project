'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Phone, PhoneOff, X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  partnerName: string
  streakDay: number
}

type Screen = 'alert' | 'calling' | 'done'

export function CallPopup({ isOpen, onClose, partnerName, streakDay }: Props) {
  const [screen, setScreen] = useState<Screen>('alert')
  const [callSeconds, setCallSeconds] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setScreen('alert')
      setCallSeconds(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (screen !== 'calling') return
    const timer = setInterval(() => setCallSeconds(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [screen])

  if (!isOpen) return null

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  function handleCall() {
    setScreen('calling')
  }

  function handleEnd() {
    setScreen('done')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        {screen === 'alert' && (
          <div className="p-8 text-center space-y-6">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <div className="space-y-2">
              <div className="text-5xl mb-4">📞</div>
              <h2 className="text-xl font-black text-gray-900">{partnerName}님께 전화하기</h2>
              <p className="text-sm text-gray-500">
                {streakDay > 0
                  ? `${streakDay}일 연속 통화 중이에요! 오늘도 연락해 보세요.`
                  : '오늘 첫 번째 안부 전화를 드려보세요.'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={onClose}>
                취소
              </Button>
              <Button className="flex-1" onClick={handleCall}>
                <Phone size={16} />
                전화하기
              </Button>
            </div>
          </div>
        )}

        {screen === 'calling' && (
          <div className="p-8 text-center space-y-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div className="space-y-2">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">👴</span>
              </div>
              <h2 className="text-xl font-black">{partnerName}님</h2>
              <p className="text-sm text-white/60">통화 중...</p>
              <p className="text-2xl font-mono font-bold">{formatTime(callSeconds)}</p>
            </div>
            <Button
              variant="secondary"
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-red-500 hover:bg-red-600 text-white border-0"
              onClick={handleEnd}
            >
              <PhoneOff size={24} />
            </Button>
          </div>
        )}

        {screen === 'done' && (
          <div className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <div className="text-5xl mb-4">🔥</div>
              <h2 className="text-xl font-black text-gray-900">통화 완료!</h2>
              <p className="text-sm text-gray-500">
                {partnerName}님과 {formatTime(callSeconds)} 통화했어요.
              </p>
              <div className="bg-orange-50 rounded-2xl py-4 px-6 mt-4">
                <p className="text-3xl font-black text-orange-500">{streakDay + 1}일 연속</p>
                <p className="text-xs text-orange-400 mt-1">연속 통화 기록 달성!</p>
              </div>
            </div>
            <Button className="w-full" onClick={onClose}>
              확인
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
