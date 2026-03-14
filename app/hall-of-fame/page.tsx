import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function HallOfFamePage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/hi/hi_p3.jpg"
        heroStyle={{ backgroundPosition: "center 65%" }}
        lines={["로드맵은", "실적으로 증명합니다"]}
        crumbs={[{ label: "명예의 전당" }]}
      />

      <section
        className="w-full px-4 pb-16 pt-0 md:px-6 md:pb-20 lg:px-8"
        style={{ marginTop: "80px" }}
      >
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="motion-rise mb-20 mt-0 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            <span className="block">로드맵과 함께 완성한</span>
            <span className="block">2026년의 눈부신 성과입니다</span>
          </h2>

          <div className="motion-rise mx-auto flex max-w-4xl justify-center">
            <Image
              src="/images/chart.jpg"
              alt="명예의 전당"
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
