import Link from "next/link";
import type { CSSProperties } from "react";

type Crumb = { label: string; href?: string };

/** 빵판 라벨에서 "(1) ", "(2) " 등 번호 프리픽스 제거 */
function displayCrumbLabel(label: string): string {
  return label.replace(/^\(\d+\)\s*/, "");
}

type PageHeroProps = {
  imageUrl: string;
  lines: string[];
  crumbs: Crumb[];
  heightClass?: string;
  heroClassName?: string;
  heroStyle?: CSSProperties;
  overlayClassName?: string;
  overlayStyle?: CSSProperties;
  titleClassName?: string;
  breadcrumbWrapClassName?: string;
};

export default function PageHero({
  imageUrl,
  lines,
  crumbs,
  heightClass = "h-[300px] lg:h-[420px]",
  heroClassName = "",
  heroStyle,
  overlayClassName = "bg-black/45",
  overlayStyle,
  titleClassName = "text-white text-xl md:text-2xl lg:text-4xl",
  breadcrumbWrapClassName = "border-gray-200",
}: PageHeroProps) {
  const baseHeroStyle: CSSProperties = imageUrl
    ? {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  return (
    <section>
      <div
        className={`relative w-full overflow-hidden ${heightClass} ${heroClassName}`}
        style={{ ...baseHeroStyle, ...heroStyle }}
      >
        <div className={`absolute inset-0 ${overlayClassName}`} style={overlayStyle} />

        <div className="relative h-full flex items-center justify-center text-center px-10">
          <h1 className={`font-bold leading-snug ${titleClassName}`}>
            {lines.map((line, idx) => (
              <span key={idx} className="block">
                {line}
              </span>
            ))}
          </h1>
        </div>
      </div>

      <div className={`border-b bg-white ${breadcrumbWrapClassName}`}>
        <div className="mx-auto max-w-6xl px-6 py-4 text-sm text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href="/" className="inline-flex items-center justify-center shrink-0 hover:text-gray-900" aria-label="홈">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 block" aria-hidden>
              <path
                d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          {crumbs.map((c, idx) => {
            const label = displayCrumbLabel(c.label);
            return (
              <span key={`${c.label}-${idx}`} className="inline-flex items-center gap-2 translate-y-[2px]">
                <span className="text-gray-300 shrink-0">{">"}</span>
                {c.href ? (
                  <Link href={c.href} className="inline-flex items-center hover:text-gray-900">
                    {label}
                  </Link>
                ) : (
                  <span className="inline-flex items-center text-gray-900">{label}</span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
