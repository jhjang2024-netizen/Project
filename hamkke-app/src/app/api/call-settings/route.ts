import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { familyLinkId, notifyTime } = await req.json()
  if (!familyLinkId) return NextResponse.json({ error: 'familyLinkId 필요' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('call_settings').upsert(
    { family_link_id: familyLinkId, notify_time: notifyTime, is_active: true },
    { onConflict: 'family_link_id' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
