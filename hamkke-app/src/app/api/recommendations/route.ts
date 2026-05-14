import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRecommendations } from '@/lib/claude/recommendations'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  try {
    const recommendations = await generateRecommendations(body)
    return NextResponse.json({ recommendations })
  } catch (err) {
    console.error('Recommendation error:', err)
    return NextResponse.json({ error: '추천 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
