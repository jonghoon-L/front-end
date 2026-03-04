import Link from "next/link";
import PageHero from "@/components/PageHero";
import { studyPosts } from "./data";

export default function StudyMaterialsPage() {
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
        <div className="mt-16 overflow-x-auto">
          <table className="w-full min-w-[760px] border-t-2 border-gray-900 bg-transparent text-left">
            <thead>
              <tr className="border-b border-gray-300 text-[#1f2937]">
                <th className="px-10 py-5 text-base font-semibold">번호</th>
                <th className="px-6 py-5 text-base font-semibold">제목</th>
                <th className="px-6 py-5 text-base font-semibold">작성자</th>
                <th className="px-6 py-5 text-base font-semibold">작성일</th>
                <th className="px-6 py-5 text-base font-semibold">조회</th>
              </tr>
            </thead>
            <tbody>
              {studyPosts.map((post) => (
                <tr key={post.id} className="border-b border-gray-300 text-base text-[#111827]">
                  <td className="px-10 py-5">
                    <span className="mr-4 font-semibold">{post.category}</span>
                    <span>{post.id}</span>
                  </td>
                  <td className="px-6 py-5 font-semibold">
                    <Link
                      href={`/board/study-materials/${post.id}`}
                      className="hover:text-black/70 hover:underline"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-5">{post.author}</td>
                  <td className="px-6 py-5">{post.createdAt}</td>
                  <td className="px-6 py-5">{post.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
