import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import FadeInSection from "@/components/FadeInSection";
import { apiGet } from "@/api/apiClient";
import { ArrowLeft, Eye } from "lucide-react";

interface ReviewDetailResponse {
  reviewId: number;
  title: string;
  content: string;
  authorName: string;
  imageUrls?: string[];
  viewCount: number;
  createdAt: string;
}

function formatCreatedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function ReviewDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { from } = await searchParams;
  const reviewId = Number(id);

  if (!Number.isInteger(reviewId)) {
    notFound();
  }

  let post: ReviewDetailResponse;
  try {
    post = await apiGet<ReviewDetailResponse>(`/v1/common/reviews/${reviewId}`);
  } catch {
    notFound();
  }

  const contentLines = post.content.split(/\n/);

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

      <FadeInSection className="mx-auto max-w-3xl px-4 sm:px-6 py-10 lg:py-14">
        <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
          {/* 헤더 */}
          <header className="border-b border-slate-100 bg-white px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <h1 className="text-xl font-bold leading-snug text-slate-900 lg:text-2xl">
              {post.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
              <span className="font-medium text-slate-700">{post.authorName}</span>
              <span className="text-slate-300">·</span>
              <span>{formatCreatedAt(post.createdAt)}</span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-slate-400" />
                {post.viewCount}
              </span>
            </div>
          </header>

          {/* 본문 */}
          <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="prose prose-slate max-w-none break-words text-slate-700">
              {contentLines.map((line, index) =>
                line.trim() === "" ? (
                  <div key={`blank-${index}`} className="h-6" aria-hidden="true" />
                ) : (
                  <p key={`${index}-${line.slice(0, 30)}`} className="mb-4 leading-[1.9] last:mb-0">
                    {line}
                  </p>
                )
              )}
            </div>
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="mt-8 space-y-4">
                {post.imageUrls.map((url, index) => (
                  <div key={`img-${index}`} className="overflow-hidden rounded-lg">
                    <Image
                      src={url}
                      alt={`후기 이미지 ${index + 1}`}
                      width={800}
                      height={600}
                      className="h-auto w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 목록으로 */}
          <div className="flex justify-center border-t border-slate-100 bg-slate-50/50 px-5 py-5 sm:px-8 sm:py-6 lg:px-10">
            <Link
              href={from === "mine" ? "/board/reviews/mine" : "/board/reviews"}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-700 hover:shadow"
            >
              <ArrowLeft className="h-4 w-4" />
              {from === "mine" ? "내 후기 목록으로 돌아가기" : "목록으로"}
            </Link>
          </div>
        </article>
      </FadeInSection>
    </main>
  );
}
