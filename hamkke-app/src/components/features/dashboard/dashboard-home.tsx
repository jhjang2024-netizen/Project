'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ActivityCard } from './activity-card'
import { ParentApprovals } from './parent-approvals'
import { CallStreakCard } from '../call/call-streak-card'
import type { Profile, FamilyLink, Activity, CallLog } from '@/types'
import type { ActivityRecommendation } from '@/lib/claude/recommendations'
import { Sparkles, RefreshCw } from 'lucide-react'

interface Props {
  profile: Profile | null
  familyLinks: FamilyLink[]
  recentActivities: Activity[]
  suggestedActivities: Activity[]
  callLogs: CallLog[]
}

export function DashboardHome({ profile, familyLinks, recentActivities, suggestedActivities, callLogs }: Props) {
  const [recommendations, setRecommendations] = useState<ActivityRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const partnerLink = familyLinks[0]
  const partner = partnerLink
    ? (profile?.role === 'child' ? partnerLink.parent : partnerLink.child)
    : null

  const currentStreak = callLogs.length > 0 ? callLogs[0].streak_day : 0
  const isParent = profile?.role === 'parent'

  const recentTypes = recentActivities.slice(0, 5).map(a =>
    ({ movie: '영화', performance: '공연', restaurant: '맛집', travel: '여행', event: '행사' })[a.type]
  ).filter(Boolean) as string[]

  async function fetchRecommendations() {
    if (!profile || !partner) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: profile.role === 'child' ? profile.name : partner.name,
          parentName: profile.role === 'parent' ? profile.name : partner.name,
          preferences: recentTypes.length ? recentTypes : ['영화', '한식', '가족여행'],
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setRecommendations(data.recommendations)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '추천을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '안녕하세요' : '좋은 저녁이에요'

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* 인사 */}
      <div>
        <p className="text-sm text-gray-500">{greeting} 👋</p>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 mt-0.5">
          {profile?.name ?? ''}님
        </h1>
        {isParent && (
          <p className="text-xs text-orange-500 font-semibold mt-0.5">부모님 계정</p>
        )}
      </div>

      {/* 가족 연결 없을 때 */}
      {familyLinks.length === 0 && (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
          <CardContent className="pt-6 text-center py-10">
            <div className="text-4xl mb-3">👨‍👩‍👧</div>
            <p className="font-bold text-gray-900 mb-1">가족을 연결해 보세요</p>
            <p className="text-sm text-gray-500 mb-4">
              {isParent ? '자녀와 연결하면 활동 제안을 받을 수 있어요.' : '부모님과 연결하면 AI 추천이 시작됩니다.'}
            </p>
            <Button href="/dashboard/family" variant="ghost" size="sm">가족 연결하기 →</Button>
          </CardContent>
        </Card>
      )}

      {/* 안부 전화 스트릭 */}
      {partner && (
        <CallStreakCard
          streakDay={currentStreak}
          partnerName={partner.name}
          familyLinkId={partnerLink.id}
        />
      )}

      {/* 부모님: 승인 대기 활동 */}
      {isParent && suggestedActivities.length > 0 && (
        <ParentApprovals activities={suggestedActivities} />
      )}

      {/* 자녀: AI 추천 섹션 */}
      {!isParent && partner && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-orange-500" />
                <CardTitle>AI 맞춤 추천</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchRecommendations}
                loading={loading}
              >
                <RefreshCw size={14} />
                {recommendations.length ? '새로 받기' : '추천 받기'}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {profile?.name}님과 {partner.name}님의 취향을 분석해요 · 마음에 들면 부모님께 제안해보세요
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</div>
            )}
            {recommendations.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">✨</p>
                <p className="text-sm">버튼을 눌러 맞춤 추천을 받아보세요</p>
              </div>
            )}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            )}
            {recommendations.length > 0 && !loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.map((rec, i) => (
                  <ActivityCard key={i} recommendation={rec} familyLinkId={partnerLink?.id} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 부모님: 대신 간단한 안내 */}
      {isParent && partner && suggestedActivities.length === 0 && (
        <Card className="border-dashed border-2 border-gray-100 bg-gray-50/50">
          <CardContent className="py-10 text-center">
            <div className="text-3xl mb-3">✨</div>
            <p className="font-semibold text-gray-700 mb-1">{partner.name}님의 제안을 기다리는 중이에요</p>
            <p className="text-sm text-gray-400">자녀가 활동을 제안하면 여기서 확인하고 수락할 수 있어요</p>
          </CardContent>
        </Card>
      )}

      {/* 최근 활동 */}
      {recentActivities.filter(a => a.status !== 'suggested').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.filter(a => a.status !== 'suggested').slice(0, 5).map(act => (
                <div key={act.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="text-xl">
                    {act.type === 'movie' ? '🎬' : act.type === 'performance' ? '🎭' :
                     act.type === 'restaurant' ? '🍽️' : act.type === 'travel' ? '✈️' : '🎪'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{act.title}</p>
                    <p className="text-xs text-gray-400">{act.venue}</p>
                  </div>
                  <Badge variant={act.status === 'approved' ? 'success' : act.status === 'rejected' ? 'danger' : 'default'}>
                    {act.status === 'approved' ? '수락됨' : act.status === 'rejected' ? '거절됨' : '완료'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 빠른 링크 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/dashboard/call',   emoji: '📞', label: '안부 전화 설정' },
          { href: '/dashboard/health', emoji: '❤️', label: '건강 확인' },
          { href: '/dashboard/family', emoji: '👨‍👩‍👧', label: '가족 관리' },
          { href: '/dashboard/notifications', emoji: '🔔', label: '알림' },
        ].map(({ href, emoji, label }) => (
          <a
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-xs font-semibold text-gray-700 text-center">{label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
