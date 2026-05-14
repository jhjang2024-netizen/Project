import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: '함께 — 부모님과 더 특별한 순간들',
  description: 'AI가 부모님과 자녀의 일상을 자연스럽게 연결합니다. 여행, 공연, 식사, 안부 전화까지.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${notoSansKR.className} min-h-full`}>{children}</body>
    </html>
  )
}
