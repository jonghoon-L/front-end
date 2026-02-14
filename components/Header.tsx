'use client'

import Link from "next/link";
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const communityItems = [
  { href: '/community/notice', label: '공지사항' },
  { href: '/community/story-pass', label: '합격생 이야기' },
  { href: '/community/story', label: '수능선배 이야기' },
  { href: '/community/faq', label: '자주 묻는 질문' },
]

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [openMobile, setOpenMobile] = useState(false)
  const [openCommunity, setOpenCommunity] = useState(false)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const solid =
    isMobile === null
      ? openMobile
      : (!isMobile || !isHome || scrolled || openMobile)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)') // lg 미만 = 모바일/태블릿
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
          solid
            ? 'bg-white/95 backdrop-blur border-b border-gray-200 text-gray-900'
            : 'bg-transparent text-white',
        ].join(' ')}
      >
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="font-bold text-xl">
            수능선배
          </Link>

          {/* 데스크탑 메뉴 */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link className={solid ? 'hover:text-blue-700' : 'hover:text-white/80'} href="/map">수능선배소개</Link>
            <Link className={solid ? 'hover:text-blue-700' : 'hover:text-white/80'} href="/winter">2026 윈터스쿨</Link>
            <Link className={solid ? 'hover:text-blue-700' : 'hover:text-white/80'} href="/mentor">담임멘토</Link>
            <Link className={solid ? 'hover:text-blue-700' : 'hover:text-white/80'} href="/system">학습시스템</Link>

            {/* 드롭다운 */}
            <div className="relative group">
              <Link className={solid ? 'hover:text-blue-700' : 'hover:text-white/80'} href="/community">커뮤니티</Link>

              <div className="absolute top-full left-1/2 -translate-x-1/2 hidden group-hover:block pt-6 z-50">
                <div className="w-56 bg-white shadow-lg border border-gray-100 py-2 text-gray-900">
                  <Link href="/community/notice" className="flex justify-center px-5 py-3 hover:bg-gray-50">공지사항</Link>
                  <Link href="/community/story-pass" className="flex justify-center px-5 py-3 hover:bg-gray-50">합격생 이야기</Link>
                  <Link href="/community/story" className="flex justify-center px-5 py-3 hover:bg-gray-50">수능선배 이야기</Link>
                  <Link href="/community/faq" className="flex justify-center px-5 py-3 hover:bg-gray-50">자주 묻는 질문</Link>
                </div>
              </div>
            </div>

            <Link className={solid ? 'hover:text-blue-700' : 'hover:text-white/80'} href="/inquiry">투자 문의</Link>
          </nav>

          {/* 데스크탑 버튼 */}
          <Link
            href="/apply"
            className={[
              'hidden lg:inline-flex px-4 py-2 rounded-lg transition-colors',
              solid ? 'bg-blue-800 text-white hover:bg-blue-900' : 'bg-white/15 text-white hover:bg-white/25 border border-white/30',
            ].join(' ')}
          >
            상담 신청하기
          </Link>

          {/* 모바일 햄버거 */}
          <button
            className="lg:hidden p-2"
            onClick={() => {
              setOpenMobile((v) => {
                const next = !v
                if (!next) setOpenCommunity(false) // 닫힐 때 하위도 닫기
                return next
              })
            }}
            aria-label={openMobile ? "메뉴 닫기" : "메뉴 열기"}
          >
            {openMobile ? (
              // X 아이콘
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              // 햄버거 아이콘
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M4 12H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M4 17H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
        
        {/* 모바일 / 태블릿 접히는 메뉴 */}
        <div
          className={[
            'lg:hidden bg-white border-b border-gray-200',
            'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
            openMobile ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          ].join(' ')}
        >
          <div className="overflow-hidden">
            <div className="px-6 py-6 text-gray-900">
              <MobileLink href="/map" onClick={() => setOpenMobile(false)} label="수능선배 소개" />
              <MobileLink href="/winter" onClick={() => setOpenMobile(false)} label="2026 윈터스쿨" />
              <MobileLink href="/mentor" onClick={() => setOpenMobile(false)} label="담임멘토 소개" />
              <MobileLink href="/system" onClick={() => setOpenMobile(false)} label="학습시스템" />
              {/* 커뮤니티 (아코디언) */}
              <div className="border-b border-gray-200 py-5">
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left text-lg"
                  onClick={() => setOpenCommunity((v) => !v)}
                  aria-expanded={openCommunity}
                  aria-controls="mobile-community"
                >
                  <span>커뮤니티</span>

                  {/* V(chevron) 버튼 */}
                  <span
                    className={[
                      'inline-flex items-center justify-center transition-transform duration-200',
                      openCommunity ? 'rotate-180' : 'rotate-0',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>

                {/* 하위 메뉴 펼침 영역 */}
                <div
                  id="mobile-community"
                  className={[
                    'overflow-hidden transition-[max-height,opacity] duration-300 ease-out',
                    openCommunity ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0',
                  ].join(' ')}
                >
                  <div className="overflow-hidden">
                    <div className="mt-3 pl-2 flex flex-col text-gray-700">
                      {communityItems.map((it) => (
                        <Link
                          key={it.href}
                          href={it.href}
                          onClick={() => {
                            setOpenMobile(false)
                            setOpenCommunity(false)
                          }}
                          className="py-2"
                        >
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <MobileLink href="/inquiry" onClick={() => setOpenMobile(false)} label="투자 문의" />

              <Link
                href="/apply"
                onClick={() => setOpenMobile(false)}
                className="mt-6 inline-flex w-full justify-center px-4 py-3 rounded-lg bg-blue-800 text-white"
              >
                상담 신청하기
              </Link>
            </div>
          </div>
        </div>

      </header>
    </>
  );
}

function MobileLink({
  href,
  label,
  onClick,
}: {
  href: string
  label: string
  onClick: () => void
}) {
  return (
    <div className="border-b border-gray-200 py-5">
      <Link href={href} onClick={onClick} className="text-lg block">
        {label}
      </Link>
    </div>
  )
}