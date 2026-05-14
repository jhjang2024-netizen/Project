import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export interface RecommendationRequest {
  childName: string
  parentName: string
  parentAge?: number
  preferences?: string[]
  recentActivities?: string[]
}

export interface ActivityRecommendation {
  type: 'movie' | 'performance' | 'restaurant' | 'travel' | 'event'
  title: string
  description: string
  venue: string
  matchScore: number
  reason: string
  priceEstimate: number
  emoji: string
}

export async function generateRecommendations(req: RecommendationRequest): Promise<ActivityRecommendation[]> {
  const prompt = `당신은 한국의 가족 동행 AI 플래너입니다.

자녀 이름: ${req.childName}
부모님 이름: ${req.parentName}
${req.parentAge ? `부모님 연령: ${req.parentAge}세` : ''}
${req.preferences?.length ? `부모님 선호도: ${req.preferences.join(', ')}` : ''}
${req.recentActivities?.length ? `최근 함께한 활동: ${req.recentActivities.join(', ')}` : ''}

위 정보를 바탕으로 ${req.childName}님과 ${req.parentName}님이 함께 즐길 수 있는 활동 4개를 추천해 주세요.
활동 종류: movie(영화), performance(공연/뮤지컬), restaurant(맛집), travel(여행), event(동네행사)

반드시 아래 JSON 형식으로만 답하세요:
[
  {
    "type": "movie",
    "title": "활동 이름",
    "description": "2-3문장 설명",
    "venue": "장소",
    "matchScore": 92,
    "reason": "이 활동을 추천하는 이유 1문장",
    "priceEstimate": 30000,
    "emoji": "🎬"
  }
]`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('AI 응답 파싱 실패')
  return JSON.parse(jsonMatch[0]) as ActivityRecommendation[]
}
