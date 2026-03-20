import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function High2High3TimetablePage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/hi/hi_p7.jpg"
        lines={["로드맵 고2·고3 전용관", "운영 시스템 안내"]}
        heroStyle={{ backgroundPosition: "center 65%" }}
        crumbs={[
          { label: "로드맵 고2·고3 전용관" },
          { label: "시간표 및 관리시스템", href: "/high2-high3/timetable" },
        ]}
      />

      <section
        className="w-full px-4 py-12 pt-0 md:px-6 lg:px-8"
        style={{ marginTop: "80px" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="motion-rise mb-8 mt-0 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            <span className="block">하이엔드관은 학기 중</span>
            <span className="block">아래의 시간표에 따라 운영됩니다</span>
          </h2>

          <Image
            src="/images/about/h_timetable.png"
            alt="로드맵 고2·고3 전용관 학기 중 시간표"
            width={1920}
            height={1080}
            className="motion-rise motion-delay-1 h-auto w-full"
            priority
          />

          <h2 className="motion-rise mb-8 mt-16 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            <span className="block">여름·겨울 캠프 기간에는</span>
            <span className="block">아래의 시간표에 따라 운영됩니다</span>
          </h2>

          <Image
            src="/images/about/camp_timetable.png"
            alt="로드맵 고2·고3 전용관 여름·겨울 시간표"
            width={1920}
            height={1080}
            className="motion-rise motion-delay-1 h-auto w-full"
          />

          {/* 안내 문구 CTA (관리시스템 페이지와 동일 스타일) */}
          <div className="motion-rise motion-delay-2 mb-12 mt-24 text-center md:mt-28 md:mb-16">
            <p className="text-lg font-medium text-gray-600 md:text-xl">더 자세한 관리시스템 정보는</p>
            <p className="mt-1 text-2xl font-extrabold text-gray-900 md:text-3xl">
              하단의 안내 책자 보기 버튼을 클릭해 확인해주세요
            </p>
          </div>

          {/* 안내 책자 보기 버튼 */}
          <div className="motion-rise motion-delay-3 flex flex-wrap justify-center gap-4">
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
