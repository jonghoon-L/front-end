import Link from "next/link";

type Crumb = { label: string; href?: string };

export default function PageHero({
  imageUrl,
  lines,
  crumbs,
  heightClass = "h-[300px] lg:h-[420px]"
}: {
  imageUrl: string;
  lines: string[]
  crumbs: Crumb[];
  heightClass?: string;
}) {
  return (
    <section>
      {/* 상단 이미지 + 문구 */}
      <div
        className={`relative w-full overflow-hidden ${heightClass}`}
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* 어두운 오버레이 */}
        <div className="absolute inset-0 bg-black/45" />

        {/* 텍스트 */}
        <div className="relative h-full flex items-center justify-center text-center px-10">
          <h1 className="text-white font-bold text-xl md:text-2xl lg:text-4xl leading-snug">
            {lines.map((line, idx) => (
              <span key={idx} className="block">
                {line}
              </span>
            ))}
          </h1>
        </div>
      </div>

      {/* 아래 경로(Breadcrumb) */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
          {/* 홈 아이콘 */}
          <Link href="/" className="hover:text-gray-900">
            <span className="inline-flex items-center gap-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>

          {crumbs.map((c, idx) => (
            <span key={`${c.label}-${idx}`} className="flex items-center gap-2">
              <span className="text-gray-300">/</span>
              {c.href ? (
                <Link href={c.href} className="hover:text-gray-900">
                  {c.label}
                </Link>
              ) : (
                <span className="text-gray-900">{c.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
