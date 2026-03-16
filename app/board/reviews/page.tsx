"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { reviewPosts } from "./data";
import type { ReviewPost } from "./data";
import BranchBadge from "./BranchBadge";
import { ChevronLeft, ChevronRight, MessageSquare, Pin, Pencil } from "lucide-react";

const ITEMS_PER_PAGE = 10;
const BRANCH_OPTIONS = [
  { value: "", label: "전체" },
  { value: "N수생관", label: "N수생관" },
  { value: "하이엔드관", label: "하이엔드관" },
] as const;

export default function ReviewsPage() {
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const sortedPosts = useMemo(() => {
    const list = [...reviewPosts];
    list.sort((a, b) => {
      const aTop = a.isTop ? 1 : 0;
      const bTop = b.isTop ? 1 : 0;
      if (aTop !== bTop) return bTop - aTop;
      return 0;
    });
    return list;
  }, []);

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / ITEMS_PER_PAGE));
  const pagedPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedPosts, currentPage]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50">
      <PageHero
        imageUrl=""
        lines={["이용 후기"]}
        crumbs={[
          { label: "게시판" },
          { label: "이용 후기", href: "/board/reviews" },
        ]}
        heightClass="h-[200px] lg:h-[240px]"
        heroClassName="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800"
        overlayClassName="opacity-0"
        titleClassName="text-white text-xl lg:text-4xl font-bold tracking-tight"
        breadcrumbWrapClassName="border-slate-200 bg-white"
      />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10 lg:py-14">
        {/* 인트로 + 관 선택 */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <MessageSquare className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">학원생의 생생한 후기</h2>
              <p className="text-sm text-slate-500">로드맵을 이용한 학생들의 솔직한 경험을 확인해 보세요.</p>
            </div>
          </div>
          <div className="flex shrink-0">
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-4 pr-2 shadow-sm ring-1 ring-slate-200/50">
              <label htmlFor="branch-filter" className="text-sm font-medium text-slate-600">
                관 선택
              </label>
              <select
                id="branch-filter"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="border-0 bg-transparent py-1 pr-6 text-sm font-medium text-slate-700 focus:outline-none focus:ring-0"
              >
                {BRANCH_OPTIONS.map((opt) => (
                  <option key={opt.value || "all"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 모바일·태블릿: 카드 리스트 */}
        <div className="lg:hidden space-y-3">
          {pagedPosts.map((post, index) => {
            const isPinned = post.isTop;
            const fullIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
            const regularNum = sortedPosts.slice(0, fullIndex).filter((p) => !p.isTop).length + 1;
            return (
              <Link
                key={post.id}
                href={`/board/reviews/${post.id}`}
                className={`block rounded-2xl p-5 transition-shadow hover:shadow-md active:scale-[0.99] ${
                  isPinned
                    ? "bg-amber-50/80 shadow-sm ring-1 ring-amber-200/60"
                    : "bg-white shadow-sm ring-1 ring-slate-200/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {isPinned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          <Pin className="h-3 w-3" />
                          고정
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">#{regularNum}</span>
                      )}
                      <BranchBadge branch={post.branch} />
                    </div>
                    <h3 className={`font-semibold line-clamp-2 ${isPinned ? "text-amber-900" : "text-slate-800"}`}>
                      {post.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>{post.author}</span>
                      <span>{post.createdAt}</span>
                      <span>조회 {post.views}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* 데스크톱: 테이블 */}
        <div className="hidden lg:block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                    순번
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                    관 종류
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    제목
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                    작성자
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                    작성일
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                    조회
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedPosts.map((post, index) => {
                  const isPinned = post.isTop;
                  const fullIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                  const regularNum = sortedPosts.slice(0, fullIndex).filter((p) => !p.isTop).length + 1;
                  return (
                    <tr
                      key={post.id}
                      className={`group transition-colors ${
                        isPinned ? "bg-amber-50/50 hover:bg-amber-50/70" : "hover:bg-slate-50/70"
                      }`}
                    >
                      <td className="px-6 py-4 text-center">
                        {isPinned ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            <Pin className="h-3.5 w-3.5" />
                            고정
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-slate-400">{regularNum}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <BranchBadge branch={post.branch} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/board/reviews/${post.id}`}
                          className={`inline-flex items-center gap-1 font-medium transition-colors group-hover:text-emerald-600 ${
                            isPinned ? "text-amber-900" : "text-slate-800"
                          }`}
                        >
                          {post.title}
                          <ChevronRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-500">{post.author}</td>
                      <td className="px-6 py-4 text-center text-sm text-slate-500">{post.createdAt}</td>
                      <td className="px-6 py-4 text-center text-sm text-slate-400">{post.views}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-1" aria-label="페이지 선택">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
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
                  className={`h-9 min-w-[2.25rem] rounded-lg px-2 text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
              aria-label="다음 페이지"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}

        {/* 내가 작성한 후기, 후기 작성 */}
        <div className="mt-8 flex flex-wrap items-center justify-end gap-2">
          <Link
            href="/board/reviews/mine"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
          >
            내가 작성한 후기
          </Link>
          <Link
            href="/board/reviews/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-[0.98]"
          >
            <Pencil className="h-4 w-4" />
            후기 작성
          </Link>
        </div>
      </section>
    </main>
  );
}
