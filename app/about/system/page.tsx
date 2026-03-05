import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function AboutSystemPage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p4.jpg"
        heroStyle={{ backgroundPosition: "center 45%", backgroundSize: "100% auto" }}
        lines={[
          "로드맵만의 특화된",
          "관리 시스템과 운영방식",
        ]}
        crumbs={[
          { label: "ABOUT 로드맵" },
          { label: "관리시스템", href: "/about/system" },
        ]}
      />

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <Image
            src="/images/about/n_05.png"
            alt="로드맵 관리 시스템"
            width={1920}
            height={1080}
            className="h-auto w-full"
            priority
          />
        </div>
      </section>
    </main>
  );
}
