import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { ids } = await req.json()
  const admin = createAdminClient()

  if (ids && ids.length > 0) {
    await admin.from('notifications').update({ read: true }).in('id', ids).eq('user_id', user.id)
  } else {
    await admin.from('notifications').update({ read: true }).eq('user_id', user.id)
  }

  return NextResponse.json({ success: true })
}
