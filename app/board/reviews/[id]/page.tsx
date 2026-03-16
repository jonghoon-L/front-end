import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { getReviewPostById } from "../data";
import BranchBadge from "../BranchBadge";
import { ArrowLeft, Eye } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function ReviewDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { from } = await searchParams;
  const postId = Number(id);

  if (!Number.isInteger(postId)) {
    notFound();
  }

  const post = getReviewPostById(postId);

  if (!post) {
    notFound();
  }

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

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10 lg:py-14">
        <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
          {/* 헤더 */}
          <header className="border-b border-slate-100 bg-white px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <h1 className="text-xl font-bold leading-snug text-slate-900 lg:text-2xl">
              {post.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
              <span className="font-medium text-slate-700">{post.author}</span>
              <span className="text-slate-300">·</span>
              <BranchBadge branch={post.branch} />
              <span className="text-slate-300">·</span>
              <span>{post.createdAt}</span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-slate-400" />
                {post.views}
              </span>
            </div>
          </header>

          {/* 본문 */}
          <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="prose prose-slate max-w-none break-words text-slate-700">
              {post.content.map((line, index) =>
                line.length === 0 ? (
                  <div key={`blank-${index}`} className="h-6" aria-hidden="true" />
                ) : (
                  <p key={`${line}-${index}`} className="mb-4 leading-[1.9] last:mb-0">
                    {line}
                  </p>
                )
              )}
            </div>
          </div>

          {/* 목록으로 */}
          <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-5 sm:px-8 sm:py-6 lg:px-10">
            <Link
              href={from === "mine" ? "/board/reviews/mine" : "/board/reviews"}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-700 hover:shadow"
            >
              <ArrowLeft className="h-4 w-4" />
              {from === "mine" ? "내 후기 목록으로 돌아가기" : "목록으로"}
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
