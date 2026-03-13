import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function High2High3TimetablePage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/hi/hi_p7.jpg"
        lines={["로드맵 고2·고3 전용관", "운영 시간 안내"]}
        heroStyle={{ backgroundPosition: "center 65%" }}
        crumbs={[
          { label: "로드맵 고2·고3 전용관" },
          { label: "시간표", href: "/high2-high3/timetable" },
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

          <h2 className="motion-rise mb-8 mt-56 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
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
        </div>
      </section>
    </main>
  );
}
