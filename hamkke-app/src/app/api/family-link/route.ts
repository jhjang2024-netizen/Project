import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { inviteCode } = await req.json()
  if (!inviteCode) return NextResponse.json({ error: '초대 코드가 없습니다.' }, { status: 400 })

  const admin = createAdminClient()

  const { data: myProfile } = await admin
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!myProfile) return NextResponse.json({ error: '프로필을 찾을 수 없습니다.' }, { status: 404 })

  const { data: targetProfile } = await admin
    .from('profiles').select('*').eq('invite_code', inviteCode.trim().toUpperCase()).single()
  if (!targetProfile) return NextResponse.json({ error: '유효하지 않은 초대 코드예요.' }, { status: 404 })

  if (targetProfile.role === myProfile.role)
    return NextResponse.json({ error: '같은 역할(부모/자녀)끼리는 연결할 수 없어요.' }, { status: 400 })

  if (targetProfile.id === myProfile.id)
    return NextResponse.json({ error: '본인의 코드는 사용할 수 없어요.' }, { status: 400 })

  const childId = myProfile.role === 'child' ? myProfile.id : targetProfile.id
  const parentId = myProfile.role === 'parent' ? myProfile.id : targetProfile.id

  const { data: existing } = await admin
    .from('family_links').select('id').eq('child_id', childId).eq('parent_id', parentId).single()
  if (existing) return NextResponse.json({ error: '이미 연결된 가족입니다.' }, { status: 409 })

  const { error } = await admin.from('family_links').insert({
    child_id: childId,
    parent_id: parentId,
    status: 'accepted',
  })
  if (error) return NextResponse.json({ error: '연결에 실패했습니다.' }, { status: 500 })

  return NextResponse.json({ success: true })
}
