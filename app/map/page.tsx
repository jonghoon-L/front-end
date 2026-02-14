import PageHero from "@/components/PageHero";

export default function MapPage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/sub/map.jpg"
        lines={[
            "공부에만 몰입할 수 있는",
            "공간을 만들기 위해 고민했습니당"
        ]}
        crumbs={[
          { label: "학원소개" },
          { label: "대표소개", href: "/map" }, 
        ]}
      />

      {/* 본문 */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
            <div className="aspect-[16/9] w-full">
                <iframe
                title="네이버 지도"
                src="https://naver.me/FY3ymPaR"
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allow="geolocation"
                />
            </div>
        </div>
      </section>
    </main>
  );
}