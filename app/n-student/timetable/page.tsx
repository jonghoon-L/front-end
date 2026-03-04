import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function NStudentTimetablePage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p7.jpg"
        lines={[
          "로드맵 N수생 전용관 시간표",
        ]}
        crumbs={[
          { label: "로드맵 N수생 전용관" },
          { label: "시간표", href: "/n-student/timetable" },
        ]}
      />

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <Image
            src="/images/about/n_timetable.png"
            alt="로드맵 N수생 전용관 시간표"
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
