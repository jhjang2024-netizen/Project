'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUpAction(formData: {
  email: string
  password: string
  name: string
  role: string
}): Promise<{ error?: string; message?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: { data: { name: formData.name, role: formData.role } },
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.session) {
    return { message: '가입 확인 이메일을 발송했습니다. 이메일을 확인한 후 로그인해 주세요.' }
  }

  redirect('/dashboard')
}
