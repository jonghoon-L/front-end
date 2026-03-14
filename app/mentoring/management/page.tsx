import PageHero from "@/components/PageHero";

export default function MentoringManagementPage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p5.jpg"
        lines={["1:1 멘토.플랜.학업관리", "관리 내용"]}
        crumbs={[
          { label: "1:1 멘토.플랜.학업관리", href: "/mentoring/management" },
          { label: "관리 내용" },
        ]}
      />

      <section
        className="w-full px-4 pb-16 pt-0 md:px-6 md:pb-20 lg:px-8"
        style={{ marginTop: "80px" }}
      >
        <div className="mx-auto w-full max-w-7xl">
          {/* 내용 영역 - 비어있음 */}
        </div>
      </section>
    </main>
  );
}
