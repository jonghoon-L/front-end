import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function MentoringSongPage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/teach.jpg"
        heroStyle={{ backgroundPosition: "center 55%" }}
        lines={[
          "로드맵이 자랑하는",
          "1:1 상담 관리 선생님을 소개합니다",
        ]}
        crumbs={[
          { label: "1:1 멘토.플랜.학업관리" },
          { label: "1:1 상담 관리 T 소개", href: "/mentoring/song" },
        ]}
      />

      <section
        className="w-full px-4 py-16 pt-0 md:px-6 lg:px-8"
        style={{ marginTop: "80px" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="motion-rise mb-20 mt-0 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            <span className="block">실제 경험으로 말하는 입시 전략가 선생님과 함께</span>
            <span className="block">최고의 학습 컨설팅을 경험해보세요</span>
          </h2>

          <Image
            src="/images/about/t_introduction.png"
            alt="송의준 선생님 소개"
            width={1920}
            height={1080}
            className="mx-auto h-auto w-full max-w-3xl"
            priority
          />
        </div>
      </section>
    </main>
  );
}
