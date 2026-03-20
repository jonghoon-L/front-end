import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function AboutTeacherPage() {
  /** 직급별 뱃지 스타일 (무채색 모노톤, 하이엔드 모던) */
  function getBadgeStyle(role: string) {
    if (role === "원장T" || role === "부원장T") {
      return { backgroundColor: "#171717", color: "#FFFFFF" };
    }
    if (role === "상담 관리 T") {
      return { backgroundColor: "#71717A", color: "#FFFFFF" };
    }
    return { backgroundColor: "#E4E4E7", color: "#171717" };
  }

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
      accent: "bg-emerald-600",
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
      accent: "bg-emerald-600",
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
      photo: "/images/about/의준T.jpg",
      accent: "bg-slate-700",
    },
    {
      role: "관리 T",
      namePart: "이종훈",
      titlePart: "선생님",
      careers: [],
      photo: "/images/about/종훈T.jpg",
      accent: "bg-emerald-600",
    },
    {
      role: "관리 T",
      namePart: "김나경",
      titlePart: "선생님",
      careers: [],
      photo: "/images/about/나경T.jpg",
      accent: "bg-emerald-600",
    },
  ];

  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p22.jpg"
        heroStyle={{ backgroundPosition: "75% 47%", backgroundSize: "cover" }}
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
            <span className="block">관리 선생님들을 소개합니다</span>
          </h2>

          <div className="mx-auto max-w-4xl space-y-8">
            {directors.map((director, index) => (
              <article
                key={director.role + director.namePart}
                className="motion-rise group flex h-[290px] flex-col overflow-hidden border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg md:flex-row"
                style={{ animationDelay: `${180 + index * 150}ms` }}
              >
                <div className="flex h-[180px] shrink-0 items-start justify-center bg-transparent pt-6 pb-6 pl-6 pr-6 md:h-full md:w-[280px] md:pt-8 md:pb-8 md:pl-8 md:pr-8">
                  <div className="relative h-full w-full overflow-hidden">
                    {director.photo ? (
                      <Image
                        src={director.photo}
                        alt={`${director.namePart} ${director.titlePart} 프로필 사진`}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                        sizes="280px"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center bg-white text-sm text-gray-500"
                        aria-label="프로필 사진 준비중"
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-start overflow-y-auto pt-8 px-8 pb-8">
                  <div className="mb-4">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold tracking-[0.12em]"
                      style={getBadgeStyle(director.role)}
                    >
                      {director.role}
                    </span>
                    <h3 className="mt-2.5">
                      <span className="text-[1.45rem] font-extrabold text-gray-900">{director.namePart}</span>
                      <span className="ml-2 text-[1.125rem] font-medium text-gray-700">{director.titlePart}</span>
                    </h3>
                  </div>

                  {director.careers.length > 0 && (
                    <ul className="space-y-2.5">
                      {director.careers.map((career) => (
                        <li key={career} className="flex gap-3 text-gray-700">
                          <span
                            className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                director.role === "원장T" || director.role === "부원장T"
                                  ? "#171717"
                                  : director.role === "상담 관리 T"
                                    ? "#71717A"
                                    : "#A1A1AA",
                            }}
                          />
                          <span className="text-[1rem] leading-[1.625rem]">{career}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
