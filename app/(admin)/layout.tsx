"use client";

import { useState } from "react";
import Link from "next/link";
import { Noto_Sans_KR } from "next/font/google";
import { LayoutDashboard, Calendar, Users, MessageSquare } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { TOKEN_KEYS_TO_CLEAR } from "@/api/apiClient";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-kr",
});

const sidebarParent = {
  href: "/admin",
  label: "대시보드 홈",
  Icon: LayoutDashboard,
};

const sidebarChildren = [
  { href: "/admin/consultations", label: "상담 일정 조회", Icon: Calendar },
  { href: "/admin/waitlists", label: "대기열 관리", Icon: Users },
  { href: "/admin/reviews", label: "이용 후기 관리", Icon: MessageSquare },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  const handleGoToMainClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmGoToMain = () => {
    TOKEN_KEYS_TO_CLEAR.forEach((key) => localStorage.removeItem(key));
    setShowConfirmModal(false);
    router.push("/");
  };

  const handleCancelGoToMain = () => {
    setShowConfirmModal(false);
  };

  const fontClassName = notoSansKr.className;

  if (isLoginPage) {
    return <div className={fontClassName}>{children}</div>;
  }

  return (
    <div className={`min-h-screen ${fontClassName} animate-[admin-dashboard-appear_0.8s_ease-out]`}>
      {/* 사이드바 - 화면 좌측 고정 */}
      <aside className="fixed top-0 left-0 z-40 h-screen w-[250px] flex-shrink-0 overflow-y-auto bg-slate-800 border-r border-slate-700 flex flex-col justify-between">
        <div>
          <div className="p-6">
            <Link href="/admin" className="block">
              <span className="text-white font-bold text-lg">RoadMap 관리자 시스템</span>
            </Link>
          </div>
          <nav className="px-3 pb-6">
            <ul className="space-y-0">
              {/* 최상위: 대시보드 홈 */}
              <li>
                <Link
                  href={sidebarParent.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                    pathname === "/admin"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5 flex-shrink-0" strokeWidth={2} aria-hidden />
                  {sidebarParent.label}
                </Link>
              </li>
              {/* 하위 메뉴 (트리 구조) */}
              <li className="relative mt-1">
                <div className="relative ml-5 pl-4 space-y-1 before:content-[''] before:block before:absolute before:left-0 before:top-0 before:w-[2px] before:bg-white/20 before:h-[calc(100%-1.25rem)]">
                  {sidebarChildren.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const IconComponent = item.Icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition before:content-[''] before:absolute before:left-[-1rem] before:top-1/2 before:h-0 before:w-4 before:border-b-2 before:border-white/20 ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "text-slate-300 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" strokeWidth={2} aria-hidden />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </li>
            </ul>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-700">
          <button
            type="button"
            onClick={handleGoToMainClick}
            className="w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-300 hover:bg-slate-700/50 transition text-left cursor-pointer"
          >
            🏠 메인 사이트로 이동
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 - 사이드바 너비만큼 좌측 마진 */}
      <main className="ml-[250px] min-h-screen min-w-0 flex-1 bg-slate-50">{children}</main>

      {/* 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[280px] bg-black/50 animate-[logo-transition-fade-in_0.3s_ease-out]">
          <div className="mx-4 w-full max-w-xl rounded-xl bg-white p-10 shadow-xl animate-[confirm-modal-appear_0.6s_ease-out]">
            <p className="mb-8 text-center text-base text-slate-700">
              관리자 시스템을 종료하고 메인 사이트로 이동하시겠습니까?
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleConfirmGoToMain}
                className="flex-1 rounded-lg bg-slate-700 px-5 py-3 text-base font-medium text-white hover:bg-slate-800 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] transition cursor-pointer"
              >
                네
              </button>
              <button
                type="button"
                onClick={handleCancelGoToMain}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-5 py-3 text-base font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-400 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
