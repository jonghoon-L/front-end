import PageHero from "@/components/PageHero";
import { JSX } from "react";

const emphasisPhrases = [
  "로드맵의 학습 관리는?",
  "20분·30분 단위의 순찰식 관리가 아닙니다",
  "학업 전 과정을 실시간 초 단위로 밀착 관리, 케어합니다",
  "기본에 충실한 관리",
  "핵심 관리에 모든 역량을 집중하여 관리합니다",
  "주간 학습 리포트를 매주 월요일에 제공해드립니다",
  "매월 1회 학업 현황 상담",
  "심층 학업 관리 프로그램 선택시 퀄리티 높은 1:1 심층 학업 관리 프로그램",
];

function highlightText(text: string) {
  return emphasisPhrases.reduce<(string | JSX.Element)[]>(
    (acc, phrase) =>
      acc.flatMap((part, partIndex) => {
        if (typeof part !== "string") return [part];
        const pieces = part.split(phrase);
        if (pieces.length === 1) return [part];

        const merged: (string | JSX.Element)[] = [];
        pieces.forEach((piece, pieceIndex) => {
          if (piece) merged.push(piece);
          if (pieceIndex < pieces.length - 1) {
            merged.push(
              <strong
                key={`${phrase}-${partIndex}-${pieceIndex}`}
                className="font-semibold text-gray-700"
              >
                {phrase}
              </strong>
            );
          }
        });
        return merged;
      }),
    [text]
  );
}

const managementPoints = [
  {
    number: "1",
    lines: [
      "로드맵의 학습 관리는? 관리형 독서실에서 흔히 볼 수 있는 20분·30분 단위의 순찰식 관리가 아닙니다.",
      "교시 시작과 동시에 수험생들과 함께 입실하여, 학업 전 과정을 실시간 초 단위로 밀착 관리, 케어합니다.",
    ],
  },
  {
    number: "2",
    lines: [
      "로드맵은 진심을 바탕으로 한 기본에 충실한 관리를 가장 중요하게 생각합니다.",
      "보여주기식 관리는 축소하고, 학생들의 학업 효율을 높이는 데 반드시 필요한 핵심 관리에 모든 역량을 집중하여 관리합니다.",
    ],
  },
  {
    number: "3",
    lines: [
      "한 주간의 학업 현황을 매 교시 데이터화 하며, 주간 학습 리포트를 매주 월요일에 제공해드립니다.",
    ],
  },
  {
    number: "4",
    lines: [
      "재원생은 매월 1회 학업 현황 상담을 신청할 수 있습니다.",
      "또한 심층 학업 관리 프로그램 선택시 퀄리티 높은 1:1 심층 학업 관리 프로그램을 경험해 볼 수 있습니다.",
    ],
  },
];

export default function AboutDiffPage() {
  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p9.jpg"
        lines={[
          "일반 관리형 독서실과의 차별화된 관리",
          "로드맵의 학습 관리",
        ]}
        crumbs={[
          { label: "ABOUT 로드맵" },
          { label: "일반 관리형 독서실과의 차별화", href: "/about/diff" },
        ]}
      />

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="motion-rise text-center text-2xl font-bold text-emerald-700 md:text-3xl">
            일반 관리형 독서실과의 차별화된 관리
          </h2>

          <div className="motion-rise motion-delay-1 relative mx-auto mt-8 max-w-5xl text-center">
            <p className="inline-flex items-center gap-2 px-3 py-2 text-base font-semibold leading-snug text-emerald-700 md:text-lg">
              <span className="text-6xl font-black leading-none text-emerald-200">“</span>
              <span className="bg-emerald-100 px-2 py-0.5">
                로드맵은 ‘관리받는 공간을 넘어’ 공부할 수밖에 없는 환경을 만드는 곳입니다.
              </span>
              <span className="text-6xl font-black leading-none text-emerald-200">”</span>
            </p>
          </div>

          <div className="mt-16 space-y-16">
            {managementPoints.map((point, index) => (
              <article
                key={point.number}
                className="motion-rise relative mx-auto max-w-5xl rounded-2xl border border-emerald-200 bg-emerald-50/55 px-6 pb-6 pt-8 text-center shadow-[0_6px_14px_rgba(15,23,42,0.08)]"
                style={{ animationDelay: `${160 + index * 120}ms` }}
              >
                <p className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-700 px-2.5 py-1 text-base font-semibold leading-none text-white shadow-sm">
                  {point.number}
                </p>
                <p className="mx-auto max-w-4xl text-xs font-normal leading-[1.8] text-gray-500 md:text-sm">
                  {point.lines.map((line) => (
                    <span key={line} className="block">
                      {highlightText(line)}
                    </span>
                  ))}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
