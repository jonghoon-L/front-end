import Link from "next/link";
import { Calendar, Users, MessageSquare } from "lucide-react";

const adminMenuCards = [
  {
    href: "/admin/consultations",
    label: "상담 일정 조회",
    description: "사이트를 통해 신청받은 학생 상담 일정을 조회합니다.",
    Icon: Calendar,
    iconColor: "text-blue-500",
    iconBgColor: "bg-blue-50",
  },
  {
    href: "/admin/waitlists",
    label: "대기열 관리",
    description: "등록 대기 학생들을 조회하고 상태를 최신화합니다.",
    Icon: Users,
    iconColor: "text-blue-500",
    iconBgColor: "bg-blue-50",
  },
  {
    href: "/admin/reviews",
    label: "이용 후기 관리",
    description: (
      <>
        사이트를 통해 작성한 후기들의 승인 상태를 관리하고
        <br />
        우수 후기를 지정합니다.
      </>
    ),
    Icon: MessageSquare,
    iconColor: "text-blue-500",
    iconBgColor: "bg-blue-50",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-10">
        RoadMap 관리자 시스템에 오신 것을 환영합니다.
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminMenuCards.map((card) => {
          const IconComponent = card.Icon;
          return (
            <div
              key={card.href}
              className="flex flex-col text-left min-h-[200px] p-8 bg-white rounded-xl shadow-md border border-slate-200"
            >
              <div className="flex flex-col flex-1">
                <div
                  className={`inline-flex w-10 h-10 items-center justify-center rounded-lg ${card.iconBgColor} ${card.iconColor} mb-4`}
                >
                  <IconComponent className="w-5 h-5" strokeWidth={2} aria-hidden />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  {card.label}
                </h2>
                <p className="text-sm text-gray-500 flex-1">
                  {card.description}
                </p>
                <Link
                  href={card.href}
                  className="inline-flex items-center justify-center px-3 py-1.5 mt-4 self-end text-xs font-medium text-slate-600 bg-slate-100 hover:bg-blue-500 hover:text-white hover:scale-105 rounded transition-all duration-300 cursor-pointer"
                >
                  바로 가기
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
