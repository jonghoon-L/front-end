import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function High2High3PricePage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/hi/hi_p14.jpg"
        lines={["로드맵 고2·고3 전용관", "이용료 및 환불 규정 안내"]}
        crumbs={[
          { label: "로드맵 고2·고3 전용관" },
          { label: "이용료 및 환불 규정", href: "/high2-high3/price" },
        ]}
      />

      <section
        className="w-full px-4 py-12 pt-0 md:px-6 lg:px-8"
        style={{ marginTop: "80px" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="motion-rise mb-12 mt-0 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl md:mb-16">
            <span className="block">하이엔드관 이용료 및 환불 규정은</span>
            <span className="block">다음과 같습니다</span>
          </h2>

          <div className="space-y-20">
            <div>
              <p className="mb-5 text-center text-2xl font-bold text-violet-700 md:text-3xl">이용료 안내</p>
              <Image
                src="/images/about/h_price.png"
                alt="로드맵 고2.고3 전용관 이용료 안내"
                width={1920}
                height={1080}
                className="motion-rise motion-delay-1 h-auto w-full"
                priority
              />
            </div>

            <div>
              <p className="mb-5 text-center text-2xl font-bold text-violet-700 md:text-3xl">환불 규정</p>
              <Image
                src="/images/about/h_refund.png"
                alt="로드맵 고2.고3 전용관 환불 규정 안내"
                width={1920}
                height={1080}
                className="motion-rise motion-delay-2 h-auto w-full"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
