import PageHero from "@/components/PageHero";
import Image from "next/image";

const FACILITY_IMAGE = "/images/about/n_03_img.png";

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
          <article>
            <div className="grid lg:grid-cols-[1.4fr_1fr] min-h-[500px] lg:min-h-[560px]">
              {/* 왼쪽: 시설 사진 배경 + 흰색 반투명 오버레이 + 텍스트 */}
              <div
                className="relative p-10 md:p-14 lg:p-16"
                style={{
                  backgroundImage: `url(${FACILITY_IMAGE})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  className="absolute inset-0 bg-white/85"
                  aria-hidden
                />
                <div className="relative z-10">
                  <h2 className="motion-rise text-4xl font-extrabold leading-[0.95] text-emerald-700 md:text-6xl">
                    ABOUT
                    <br />
                    ROADMAP
                  </h2>

                  <p className="motion-rise motion-delay-1 mt-12 text-base md:text-lg font-bold leading-snug text-emerald-700 whitespace-nowrap">
                    학습관 입장 순간부터, 로드맵은 단 1분의 시간도 의미 없이 흘려 보내는 것을 용납하지 않습니다.
                  </p>

                  <p className="motion-rise motion-delay-2 mt-8 text-base leading-[1.85] text-gray-700 break-keep">
                    의무학습 시간 동안 하루 최소 12시간 이상 학업에 몰입할 수밖에
                    없는 환경과 시스템을 구축해
                    <br />
                    학생들을 체계적으로 관리하고 세심하게 케어하고 있습니다.
                    로드맵만의 노하우가 담긴 체계적인
                    <br />
                    출결 시스템과 정밀한 관리력을 기반으로 최고의 학습 효율과
                    몰입도를 유지할 수 있도록 집중
                    <br />
                    관리하고 있습니다. 그러나, 스스로 공부하려는 의지가 전혀
                    갖춰지지 않은 수험생에게는 버티기
                    <br />
                    쉽지 않은 시스템일 수 있습니다.
                  </p>

                  <div className="motion-rise motion-delay-3 mt-10 text-base md:text-lg font-bold leading-snug text-emerald-700">
                    <div className="break-keep">
                      하지만 로드맵에서는 이러한 수험생일수록 원장 선생님의 집중적인 체크와 학업 및 입시
                    </div>
                    <div className="break-keep">
                      전문 상담 선생님의 1:1 상담을 통해 학업 업그레이드와 사고방식의 변화를 이끌어내고 있습니다.
                    </div>
                  </div>

                  <p className="motion-rise motion-delay-4 mt-8 text-base leading-[1.85] text-gray-700 break-keep">
                    개원 이후 단 한 번의 광고나 홍보 없이도, 오직 &apos;관리력&apos; 하나로
                    학교·학원 선생님, 졸업생, 재원생들의{' '}
                    <span className="whitespace-nowrap">높은 추천과 입소문만으로</span>{' '}
                    꾸준히 성장하고 업그레이드되어 온 관리형 독서실입니다.
                  </p>
                </div>
              </div>

              <div className="motion-rise motion-delay-2 relative min-h-[440px] lg:min-h-full">
                <Image
                  src={FACILITY_IMAGE}
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
