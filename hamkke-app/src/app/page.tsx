import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-black text-sm">함</div>
          <span className="text-xl font-black tracking-tight">함께</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
              로그인
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary" size="sm">
              무료 시작하기
            </Button>
          </Link>
        </div>
      </header>

      {/* 히어로 */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          <span className="text-xs font-semibold px-3 py-1.5 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">🏆 앱스토어 4.9★</span>
          <span className="text-xs font-semibold px-3 py-1.5 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">👨‍👩‍👧 38,000+ 가족</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] mb-6 max-w-3xl">
          부모님과 함께,<br />
          <em className="not-italic text-white/70">더 특별한 순간들</em>
        </h1>
        <p className="text-lg md:text-xl text-white/65 leading-relaxed mb-10 max-w-xl">
          AI가 두 분의 취향을 분석해 영화, 여행, 공연을 추천합니다.<br className="hidden md:block" />
          안부 전화 알림, 건강 모니터링, 택시 호출까지 한 번에.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 focus-visible:ring-white font-bold">
              지금 무료로 시작하기
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="ghost" className="border-white/25 text-white hover:bg-white/10 hover:text-white">
              로그인
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-white/35">신용카드 불필요 · 핵심 기능 영구 무료</p>
      </section>

      {/* 기능 소개 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border-t border-white/10">
        {[
          { emoji: '🎬', title: 'AI 맞춤 추천', desc: '영화·공연·여행 취향 분석' },
          { emoji: '📞', title: '안부 전화 알림', desc: '매일 자동 팝업, 한 탭으로 연결' },
          { emoji: '❤️', title: '건강 모니터링', desc: '심박수·걸음수 실시간 확인' },
          { emoji: '🚖', title: '택시 대리 호출', desc: '부모님 위치에서 카카오택시' },
        ].map(({ emoji, title, desc }) => (
          <div key={title} className="bg-gray-900 px-6 py-8 text-center">
            <div className="text-3xl mb-3">{emoji}</div>
            <div className="text-sm font-bold mb-1">{title}</div>
            <div className="text-xs text-white/45">{desc}</div>
          </div>
        ))}
      </section>
    </main>
  )
}
