import PageHero from "@/components/PageHero";

export default function NStudentMockTestPage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p18.jpg"
        heroStyle={{ backgroundPosition: "center 80%" }}
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
            <span className="block">N수관은</span>
            <span className="block">수능 실전 대비 모의고사를 실시합니다</span>
          </h2>

          {/* API 경로로 로드 - 캐시 없이 항상 최신 이미지 */}
          <img
            src="/api/n-exam-image"
            alt="로드맵 N수생 전용관 교육청 + 더프 모의고사"
            className="motion-rise motion-delay-1 h-auto w-full"
            fetchPriority="high"
          />
        </div>
      </section>
    </main>
  );
}
