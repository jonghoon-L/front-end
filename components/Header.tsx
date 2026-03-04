'use client'

import Link from "next/link";
import { useState } from 'react'
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

/** 마침표(.)를 가운뎃점(·)으로 변환하여 가독성 향상 */
function displayLabel(label: string): string {
  return label.replace(/\./g, '·')
}

/** 서브 메뉴 라벨에서 "(1) ", "(2) " 등 번호 기호 제거 */
function displaySubLabel(label: string): string {
  return label.replace(/^\(\d+\)\s*/, '')
}

const infoMenus: Menu[] = [
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
  },
  {
    label: '이용 후기',
    href: '/reviews/register',
  },
  {
    label: '게시판',
    href: '/board/study-materials',
  },
]

const ctaMenus: { label: string; href: string }[] = [
  { label: '상담 신청', href: '/consulting' },
  { label: '등록 예약', href: '/reservation' },
]

export default function Header() {
  const [openMobile, setOpenMobile] = useState(false)
  const [openMobileMenu, setOpenMobileMenu] = useState<number | null>(null)

  return (
    <header
      className={[
        'sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 text-gray-900',
      ].join(' ')}
    >
      <div className="mx-auto w-full max-w-[1600px] px-6 lg:px-12 py-3 flex items-center justify-between gap-6">
        {/* [좌측] 로고 */}
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0"
          aria-label="로드맵 홈"
        >
          <Image
            src="/images/logo.png"
            alt="로드맵"
            width={196}
            height={56}
            className="h-14 w-auto"
            priority
          />
          <div className="flex flex-col mt-1.5">
            <span className="text-xs text-gray-500 leading-tight">
              입시관리형 독서실
            </span>
            <span className="text-2xl font-bold text-gray-800 leading-tight tracking-tight">
              로드맵
            </span>
          </div>
        </Link>

        {/* [중앙] 정보성 메뉴 - 데스크톱 */}
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-10 xl:gap-12 px-8">
          {infoMenus.map((menu) => (
            <div key={menu.label} className="relative group">
              <Link
                href={menu.href}
                className="relative inline-block whitespace-nowrap text-base font-medium text-gray-700 transition-colors duration-200 hover:text-emerald-700 py-2"
              >
                {displayLabel(menu.label)}
                {/* 호버 시 밑줄 애니메이션 */}
                <span
                  className="absolute left-0 bottom-0 h-0.5 w-full bg-emerald-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"
                />
              </Link>

              {menu.subMenus && menu.subMenus.length > 0 && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 hidden group-hover:block z-50"
                  style={{ top: '100%' }}
                >
                  <div className="pt-5">
                    <div
                      className="min-w-[200px] bg-white flex flex-col overflow-hidden"
                      style={{
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.06)',
                      }}
                    >
                    {menu.subMenus.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="block px-5 py-3 text-base text-gray-800 hover:text-emerald-600 transition-colors duration-200 text-center whitespace-nowrap"
                      >
                        {displaySubLabel(sub.label)}
                      </Link>
                    ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* [우측] CTA 버튼 - 데스크톱 */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 ml-4">
          {ctaMenus.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center justify-center px-5 py-2.5 text-base font-semibold rounded-full border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* [모바일/태블릿] 햄버거 버튼 */}
        <button
          className="lg:hidden p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* [모바일/태블릿] 사이드바 형태 드로어 */}
      <div
        className={[
          'lg:hidden fixed inset-0 z-40 transition-opacity duration-300',
          openMobile ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-hidden={!openMobile}
      >
        {/* 오버레이 백드롭 */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => {
            setOpenMobile(false)
            setOpenMobileMenu(null)
          }}
        />

        {/* 사이드바 패널 - 우측에서 슬라이드 */}
        <aside
          className={[
            'absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col',
            'transition-transform duration-300 ease-out',
            openMobile ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <span className="text-lg font-bold text-gray-900">메뉴</span>
            <button
              className="p-2 rounded-lg hover:bg-gray-100"
              onClick={() => {
                setOpenMobile(false)
                setOpenMobileMenu(null)
              }}
              aria-label="메뉴 닫기"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            {infoMenus.map((menu, index) => {
              const hasSub = !!menu.subMenus?.length
              const expanded = openMobileMenu === index

              return (
                <div key={menu.label} className="border-b border-gray-100">
                  <div className="flex items-center justify-between gap-3 px-6 py-4">
                    <Link
                      href={menu.href}
                      onClick={() => {
                        if (!hasSub) {
                          setOpenMobile(false)
                          setOpenMobileMenu(null)
                        }
                      }}
                      className="text-base font-medium text-gray-800"
                    >
                      {displayLabel(menu.label)}
                    </Link>
                    {hasSub && (
                      <button
                        type="button"
                        className="p-2 -m-2"
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
                        'overflow-hidden transition-all duration-300 ease-out',
                        expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
                      ].join(' ')}
                    >
                      <div className="bg-gray-50 px-6 py-3 flex flex-col gap-1">
                        {menu.subMenus!.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => {
                              setOpenMobile(false)
                              setOpenMobileMenu(null)
                            }}
                            className="py-2.5 px-3 text-sm text-gray-600 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors"
                          >
                            {displaySubLabel(sub.label)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* CTA 버튼 영역 - 하단 고정 */}
            <div className="mt-6 px-6 pb-6 flex gap-3">
              {ctaMenus.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setOpenMobile(false)
                    setOpenMobileMenu(null)
                  }}
                  className="flex-1 inline-flex items-center justify-center py-3 rounded-full text-base font-semibold border-2 border-gray-800 text-gray-800 transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </header>
  )
}
