import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function High2High3TimetablePage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p7.jpg"
        lines={[
          "로드맵 고2.고3 전용관 시간표",
        ]}
        crumbs={[
          { label: "로드맵 고2.고3 전용관" },
          { label: "시간표", href: "/high2-high3/timetable" },
        ]}
      />

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <Image
            src="/images/about/h_timetable.png"
            alt="로드맵 고2.고3 전용관 시간표"
            width={1920}
            height={1080}
            className="h-auto w-full"
            priority
          />
        </div>
      </section>
    </main>
  );
}
