import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ code: string }>
}

export default async function InvitePage({ params }: Props) {
  const { code } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/invite/${code}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: target } = await supabase
    .from('profiles')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .single()

  if (!target) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-4xl">❌</p>
          <h1 className="text-xl font-black text-gray-900">유효하지 않은 초대 코드</h1>
          <p className="text-sm text-gray-500">코드를 다시 확인해 주세요.</p>
          <a href="/dashboard" className="text-sm text-orange-500 font-semibold">대시보드로 →</a>
        </div>
      </main>
    )
  }

  if (target.role === profile?.role) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-4xl">⚠️</p>
          <h1 className="text-xl font-black text-gray-900">연결할 수 없어요</h1>
          <p className="text-sm text-gray-500">같은 역할(부모/자녀)끼리는 연결할 수 없어요.</p>
          <a href="/dashboard" className="text-sm text-orange-500 font-semibold">대시보드로 →</a>
        </div>
      </main>
    )
  }

  const childId = profile?.role === 'child' ? profile!.id : target.id
  const parentId = profile?.role === 'parent' ? profile!.id : target.id

  const admin = createAdminClient()
  await admin.from('family_links').insert({
    child_id: childId,
    parent_id: parentId,
    status: 'accepted',
  })

  // 양쪽에 알림 생성
  await admin.from('notifications').insert([
    {
      user_id: user.id,
      type: 'family_invite',
      title: '가족 연결 완료!',
      body: `${target.name}님과 연결됐습니다.`,
      data: {},
    },
    {
      user_id: target.user_id,
      type: 'family_invite',
      title: '가족 연결 완료!',
      body: `${profile?.name}님과 연결됐습니다.`,
      data: {},
    },
  ])

  redirect('/dashboard/family')
}
