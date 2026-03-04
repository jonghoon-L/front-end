import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function AboutRoadmapPage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p8.jpg"
        lines={[
          "로드맵은 단 1분의 시간도",
          "의미 없이 흘려 보내는 것을 용납하지 않습니다",
        ]}
        crumbs={[
          { label: "ABOUT 로드맵" },
          { label: "(1) ABOUT 로드맵", href: "/about/roadmap" },
        ]}
      />

      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl px-6">
          <article className="overflow-hidden bg-white">
            <div className="grid lg:grid-cols-[1.55fr_1fr]">
              <div className="relative p-8 md:p-12">
                <div className="relative">
                  <h2 className="motion-rise text-4xl font-extrabold leading-[0.95] text-emerald-700 md:text-6xl">
                    ABOUT
                    <br />
                    ROADMAP
                  </h2>

                  <p className="motion-rise motion-delay-4 mt-10 text-xl font-bold leading-snug text-emerald-700">
                    학습관 입장 순간부터, 로드맵은 단 1분의 시간도 의미 없이 흘려 보내는 것을 용납하지 않습니다.
                  </p>

                  <p className="motion-rise motion-delay-1 mt-10 text-base leading-[1.75] text-gray-600">
                    로드맵에 들어온 순간, 단 1분의 시간도 무의미하게 보내는 것을 허용하지 않으며, 1일 최소
                    10시간 이상 학업에 몰입할 수 밖에 없는 환경과 시스템을 구축하여 관리, 케어하고 있습니다.
                  </p>

                  <p className="motion-rise motion-delay-2 mt-10 text-base leading-[1.75] text-gray-600">
                    로드맵만의 노하우를 통한 체계적인 출결 시스템과 세밀한 관리력으로 최상의 학습 효율과 몰입도에
                    중점으로 두어 관리하며 유지하고 있습니다.
                  </p>

                  <p className="motion-rise motion-delay-4 mt-10 text-base leading-[1.75] text-gray-600">
                    지금껏 단 한번도 광고나 컴플레인 없이 학교, 학원 선생님, 졸업생, 재원생들의 적극 추천과
                    입소문만으로 지속적으로 업그레이드 되고 있는 관리형 독서실입니다.
                  </p>

                  <p className="motion-rise motion-delay-4 mt-14 text-xl font-bold leading-snug text-emerald-700">
                    로드맵 선생님들의 관리 마인드
                  </p>

                  <p className="motion-rise motion-delay-4 mt-5 text-base leading-[1.75] text-gray-600">
                    로드맵은 수험생을 두신 부모님의 간절하신 마음을 누구보다 잘 알고 있습니다.
                    이에, 원장님을 비롯한 모든 관리자들은 매의 눈빛으로 어머님의 마음이 되어 학생, 학부모님이
                    100% 만족하시는 학습 공간이 될 수 있도록 항상 고민하고 연구하는 철저한 관리선생님들이
                    밀착 케어합니다.
                  </p>
                </div>
              </div>

              <div className="motion-rise motion-delay-2 relative min-h-[440px] lg:min-h-full">
                <Image
                  src="/images/about/n_03_img.png"
                  alt="로드맵 학습관 내부"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
