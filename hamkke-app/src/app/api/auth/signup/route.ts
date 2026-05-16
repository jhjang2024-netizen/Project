import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { email, password, name, role } = await req.json()
  if (!email || !password || !name || !role)
    return NextResponse.json({ error: '필수 정보가 누락됐습니다.' }, { status: 400 })

  const supabase = await createClient()
  const admin = createAdminClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered'))
      return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // admin으로 profile 즉시 생성 (이메일 인증 여부와 무관하게)
  if (data.user) {
    await admin.from('profiles').upsert(
      { user_id: data.user.id, name, role },
      { onConflict: 'user_id' }
    )
  }

  return NextResponse.json({
    success: true,
    requiresConfirmation: !data.session,
  })
}
