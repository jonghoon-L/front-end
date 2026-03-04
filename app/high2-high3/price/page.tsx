import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function High2High3PricePage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p7.jpg"
        lines={[
          "로드맵 고2.고3 전용관 이용료 안내",
        ]}
        crumbs={[
          { label: "로드맵 고2.고3 전용관" },
          { label: "이용료", href: "/high2-high3/price" },
        ]}
      />

      <section className="py-12">
        <div className="mx-auto max-w-6xl space-y-20 px-6">
          <div>
            <p className="mb-5 text-center text-2xl font-bold text-violet-700 md:text-3xl">이용료 안내</p>
            <Image
              src="/images/about/h_price.png"
              alt="로드맵 고2.고3 전용관 이용료 안내"
              width={1920}
              height={1080}
              className="h-auto w-full"
              priority
            />
          </div>

          <div>
            <p className="mb-5 text-center text-2xl font-bold text-violet-700 md:text-3xl">등록 방법</p>
            <Image
              src="/images/about/h_register.png"
              alt="로드맵 고2.고3 전용관 등록 방법 안내"
              width={1920}
              height={1080}
              className="h-auto w-full"
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
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
      </section>
    </main>
  );
}
