import PageHero from "@/components/PageHero";

export default function ConsultingPage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p8.jpg"
        lines={["상담 신청"]}
        crumbs={[{ label: "상담 신청", href: "/consulting" }]}
      />

      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-gray-600">상담 신청 페이지입니다.</p>
        </div>
      </section>
    </main>
  );
}
