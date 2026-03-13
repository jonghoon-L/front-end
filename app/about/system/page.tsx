import PageHero from "@/components/PageHero";
import Image from "next/image";

const SYSTEM_CARDS = [
  {
    number: "01",
    title: "빈틈없는<br/>토탈 케어 밀착 관리",
    desc: "학습관 입실 시점부터 귀가시까지<br/>단 1분의 빈틈도 없이 오로지 학습에만 몰두하게 합니다",
    icon: "/images/icon-care.png",
  },
  {
    number: "02",
    title: "출결 & 학습 현황<br/>실시간 데이터화",
    desc: "출결 이벤트 및 의무학습 내 지도, 관리 내역들을 데이터화하여<br/>학생의 학업 상태를 확인할 수 있습니다",
    icon: "/images/icon-data.png",
  },
  {
    number: "03",
    title: "학생 분석 데이터 기반<br/>주간 학습 보고서",
    desc: "모든 학습 현황을 데이터화하고<br/>주 단위로 상세히 정리하여 매주 월요일에 제공됩니다",
    icon: "/images/icon-data.png",
  },
  {
    number: "04",
    title: "1:1 상담 관리<br/>시스템",
    desc: "ROADMAP 학습 컨설팅 전문 선생님과<br/>학업, 입시, 멘탈 관련 1:1 학업 상담을 경험할 수 있습니다",
    icon: "/images/icon-consult.png",
  },
];

export default function AboutSystemPage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/hi/hi_p10.jpg"
        heroStyle={{ backgroundPosition: "center 53%", backgroundSize: "100% auto" }}
        lines={[
          "로드맵만의 특화된",
          "관리시스템과 운영방식을 소개합니다",
        ]}
        crumbs={[
          { label: "ABOUT 로드맵" },
          { label: "관리시스템", href: "/about/system" },
        ]}
      />

      <section
        className="w-full px-4 pb-16 pt-0 md:px-6 md:pb-20 lg:px-8"
        style={{ marginTop: "80px" }}
      >
        <div className="mx-auto w-full max-w-7xl">
          {/* 상단 메인 타이틀 (위·아래 간격 동일: 56px) */}
          <h2 className="motion-rise mb-20 mt-0 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            <span className="block">학습부터 생활, 멘탈 케어까지</span>
            <span className="block">로드맵의 다각적 관리 시스템을 경험해보세요</span>
          </h2>

          {/* 카드 그리드 (최대 너비 950px, 수평 중앙) */}
          <div
            className="mx-auto grid max-w-[950px] grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:gap-12"
          >
            {SYSTEM_CARDS.map((card, index) => (
              <article
                key={card.number}
                className="motion-rise relative flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 pb-8 pt-12 text-center shadow-sm transition-shadow hover:shadow-md"
                style={{ animationDelay: `${180 + index * 150}ms` }}
              >
                {/* 번호 뱃지 */}
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1 text-sm font-bold text-emerald-700 shadow-sm">
                  {card.number}
                </span>
                <Image
                  src={card.icon}
                  alt={card.title.replace(/<br\s*\/?>/gi, " ")}
                  width={120}
                  height={120}
                  className="mb-6 h-24 w-24 object-contain md:h-28 md:w-28"
                />
                <h3
                  className="mt-0 text-xl font-bold text-emerald-700 md:text-2xl"
                  dangerouslySetInnerHTML={{ __html: card.title }}
                />
                <p
                  className="mt-4 text-center text-sm leading-relaxed text-gray-500"
                  dangerouslySetInnerHTML={{ __html: card.desc }}
                />
              </article>
            ))}
          </div>

          {/* 안내 문구 CTA */}
          <div className="motion-rise motion-delay-2 mb-12 mt-44 text-center md:mt-52 md:mb-16">
            <p className="text-lg font-medium text-gray-600 md:text-xl">더 자세한 관리시스템 정보는</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900 md:text-3xl">
              하단의 안내 책자 보기 버튼을 클릭해 확인해주세요
            </p>
          </div>

          {/* 안내 책자 보기 버튼 (다크 테마 고급화, 새 창 열기) */}
          <div className="motion-rise motion-delay-3 flex flex-wrap justify-center gap-4">
            <a
              href="https://heyzine.com/flip-book/451a350b6a.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-base font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:bg-slate-800"
            >
              N수생 전용관 안내 책자 보기
            </a>
            <a
              href="https://heyzine.com/flip-book/1ed06be78d.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-base font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:bg-slate-800"
            >
              고2·고3 전용관 안내 책자 보기
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
