import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import { getStudyPostById } from "../data";

type Params = {
  params: Promise<{ id: string }>;
};

export default async function StudyMaterialDetailPage({ params }: Params) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId)) {
    notFound();
  }

  const post = getStudyPostById(postId);

  if (!post) {
    notFound();
  }

  return (
    <main className="bg-[#f5f5f5]">
      <PageHero
        imageUrl=""
        lines={["학업자료"]}
        crumbs={[
          { label: "게시판" },
          { label: "학업자료", href: "/board/study-materials" },
        ]}
        heightClass="h-[220px] lg:h-[260px]"
        heroClassName="bg-gradient-to-r from-[#e9e9e9] to-[#f2f2f2]"
        overlayClassName="opacity-70"
        overlayStyle={{
          background:
            "linear-gradient(120deg, transparent 28%, rgba(255,255,255,0.75) 28%, rgba(255,255,255,0.75) 33%, transparent 33%, transparent 42%, rgba(255,255,255,0.5) 42%, rgba(255,255,255,0.5) 47%, transparent 47%)",
        }}
        titleClassName="text-[#1f2937] text-3xl lg:text-4xl"
        breadcrumbWrapClassName="border-gray-300"
      />

      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <article className="mt-16 border-t-2 border-gray-900 pb-16">
          <header className="border-b border-gray-300 py-10">
            <h1 className="text-3xl font-bold text-black lg:text-4xl">{post.title}</h1>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-base text-gray-500 lg:text-lg">
              <p>
                <span className="font-semibold text-gray-700">{post.author}</span>
                <span className="mx-2 text-gray-300">|</span>
                <span>{post.createdAt}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-700">조회수</span> {post.views}
              </p>
            </div>
          </header>

          <div className="border-b border-gray-300 py-12 text-lg leading-[1.95] text-black">
            {post.content.map((line, index) =>
              line.length === 0 ? (
                <div key={`blank-${index}`} className="h-8" aria-hidden="true" />
              ) : (
                <p key={`${line}-${index}`}>{line}</p>
              )
            )}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/board/study-materials"
              className="inline-flex min-w-[200px] justify-center bg-black px-10 py-4 text-base font-semibold text-white hover:bg-black/85"
            >
              LIST
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
