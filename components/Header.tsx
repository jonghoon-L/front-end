'use client'

import Link from "next/link";
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from "next/image";

type SubMenu = {
  label: string
  href: string
}

type Menu = {
  label: string
  href: string
  subMenus?: SubMenu[]
}

const menus: Menu[] = [
  {
    label: 'ABOUT 로드맵',
    href: '/about/roadmap',
    subMenus: [
      { label: '(1) ABOUT 로드맵', href: '/about/roadmap' },
      { label: '(2) 일반 관리형 독서실과의 차별화', href: '/about/diff' },
      { label: '(3) 관리시스템', href: '/about/system' },
      { label: '(4) 관리T 소개', href: '/about/teacher' },
    ],
  },
  {
    label: '로드맵 고2.고3 전용관',
    href: '/high2-high3/facility',
    subMenus: [
      { label: '시설 사진', href: '/high2-high3/facility' },
      { label: '시간표', href: '/high2-high3/timetable' },
      { label: '이용료', href: '/high2-high3/price' },
    ],
  },
  {
    label: '로드맵 N수생 전용관',
    href: '/n-student/facility',
    subMenus: [
      { label: '시설 사진', href: '/n-student/facility' },
      { label: '시간표', href: '/n-student/timetable' },
      { label: '이용료', href: '/n-student/price' },
      { label: '더프 모의고사 + 교육청', href: '/n-student/mock-test' },
    ],
  },
  {
    label: '1:1 멘토.플랜.학업관리',
    href: '/mentoring/management',
    subMenus: [
      { label: '관리 내용', href: '/mentoring/management' },
      { label: '1:1 전담 관리T 송의준', href: '/mentoring/song' },
      { label: '기존 상담 자료 등록', href: '/mentoring/consulting-register' },
      { label: '이용료', href: '/mentoring/price' },
    ],
  },
  {
    label: '명예의 전당',
    href: '/hall-of-fame/upload',
    subMenus: [{ label: '입시 결과 파일 등록', href: '/hall-of-fame/upload' }],
  },
  {
    label: '이용 후기',
    href: '/reviews/register',
    subMenus: [{ label: '기존 이용 후기 등록', href: '/reviews/register' }],
  },
  {
    label: '상담 신청 / 등록 예약',
    href: '/consulting',
  },
  {
    label: '게시판',
    href: '/board/study-materials',
    subMenus: [{ label: '학업자료', href: '/board/study-materials' }],
  },
]

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  const [scrolled, setScrolled] = useState(false)
  const [openMobile, setOpenMobile] = useState(false)
  const [openMobileMenu, setOpenMobileMenu] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  const solid =
    isMobile === null
      ? openMobile
      : !isMobile || !isHome || scrolled || openMobile

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
        solid
          ? 'bg-white/95 backdrop-blur border-b border-gray-200 text-gray-900'
          : 'bg-transparent text-white',
      ].join(' ')}
    >
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-8">
        <Link href="/" className="shrink-0 whitespace-nowrap" aria-label="로드맵 홈">
          <Image
            src="/images/logo.png"
            alt="로드맵"
            width={112}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm">
          {menus.map((menu) => (
            <div key={menu.label} className="relative group">
              <Link
                className={[
                  'whitespace-nowrap transition-colors',
                  solid ? 'hover:text-blue-700' : 'hover:text-white/80',
                ].join(' ')}
                href={menu.href}
              >
                {menu.label}
              </Link>

              {menu.subMenus && menu.subMenus.length > 0 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 hidden group-hover:block pt-4 z-50">
                  <div className="w-64 bg-white shadow-lg border border-gray-100 py-2 text-gray-900">
                    {menu.subMenus.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="block px-5 py-2 text-sm hover:bg-gray-50"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <button
          className="lg:hidden p-2"
          onClick={() => {
            setOpenMobile((prev) => {
              const next = !prev
              if (!next) setOpenMobileMenu(null)
              return next
            })
          }}
          aria-label={openMobile ? '메뉴 닫기' : '메뉴 열기'}
        >
          {openMobile ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      <div
        className={[
          'lg:hidden bg-white border-b border-gray-200',
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
          openMobile ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <div className="px-6 py-4 text-gray-900">
            {menus.map((menu, index) => {
              const hasSub = !!menu.subMenus?.length
              const expanded = openMobileMenu === index

              return (
                <div key={menu.label} className="border-b border-gray-200 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={menu.href}
                      onClick={() => {
                        setOpenMobile(false)
                        setOpenMobileMenu(null)
                      }}
                      className="text-base"
                    >
                      {menu.label}
                    </Link>

                    {hasSub && (
                      <button
                        type="button"
                        className="p-1"
                        onClick={() =>
                          setOpenMobileMenu((prev) => (prev === index ? null : index))
                        }
                        aria-expanded={expanded}
                        aria-label={`${menu.label} 세부 메뉴 ${expanded ? '접기' : '열기'}`}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'}
                        >
                          <path
                            d="M6 9L12 15L18 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {hasSub && (
                    <div
                      className={[
                        'overflow-hidden transition-[max-height,opacity] duration-300 ease-out',
                        expanded ? 'max-h-72 opacity-100 mt-2' : 'max-h-0 opacity-0',
                      ].join(' ')}
                    >
                      <div className="pl-2 flex flex-col text-sm text-gray-700">
                        {menu.subMenus!.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => {
                              setOpenMobile(false)
                              setOpenMobileMenu(null)
                            }}
                            className="py-1.5"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
