import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function NStudentTimetablePage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/hi/hi_p9.jpg"
        heroStyle={{ backgroundPosition: "center 65%" }}
        lines={["로드맵 N수생 전용관", "운영 시간 안내"]}
        crumbs={[
          { label: "로드맵 N수생 전용관" },
          { label: "시간표", href: "/n-student/timetable" },
        ]}
      />

      <section
        className="w-full px-4 py-12 pt-0 md:px-6 lg:px-8"
        style={{ marginTop: "80px" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="motion-rise mb-8 mt-0 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            <span className="block">N수관은 항시</span>
            <span className="block">아래의 시간표에 따라 운영됩니다</span>
          </h2>

          <Image
            src="/images/about/n_timetable.png"
            alt="로드맵 N수생 전용관 시간표"
            width={1920}
            height={1080}
            className="motion-rise motion-delay-1 h-auto w-full"
            priority
          />
        </div>
      </section>
    </main>
  );
}
