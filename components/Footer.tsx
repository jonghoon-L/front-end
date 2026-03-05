"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const FOOTER_LINKS = [
  { href: "/#location", label: "위치 및 시설 안내" },
  { href: "/about/system", label: "관리시스템 안내" },
  { href: "/about/teacher", label: "관리 T 소개" },
] as const;

export default function Footer() {
  const router = useRouter();

  const handleTripleClick = (e: React.MouseEvent) => {
    if (e.detail === 3) {
      window.getSelection()?.removeAllRanges();
      router.push("/admin/login");
    }
  };

  return (
    <footer className="bg-[#2f2f2f] text-gray-200">
      {/* 상단 링크 바 */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {FOOTER_LINKS.map((link, i) => (
              <span key={link.href} className="contents">
                {i > 0 && <span className="text-white/30">|</span>}
                <Link
                  className="transition-colors duration-200 hover:text-white hover:underline underline-offset-4"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="mx-auto max-w-6xl px-6 pt-6 pb-12">
        <div className="grid gap-10 md:grid-cols-[260px_1fr] items-start">
          {/* 로고 영역 */}
          <div className="opacity-70 flex items-center gap-3 ml-6">
            <Image
              src="/logo.png"
              alt="로드맵"
              width={48}
              height={48}
              className="flex-shrink-0"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-white/80">입시관리형 독서실</span>
              <span className="font-bold text-3xl">로드맵</span>
            </div>
          </div>

          {/* 사업자 정보 - 좌우 2관 */}
          <div className="flex flex-col sm:flex-row gap-10 sm:gap-16 text-sm leading-7 text-white/70">
            {/* N수관 */}
            <div>
              <p className="font-medium text-white/90">[N수관]</p>
              <p>
                <span className="text-white/60">대표자:</span>{" "}
                <span
                  onClick={handleTripleClick}
                  className="cursor-default"
                >
                  장진웅
                </span>
              </p>
              <p>
                <span className="text-white/60">TEL:</span> 070-4833-5678
              </p>
              <p>
                <span className="text-white/60">사업자번호:</span>
              </p>
              <p className="whitespace-nowrap">
                <span className="text-white/60">주소:</span> 경기도 용인시 기흥구 동백중앙로 283 골드프라자 B동 10층
              </p>
            </div>
            {/* 하이엔드관 */}
            <div>
              <p className="font-medium text-white/90">[하이엔드관]</p>
              <p>
                <span className="text-white/60">대표자:</span> 김현정
              </p>
              <p>
                <span className="text-white/60">TEL:</span> 031-281-5678
              </p>
              <p>
                <span className="text-white/60">사업자번호:</span>
              </p>
              <p className="whitespace-nowrap">
                <span className="text-white/60">주소:</span> 경기도 용인시 기흥구 동백중앙로 283 골드프라자 A동 6층
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
