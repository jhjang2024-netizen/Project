import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'env vars missing', url: !!url, key: !!key })
  }

  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    const text = await res.text()
    let body: unknown
    try { body = JSON.parse(text) } catch { body = text }
    return NextResponse.json({ status: res.status, url, keyPrefix: key.slice(0, 20), body })
  } catch (e) {
    return NextResponse.json({ fetchError: String(e) })
  }
}
