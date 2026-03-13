import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function AboutTeacherPage() {
  const directors = [
    {
      role: "원장T",
      namePart: "장진웅",
      titlePart: "원장",
      careers: [
        "전) 대성 학원 수학 강사 (원주 본원)",
        "전) 대성 학원 원장 (강남대 분원)",
        "전) 막강 학원 원장",
        "현) 로드맵 입시 관리형 독서실 원장",
      ],
      photo: "/images/about/원장T.jpg",
      accent: "bg-emerald-700",
    },
    {
      role: "부원장T",
      namePart: "김현정",
      titlePart: "부원장",
      careers: [
        "전) 대성 학원 부원장 (강남대 분원)",
        "전) 막강 학원 부원장",
        "현) 로드맵 하이엔드 독서실 부원장",
      ],
      photo: "/images/about/부원장T_v2.jpg",
      accent: "bg-emerald-700",
    },
    {
      role: "상담 관리 T",
      namePart: "송의준",
      titlePart: "선생님",
      careers: [
        "과학중점고등학교 전교 6등 졸업",
        "수능 전과목 1등급(전국 상위 0.8%)",
        "육군사관학교 필기 시험 합격",
        "정시 일반 전형 한의대, 약대 합격",
      ],
      photo: null,
      accent: "bg-slate-700",
    },
  ];

  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p4.jpg"
        heroStyle={{ backgroundPosition: "center 60%", backgroundSize: "100% auto" }}
        lines={["로드맵의", "관리 T를 소개합니다"]}
        crumbs={[
          { label: "ABOUT 로드맵" },
          { label: "관리T 소개", href: "/about/teacher" },
        ]}
      />

      <section
        className="w-full px-4 py-16 pt-0 md:px-6 lg:px-8"
        style={{ marginTop: "80px" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          {/* 상단 메인 타이틀 (관리시스템과 동일 스타일) */}
          <h2 className="motion-rise mb-20 mt-0 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            <span className="block">목표를 현실로 바꿔주는</span>
            <span className="block">로드맵의 관리 선생님들을 소개합니다</span>
          </h2>

          <div className="mx-auto max-w-4xl space-y-8">
            {directors.map((director, index) => (
              <article
                key={director.role + director.namePart}
                className="motion-rise group flex h-[320px] flex-col overflow-hidden border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg md:flex-row"
                style={{ animationDelay: `${180 + index * 150}ms` }}
              >
                <div className="flex h-[180px] shrink-0 items-center justify-center p-6 md:h-full md:w-[280px] md:p-8">
                  <div className={`relative h-full w-full overflow-hidden shadow-sm ${director.namePart === "김현정" ? "bg-white" : "bg-gray-200"}`}>
                    {director.photo ? (
                      <Image
                        src={director.photo}
                        alt={`${director.namePart} ${director.titlePart} 프로필 사진`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        sizes="280px"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center bg-gray-200 text-sm text-gray-500"
                        aria-label="프로필 사진 준비중"
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-start overflow-y-auto pt-8 px-8 pb-8">
                  <div className="mb-5">
                    <span className={`${director.accent} rounded-full px-3 py-1 text-xs font-bold tracking-[0.12em] text-white`}>
                      {director.role}
                    </span>
                    <h3 className="mt-3">
                      <span className="text-2xl font-extrabold text-gray-900">{director.namePart}</span>
                      <span className="ml-2 text-lg font-medium text-gray-700">{director.titlePart}</span>
                    </h3>
                  </div>

                  <ul className="space-y-3">
                    {director.careers.map((career) => (
                      <li key={career} className="flex gap-3 text-gray-700">
                        <span className={`mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full ${director.role === "상담 관리 T" ? "bg-slate-700" : "bg-emerald-600"}`} />
                        <span className="leading-7">{career}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
