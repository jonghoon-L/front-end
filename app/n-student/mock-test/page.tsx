import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function NStudentMockTestPage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p9.jpg"
        lines={["로드맵 N수생 전용관", "교육청 + 더프 모의고사"]}
        crumbs={[
          { label: "로드맵 N수생 전용관" },
          { label: "교육청 + 더프 모의고사", href: "/n-student/mock-test" },
        ]}
      />

      <section
        className="w-full px-4 py-12 pt-0 md:px-6 lg:px-8"
        style={{ marginTop: "80px" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="motion-rise mb-8 mt-0 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            <span className="block">N수관에서 수능 대비</span>
            <span className="block">모의고사를 시행할 수 있습니다</span>
          </h2>

          <Image
            src="/images/about/n_exam.png"
            alt="로드맵 N수생 전용관 교육청 + 더프 모의고사"
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
