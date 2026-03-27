"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { apiGet } from "@/api/apiClient";
import { ChevronLeft, ChevronRight, Pin, Pencil } from "lucide-react";
import { useFadeIn } from "@/hooks/useFadeIn";
import { maskName } from "@/lib/maskName";

interface ReviewItem {
  reviewId: number;
  title: string;
  authorName: string;
  viewCount: number;
  createdAt: string;
  isTop: boolean;
}

interface ReviewsListResponse {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  reviews: ReviewItem[];
}

/** 목록 API 페이지 크기 — 관리자 후기 페이지(REVIEW_LIST_PAGE_SIZE)와 동일 */
const REVIEW_LIST_PAGE_SIZE = 10;

function coerceCount(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/**
 * Spring Page / 공통 래핑 등으로 `totalElements` 위치가 달라져도 찾음.
 * 관리자 `fetchAdminReviews`가 받는 JSON과 동일 필드면 반드시 잡혀야 함.
 */
function extractTotalElementsFromBody(raw: unknown): number {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const dataVal = r.data;
  const dataObj =
    dataVal && typeof dataVal === "object" && !Array.isArray(dataVal)
      ? (dataVal as Record<string, unknown>)
      : null;
  const pageObj =
    r.page && typeof r.page === "object"
      ? (r.page as Record<string, unknown>)
      : null;

  const tryKeys = (obj: Record<string, unknown>) =>
    coerceCount(obj.totalElements) ??
    coerceCount(obj.total_elements) ??
    coerceCount(obj.total);

  const candidates: (number | undefined)[] = [
    tryKeys(r),
    dataObj ? tryKeys(dataObj) : undefined,
    pageObj ? tryKeys(pageObj) : undefined,
    dataObj && typeof dataObj.page === "object"
      ? tryKeys(dataObj.page as Record<string, unknown>)
      : undefined,
  ];

  for (const c of candidates) {
    if (c !== undefined && c >= 0) return Math.floor(c);
  }
  return 0;
}

/**
 * 공통 클라이언트 목록 API가 totalElements를 안 내려줄 때(필드 자체 없음).
 * 관리자 API처럼 totalElements가 오면 위 extract만 쓰면 됨.
 */
function inferTotalElementsWhenMissing(
  totalPages: number,
  currentPage: number,
  reviewsLength: number,
  pageSize: number
): number {
  if (reviewsLength <= 0) return 0;
  if (totalPages <= 1) return reviewsLength;
  if (currentPage === totalPages) {
    return (totalPages - 1) * pageSize + reviewsLength;
  }
  return reviewsLength + (totalPages - currentPage);
}

/** 관리자 목록 API와 동일하게 응답 정규화 (totalElements + reviews) */
function parseReviewsListResponse(raw: unknown): ReviewsListResponse {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  /** `data`가 배열이면 메타데이터는 보통 루트(r)에 있음 — inner로 쓰면 totalElements를 놓침 */
  const inner: Record<string, unknown> =
    r.data && typeof r.data === "object" && !Array.isArray(r.data)
      ? (r.data as Record<string, unknown>)
      : r;
  const pick = (key: string) => inner[key] ?? r[key];

  const reviewsRaw = pick("reviews") ?? pick("content");
  const reviews = Array.isArray(reviewsRaw) ? (reviewsRaw as ReviewItem[]) : [];

  const tp = pick("totalPages") ?? pick("total_pages");
  const totalPages =
    typeof tp === "number" && Number.isFinite(tp) && tp > 0 ? tp : 1;

  const cp = pick("currentPage") ?? pick("current_page");
  const currentPage =
    typeof cp === "number" && Number.isFinite(cp) && cp > 0 ? cp : 1;

  let totalElements = extractTotalElementsFromBody(raw);
  if (totalElements <= 0 && reviews.length > 0) {
    totalElements = inferTotalElementsWhenMissing(
      totalPages,
      currentPage,
      reviews.length,
      REVIEW_LIST_PAGE_SIZE
    );
  }

  return { currentPage, totalPages, totalElements, reviews };
}

function formatCreatedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}

export default function ReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<ReviewsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fade = useFadeIn(0.1);
  const contentTopRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiGet<unknown>(`/v1/common/reviews?page=${currentPage}`, {
      useRelativePath: true,
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (cancelled) return;
        setData(parseReviewsListResponse(res));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "목록을 불러오지 못했습니다."
        );
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
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

  const pagedPosts = data?.reviews ?? [];
  const totalPages = data?.totalPages ?? 1;
  /** 관리자 페이지와 동일: 목록 응답의 totalElements */
  const totalElements = data?.totalElements ?? 0;
  /** 이번 페이지 우수 후기 — 수식에서만큼 제외 */
  const bestReviews = pagedPosts.filter((p) => p.isTop);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <PageHero
        imageUrl="/images/note.jpg"
        heroStyle={{ backgroundPosition: "center 5%" }}
        lines={["이용 후기"]}
        crumbs={[
          { label: "이용 후기", href: "/board/reviews" },
        ]}
      />

      <section
        ref={(el) => {
          (fade.ref as React.MutableRefObject<HTMLElement | null>).current = el;
          contentTopRef.current = el;
        }}
        className="mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-14"
      >
        {/* 인트로 타이틀 (다른 페이지와 동일 스타일) */}
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

        {/* 모바일·태블릿: 카드 리스트 */}
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
          ) : pagedPosts.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200/60">
              <p className="text-slate-500">등록된 후기가 없습니다.</p>
            </div>
          ) : (
          pagedPosts.map((post, rowIndex) => {
            const isPinned = post.isTop;
            const index = pagedPosts
              .slice(0, rowIndex)
              .filter((p) => !p.isTop).length;
            return (
              <Link
                key={post.reviewId}
                href={`/board/reviews/${post.reviewId}`}
                className={`block rounded-2xl p-5 transition-shadow hover:shadow-md active:scale-[0.99] ${
                  isPinned
                    ? "bg-slate-100 shadow-sm ring-1 ring-slate-300/80"
                    : "bg-white shadow-sm ring-1 ring-slate-200/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {isPinned ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900">
                          <Pin className="h-3 w-3" />
                          우수 후기
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          #
                          {totalElements -
                            bestReviews.length -
                            (currentPage - 1) * REVIEW_LIST_PAGE_SIZE -
                            index}
                        </span>
                      )}
                    </div>
                    <h3 className={`line-clamp-2 ${isPinned ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                      {post.title}
                    </h3>
                    <div className={`mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${isPinned ? "font-semibold text-slate-700" : "text-slate-500"}`}>
                      <span>{maskName(post.authorName)}</span>
                      <span>{formatCreatedAt(post.createdAt)}</span>
                      <span>조회 {post.viewCount}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
                </div>
              </Link>
            );
          })
          )}
        </div>

        {/* 데스크톱: 테이블 */}
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
                    <td colSpan={5} className="px-8 py-16 text-center text-red-600">{error}</td>
                  </tr>
                ) : pagedPosts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-slate-500">등록된 후기가 없습니다.</td>
                  </tr>
                ) : (
                pagedPosts.map((post, rowIndex) => {
                  const isPinned = post.isTop;
                  const index = pagedPosts
                    .slice(0, rowIndex)
                    .filter((p) => !p.isTop).length;
                  return (
                    <tr
                      key={post.reviewId}
                      className={`group transition-colors ${
                        isPinned ? "bg-slate-100 hover:bg-slate-200/80" : "hover:bg-slate-50/70"
                      }`}
                    >
                      <td className="px-8 py-5 text-center">
                        {isPinned ? (
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-900">
                            <Pin className="h-3.5 w-3.5" />
                            우수 후기
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-slate-400">
                            {totalElements -
                              bestReviews.length -
                              (currentPage - 1) * REVIEW_LIST_PAGE_SIZE -
                              index}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <Link
                          href={`/board/reviews/${post.reviewId}`}
                          className={`inline-flex items-center gap-1 text-base ${
                            isPinned ? "font-bold text-slate-900" : "font-medium text-slate-800"
                          }`}
                        >
                          {post.title}
                          <ChevronRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </td>
                      <td className={`px-8 py-5 text-center text-base ${isPinned ? "font-semibold text-slate-800" : "text-slate-500"}`}>{maskName(post.authorName)}</td>
                      <td className={`px-8 py-5 text-center text-base ${isPinned ? "font-semibold text-slate-800" : "text-slate-500"}`}>{formatCreatedAt(post.createdAt)}</td>
                      <td className={`px-8 py-5 text-center text-base ${isPinned ? "font-semibold text-slate-800" : "text-slate-400"}`}>{post.viewCount}</td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
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
                    currentPage === page
                      ? "bg-slate-800 text-white"
                      : "text-gray-600 hover:bg-gray-100"
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

        {/* 내 후기 조회, 후기 작성 */}
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
