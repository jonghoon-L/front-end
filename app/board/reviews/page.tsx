"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { apiGet } from "@/api/apiClient";
import { ChevronLeft, ChevronRight, Pin, Pencil } from "lucide-react";
import { useFadeIn } from "@/hooks/useFadeIn";
import { maskName } from "@/lib/maskName";

/** 목록·상세 공통 후기 행 */
interface ReviewItem {
  reviewId: number;
  title: string;
  authorName: string;
  viewCount: number;
  createdAt: string;
  isTop?: boolean;
}

const NORMAL_PAGE_SIZE = 10;

function coerceCount(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function unwrapRecord(raw: unknown): Record<string, unknown> {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const dataVal = r.data;
  if (dataVal && typeof dataVal === "object" && !Array.isArray(dataVal)) {
    return dataVal as Record<string, unknown>;
  }
  return r;
}

/** GET /v1/common/reviews/top — 배열 또는 래핑 객체 */
function parseTopReviewsResponse(raw: unknown): ReviewItem[] {
  if (Array.isArray(raw)) {
    return raw.filter((x) => x && typeof x === "object") as ReviewItem[];
  }
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  if (Array.isArray(obj.data)) {
    return (obj.data as unknown[]).filter((x) => x && typeof x === "object") as ReviewItem[];
  }
  const inner = unwrapRecord(raw);
  if (Array.isArray(inner.reviews)) {
    return (inner.reviews as unknown[]).filter((x) => x && typeof x === "object") as ReviewItem[];
  }
  if (Array.isArray(inner.content)) {
    return (inner.content as unknown[]).filter((x) => x && typeof x === "object") as ReviewItem[];
  }
  return [];
}

/** GET /v1/common/reviews?page=&size= — { content, page: { totalElements, totalPages, ... } } */
function parseNormalReviewsResponse(raw: unknown): {
  content: ReviewItem[];
  totalElements: number;
  totalPages: number;
} {
  const inner = unwrapRecord(raw);
  const pick = (k: string) => inner[k] ?? (raw as Record<string, unknown>)?.[k];

  const contentRaw = pick("content");
  const content = Array.isArray(contentRaw) ? (contentRaw as ReviewItem[]) : [];

  const pageRaw = pick("page");
  const page =
    pageRaw && typeof pageRaw === "object" && !Array.isArray(pageRaw)
      ? (pageRaw as Record<string, unknown>)
      : {};

  const totalElements =
    coerceCount(page.totalElements) ??
    coerceCount(page.total_elements) ??
    coerceCount(inner.totalElements) ??
    0;

  const tp = coerceCount(page.totalPages) ?? coerceCount(page.total_pages);
  const totalPages = tp !== undefined && tp > 0 ? Math.floor(tp) : 1;

  return {
    content,
    totalElements: Math.max(0, Math.floor(totalElements)),
    totalPages,
  };
}

function formatCreatedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}

function fetchTopReviews(): Promise<ReviewItem[]> {
  return apiGet<unknown>("/v1/common/reviews/top", {
    useRelativePath: true,
    headers: { "Content-Type": "application/json" },
  }).then((res) => parseTopReviewsResponse(res));
}

function fetchNormalReviewsPage(uiPage: number): Promise<{
  content: ReviewItem[];
  totalElements: number;
  totalPages: number;
}> {
  const zeroBasedPage = Math.max(0, uiPage - 1);
  return apiGet<unknown>(
    `/v1/common/reviews?page=${zeroBasedPage}&size=${NORMAL_PAGE_SIZE}`,
    {
      useRelativePath: true,
      headers: { "Content-Type": "application/json" },
    }
  ).then((res) => parseNormalReviewsResponse(res));
}

export default function ReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [topReviews, setTopReviews] = useState<ReviewItem[]>([]);
  const [normalReviews, setNormalReviews] = useState<ReviewItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fade = useFadeIn(0.1);
  const contentTopRef = useRef<HTMLElement | null>(null);
  const topReviewsLoadedRef = useRef(false);
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;

  useEffect(() => {
    let cancelled = false;
    const uiPageAtStart = currentPage;
    setLoading(true);
    setError(null);

    const applyNormal = (normal: { content: ReviewItem[]; totalElements: number; totalPages: number }) => {
      if (cancelled || currentPageRef.current !== uiPageAtStart) return;
      setNormalReviews(normal.content);
      setTotalElements(normal.totalElements);
      setTotalPages(normal.totalPages);
    };

    const run = async () => {
      try {
        if (!topReviewsLoadedRef.current) {
          const [tops, normal] = await Promise.all([
            fetchTopReviews(),
            fetchNormalReviewsPage(uiPageAtStart),
          ]);
          if (cancelled || currentPageRef.current !== uiPageAtStart) return;
          setTopReviews(tops);
          topReviewsLoadedRef.current = true;
          applyNormal(normal);
        } else {
          const normal = await fetchNormalReviewsPage(uiPageAtStart);
          applyNormal(normal);
        }
      } catch (err) {
        if (cancelled || currentPageRef.current !== uiPageAtStart) return;
        setError(err instanceof Error ? err.message : "목록을 불러오지 못했습니다.");
        setNormalReviews([]);
        setTotalElements(0);
        setTotalPages(1);
      } finally {
        if (!cancelled && currentPageRef.current === uiPageAtStart) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  useLayoutEffect(() => {
    const scrollToTop = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };
    scrollToTop();
    const id = setTimeout(scrollToTop, 0);
    return () => clearTimeout(id);
  }, []);

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    contentTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  const hasAnyRows = topReviews.length > 0 || normalReviews.length > 0;

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <PageHero
        imageUrl="/images/note.jpg"
        heroStyle={{ backgroundPosition: "center 5%" }}
        lines={["이용 후기"]}
        crumbs={[{ label: "이용 후기", href: "/board/reviews" }]}
      />

      <section
        ref={(el) => {
          (fade.ref as React.MutableRefObject<HTMLElement | null>).current = el;
          contentTopRef.current = el;
        }}
        className="mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-14"
      >
        <h2
          className="mb-20 mt-0 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl transition-all duration-700 ease-out"
          style={{
            opacity: fade.isVisible ? 1 : 0,
            transform: fade.isVisible ? "translateY(0)" : "translateY(24px)",
          }}
        >
          <span className="block">로드맵을 이용한 학생들의</span>
          <span className="block">솔직한 경험을 확인해 보세요</span>
        </h2>

        {/* 모바일·태블릿 */}
        <div
          className="lg:hidden space-y-3 transition-all duration-700 ease-out"
          style={{
            opacity: fade.isVisible ? 1 : 0,
            transform: fade.isVisible ? "translateY(0)" : "translateY(20px)",
            transitionDelay: fade.isVisible ? "180ms" : "0ms",
          }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              <p className="mt-4 text-sm">목록을 불러오는 중…</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/60">
              <p className="text-red-600">{error}</p>
            </div>
          ) : !hasAnyRows ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200/60">
              <p className="text-slate-500">등록된 후기가 없습니다.</p>
            </div>
          ) : (
            <>
              {topReviews.map((post) => (
                <Link
                  key={`top-${post.reviewId}`}
                  href={`/board/reviews/${post.reviewId}`}
                  className="block rounded-2xl bg-slate-100 p-5 shadow-sm ring-1 ring-slate-300/80 transition-shadow hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900">
                          <Pin className="h-3 w-3" />
                          우수 후기
                        </span>
                      </div>
                      <h3 className="line-clamp-2 font-bold text-slate-900">{post.title}</h3>
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-700">
                        <span>{maskName(post.authorName)}</span>
                        <span>{formatCreatedAt(post.createdAt)}</span>
                        <span>조회 {post.viewCount}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
                  </div>
                </Link>
              ))}
              {normalReviews.map((post, index) => {
                const displayNumber = totalElements - (currentPage - 1) * NORMAL_PAGE_SIZE - index;
                return (
                  <Link
                    key={post.reviewId}
                    href={`/board/reviews/${post.reviewId}`}
                    className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60 transition-shadow hover:shadow-md active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-slate-400">#{displayNumber}</span>
                        </div>
                        <h3 className="line-clamp-2 font-semibold text-slate-800">{post.title}</h3>
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span>{maskName(post.authorName)}</span>
                          <span>{formatCreatedAt(post.createdAt)}</span>
                          <span>조회 {post.viewCount}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
                    </div>
                  </Link>
                );
              })}
            </>
          )}
        </div>

        {/* 데스크톱 테이블 */}
        <div
          className="hidden lg:block overflow-hidden bg-white shadow-sm ring-1 ring-slate-200/60 transition-all duration-700 ease-out"
          style={{
            opacity: fade.isVisible ? 1 : 0,
            transform: fade.isVisible ? "translateY(0)" : "translateY(20px)",
            transitionDelay: fade.isVisible ? "180ms" : "0ms",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="px-8 py-5 text-center text-sm font-semibold uppercase tracking-wider text-slate-500">
                    번호
                  </th>
                  <th className="px-8 py-5 text-center text-sm font-semibold uppercase tracking-wider text-slate-500">
                    제목
                  </th>
                  <th className="px-8 py-5 text-center text-sm font-semibold uppercase tracking-wider text-slate-500">
                    작성자
                  </th>
                  <th className="px-8 py-5 text-center text-sm font-semibold uppercase tracking-wider text-slate-500">
                    작성일
                  </th>
                  <th className="px-8 py-5 text-center text-sm font-semibold uppercase tracking-wider text-slate-500">
                    조회
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-slate-500">
                      <div className="inline-flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                        <span>목록을 불러오는 중…</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : !hasAnyRows ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-slate-500">
                      등록된 후기가 없습니다.
                    </td>
                  </tr>
                ) : (
                  <>
                    {topReviews.map((post) => (
                      <tr
                        key={`top-${post.reviewId}`}
                        className="group bg-slate-100 transition-colors hover:bg-slate-200/80"
                      >
                        <td className="px-8 py-5 text-center">
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-900">
                            <Pin className="h-3.5 w-3.5" />
                            우수 후기
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <Link
                            href={`/board/reviews/${post.reviewId}`}
                            className="inline-flex items-center gap-1 text-base font-bold text-slate-900"
                          >
                            {post.title}
                            <ChevronRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                          </Link>
                        </td>
                        <td className="px-8 py-5 text-center text-base font-semibold text-slate-800">
                          {maskName(post.authorName)}
                        </td>
                        <td className="px-8 py-5 text-center text-base font-semibold text-slate-800">
                          {formatCreatedAt(post.createdAt)}
                        </td>
                        <td className="px-8 py-5 text-center text-base font-semibold text-slate-800">
                          {post.viewCount}
                        </td>
                      </tr>
                    ))}
                    {normalReviews.map((post, index) => {
                      const displayNumber = totalElements - (currentPage - 1) * NORMAL_PAGE_SIZE - index;
                      return (
                        <tr key={post.reviewId} className="group transition-colors hover:bg-slate-50/70">
                          <td className="px-8 py-5 text-center">
                            <span className="text-sm font-medium text-slate-400">{displayNumber}</span>
                          </td>
                          <td className="px-8 py-5">
                            <Link
                              href={`/board/reviews/${post.reviewId}`}
                              className="inline-flex items-center gap-1 text-base font-medium text-slate-800"
                            >
                              {post.title}
                              <ChevronRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>
                          </td>
                          <td className="px-8 py-5 text-center text-base text-slate-500">
                            {maskName(post.authorName)}
                          </td>
                          <td className="px-8 py-5 text-center text-base text-slate-500">
                            {formatCreatedAt(post.createdAt)}
                          </td>
                          <td className="px-8 py-5 text-center text-base text-slate-400">{post.viewCount}</td>
                        </tr>
                      );
                    })}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && !error && totalPages > 1 && (
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: fade.isVisible ? 1 : 0,
              transform: fade.isVisible ? "translateY(0)" : "translateY(20px)",
              transitionDelay: fade.isVisible ? "240ms" : "0ms",
            }}
          >
            <nav className="mt-8 flex items-center justify-center gap-1" aria-label="페이지 선택">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="inline-flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                aria-label="이전 페이지"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      currentPage === page ? "bg-slate-800 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                aria-label="다음 페이지"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        )}

        <div
          className="mt-8 flex flex-wrap items-center justify-end gap-2 transition-all duration-700 ease-out"
          style={{
            opacity: fade.isVisible ? 1 : 0,
            transform: fade.isVisible ? "translateY(0)" : "translateY(20px)",
            transitionDelay: fade.isVisible ? "300ms" : "0ms",
          }}
        >
          <Link
            href="/board/reviews/mine"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
          >
            내 후기 조회
          </Link>
          <Link
            href="/board/reviews/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-700 hover:shadow active:scale-[0.98]"
          >
            <Pencil className="h-4 w-4" />
            후기 작성
          </Link>
        </div>
      </section>
    </main>
  );
}
