import PageHero from "@/components/PageHero";

export default function ReservationPage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p8.jpg"
        lines={["등록 예약"]}
        crumbs={[{ label: "등록 예약", href: "/reservation" }]}
      />

      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-gray-600">등록 예약 페이지입니다.</p>
        </div>
      </section>
    </main>
  );
}
