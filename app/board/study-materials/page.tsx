"use client";

import PageHero from "@/components/PageHero";
import { useFadeIn } from "@/hooks/useFadeIn";
import { studyMaterials } from "./data";
import { Download, FileText, FileSpreadsheet, FileImage, File } from "lucide-react";

function getFileExtension(url: string): string {
  const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : "";
}

function FileTypeDisplay({ url, title }: { url: string; title: string }) {
  const ext = getFileExtension(url);

  const iconMap: Record<string, { icon: typeof FileText; color: string }> = {
    pdf: { icon: FileText, color: "text-red-600" },
    doc: { icon: FileText, color: "text-blue-600" },
    docx: { icon: FileText, color: "text-blue-600" },
    ppt: { icon: FileText, color: "text-orange-600" },
    pptx: { icon: FileText, color: "text-orange-600" },
    xls: { icon: FileSpreadsheet, color: "text-green-600" },
    xlsx: { icon: FileSpreadsheet, color: "text-green-600" },
    jpg: { icon: FileImage, color: "text-amber-500" },
    jpeg: { icon: FileImage, color: "text-amber-500" },
    png: { icon: FileImage, color: "text-sky-500" },
    gif: { icon: FileImage, color: "text-pink-500" },
    hwp: { icon: FileText, color: "text-blue-500" },
    txt: { icon: FileText, color: "text-gray-600" },
  };

  const { icon: Icon, color } = iconMap[ext] ?? { icon: File, color: "text-gray-500" };

  return (
    <span className="inline-flex items-center gap-2">
      <Icon className={`h-5 w-5 shrink-0 ${color}`} aria-hidden />
      <span className="font-medium text-slate-800">{title}</span>
    </span>
  );
}

export default function StudyMaterialsPage() {
  const fade = useFadeIn(0.1);
  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <PageHero
        imageUrl="/images/place/n/n_p25.jpg"
        heroStyle={{ backgroundPosition: "center 55%" }}
        lines={["학업 자료"]}
        crumbs={[
          { label: "학업 자료" },
        ]}
      />

      <section
        ref={fade.ref}
        className="mx-auto max-w-5xl px-4 sm:px-6 py-10 lg:py-14 transition-all duration-700 ease-out"
        style={{
          opacity: fade.isVisible ? 1 : 0,
          transform: fade.isVisible ? "translateY(0)" : "translateY(24px)",
        }}
      >
        {/* 인트로 타이틀 */}
        <h2 className="mb-16 mt-0 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          <span className="block">로드맵 선생님들이 정리한</span>
          <span className="block">수능 준비에 필요한 자료를 무료로 받아보세요</span>
        </h2>

        {/* 모바일·태블릿: 카드 리스트 */}
        <div className="lg:hidden space-y-3">
          {studyMaterials.map((item, index) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60"
            >
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <span className="mb-2 inline-block text-xs font-medium text-slate-400">
                    #{index + 1}
                  </span>
                  <div className="mb-4">
                    <FileTypeDisplay url={item.downloadUrl} title={item.title} />
                  </div>
                  <div className="flex justify-end">
                    <a
                      href={item.downloadUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.98] hover:bg-emerald-500"
                      aria-label={`${item.title} 다운받기`}
                    >
                      <Download className="h-4 w-4" />
                      다운받기
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 데스크톱: 테이블 */}
        <div className="hidden lg:block overflow-hidden bg-white shadow-sm ring-1 ring-slate-200/60">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                    번호
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    자료 제목
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                    다운받기
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studyMaterials.map((item, index) => (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4 text-center text-sm font-medium text-slate-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <FileTypeDisplay url={item.downloadUrl} title={item.title} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <a
                          href={item.downloadUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-600 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                          aria-label={`${item.title} 다운받기`}
                        >
                          <Download className="h-4 w-4" aria-hidden />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
