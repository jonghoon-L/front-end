import PageHero from "@/components/PageHero";
import Image from "next/image";

export default function AboutTeacherPage() {
  const directors = [
    {
      role: "원장T",
      name: "원장 장진웅",
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
      name: "부원장 김현정",
      careers: [
        "전) 대성 학원 부원장 (강남대 분원)",
        "전) 막강 학원 부원장",
        "현) 로드맵 하이엔드 독서실 원장",
      ],
      photo: "/images/about/부원장T_v2.jpg",
      accent: "bg-slate-700",
    },
  ];

  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p3.jpg"
        heroStyle={{ backgroundPosition: "center 70%", backgroundSize: "100% auto" }}
        lines={[
          "목표를 현실로",
          "관리 T",
        ]}
        crumbs={[
          { label: "ABOUT 로드맵" },
          { label: "관리T 소개", href: "/about/teacher" },
        ]}
      />

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10">
            <p className="text-sm font-semibold tracking-[0.2em] text-emerald-700">TEACHERS</p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 md:text-4xl">관리T 소개</h2>
          </div>

          <div className="space-y-8">
            {directors.map((director) => (
              <article
                key={director.role}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
              >
                <div className="md:grid md:grid-cols-[280px_1fr]">
                  <div className="w-full overflow-hidden bg-gray-50 md:self-start">
                    <Image
                      src={director.photo}
                      alt={`${director.name} 프로필 사진`}
                      width={560}
                      height={760}
                      className="h-auto w-full object-contain object-top p-2 transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>

                  <div className="px-6 py-6 md:px-8 md:py-8">
                    <div className="mb-5">
                      <span className={`${director.accent} rounded-full px-3 py-1 text-xs font-bold tracking-[0.12em] text-white`}>
                        {director.role}
                      </span>
                      <h3 className="mt-3 text-2xl font-bold text-gray-900">{director.name}</h3>
                    </div>

                    <ul className="space-y-3">
                      {director.careers.map((career) => (
                        <li key={career} className="flex gap-3 text-gray-700">
                          <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                          <span className="leading-7">{career}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
