import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#2f2f2f] text-gray-200">
      {/* 상단 링크 바 */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link className="hover:text-white" href="/location">
              위치 및 시설 안내
            </Link>
            <span className="text-white/30">|</span>
            <Link className="hover:text-white" href="/system">
              학습시스템 소개
            </Link>
            <span className="text-white/30">|</span>
            <Link className="hover:text-white" href="/pricing">
              자문실반 비용 안내
            </Link>
          </nav>
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[260px_1fr]">
          {/* 로고 영역 */}
          <div className="opacity-70">
            <div className="text-2xl font-bold">수능선배</div>
            <div className="mt-2 text-xs text-white/60">
              스파르타식 독학 재수 전문
            </div>
          </div>

          {/* 사업자 정보 */}
          <div className="text-sm leading-7 text-white/70">
            <p>
              <span className="text-white/60">대표자:</span> 고용범
            </p>
            <p>
              <span className="text-white/60">수능선배 학원 (TEL:</span>{" "}
              1668-5786<span className="text-white/60">)</span>
            </p>
            <p>
              <span className="text-white/60">사업자번호:</span> 329-95-01774
            </p>
            <p>
              <span className="text-white/60">학원등록번호:</span> 제14168호,
              제8432호
            </p>
            <p>
              <span className="text-white/60">주소:</span> 서울특별시 서초동
              1330-12 5층 수능선배
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
