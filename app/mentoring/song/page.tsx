import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function MentoringSongPage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p5.jpg"
        lines={[
          "로드맵만의 특화된 관리 시스템과 운영방식",
        ]}
        crumbs={[
          { label: "1:1 멘토.플랜.학업관리" },
          { label: "1:1 상담 관리 T 소개", href: "/mentoring/song" },
        ]}
      />

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <Image
            src="/images/about/songT.jpg"
            alt="송의준 선생님"
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
