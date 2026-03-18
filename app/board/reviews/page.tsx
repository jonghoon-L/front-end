"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { reviewPosts } from "./data";
import { blurName } from "@/lib/blurName";
import { ChevronLeft, ChevronRight, Pin, Pencil } from "lucide-react";
import { useFadeIn } from "@/hooks/useFadeIn";

const ITEMS_PER_PAGE = 10;

export default function ReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const fade = useFadeIn(0.1);

  const filteredAndSortedPosts = useMemo(() => {
    const list = [...reviewPosts];
    list.sort((a, b) => {
      const aTop = a.isTop ? 1 : 0;
      const bTop = b.isTop ? 1 : 0;
      if (aTop !== bTop) return bTop - aTop;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return list;
  }, []);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedPosts.length / ITEMS_PER_PAGE));
  const pagedPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedPosts, currentPage]);

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

      <section ref={fade.ref} className="mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-14">
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
          {pagedPosts.map((post, index) => {
            const isPinned = post.isTop;
            const fullIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
            const totalRegular = filteredAndSortedPosts.filter((p) => !p.isTop).length;
            const regularNum = totalRegular - filteredAndSortedPosts.slice(0, fullIndex).filter((p) => !p.isTop).length;
            return (
              <Link
                key={post.id}
                href={`/board/reviews/${post.id}`}
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
                        <span className="text-xs font-medium text-slate-400">#{regularNum}</span>
                      )}
                    </div>
                    <h3 className={`line-clamp-2 ${isPinned ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                      {post.title}
                    </h3>
                    <div className={`mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${isPinned ? "font-semibold text-slate-700" : "text-slate-500"}`}>
                      <span>{blurName(post.author)}</span>
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
                {pagedPosts.map((post, index) => {
                  const isPinned = post.isTop;
                  const fullIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                  const totalRegular = filteredAndSortedPosts.filter((p) => !p.isTop).length;
                  const regularNum = totalRegular - filteredAndSortedPosts.slice(0, fullIndex).filter((p) => !p.isTop).length;
                  return (
                    <tr
                      key={post.id}
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
                          <span className="text-sm font-medium text-slate-400">{regularNum}</span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <Link
                          href={`/board/reviews/${post.id}`}
                          className={`inline-flex items-center gap-1 text-base ${
                            isPinned ? "font-bold text-slate-900" : "font-medium text-slate-800"
                          }`}
                        >
                          {post.title}
                          <ChevronRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </td>
                      <td className={`px-8 py-5 text-center text-base ${isPinned ? "font-semibold text-slate-800" : "text-slate-500"}`}>{blurName(post.author)}</td>
                      <td className={`px-8 py-5 text-center text-base ${isPinned ? "font-semibold text-slate-800" : "text-slate-500"}`}>{post.createdAt}</td>
                      <td className={`px-8 py-5 text-center text-base ${isPinned ? "font-semibold text-slate-800" : "text-slate-400"}`}>{post.views}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
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
