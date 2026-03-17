"use client";

import { useState, useMemo } from "react";
import { Bell, Users } from "lucide-react";

type Status = "WAITING" | "CONTACTED" | "REGISTERED" | "CANCELED";

type TabId =
  | "SEM1_N"
  | "SEM1_HI"
  | "SEM2_N"
  | "SEM2_HI"
  | "SUMMER"
  | "WINTER";

const TABS = [
  { id: "SEM1_N" as const, label: "1학기 N수관", season: "SEMESTER_1" as const, branch: "N" as const },
  { id: "SEM1_HI" as const, label: "1학기 하이엔드관", season: "SEMESTER_1" as const, branch: "Hi-end" as const },
  { id: "SEM2_N" as const, label: "2학기 N수관", season: "SEMESTER_2" as const, branch: "N" as const },
  { id: "SEM2_HI" as const, label: "2학기 하이엔드관", season: "SEMESTER_2" as const, branch: "Hi-end" as const },
  { id: "SUMMER" as const, label: "여름캠프", season: "SUMMER" as const, branch: null },
  { id: "WINTER" as const, label: "겨울캠프", season: "WINTER" as const, branch: null },
];

type WaitlistItem = {
  id: number;
  name: string;
  age: number;
  phone: string;
  appliedAt: string;
  status: Status;
  season: "SEMESTER_1" | "SEMESTER_2" | "SUMMER" | "WINTER";
  branch: "N" | "Hi-end" | null;
};

const STATUS_LABELS: Record<Status, string> = {
  WAITING: "대기 중",
  CONTACTED: "연락 완료",
  REGISTERED: "등록 완료",
  CANCELED: "취소됨",
};

const STATUS_STYLES: Record<
  Status,
  { bg: string; text: string; border: string }
> = {
  WAITING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  CONTACTED: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  REGISTERED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  CANCELED: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

const DUMMY_DATA: WaitlistItem[] = [
  { id: 1, name: "이종훈", age: 19, phone: "010-1234-5678", appliedAt: "2025-02-20", status: "WAITING", season: "SEMESTER_1", branch: "N" },
  { id: 2, name: "강찬", age: 20, phone: "010-2345-6789", appliedAt: "2025-02-21", status: "CONTACTED", season: "SEMESTER_1", branch: "N" },
  { id: 3, name: "구희원", age: 18, phone: "010-3456-7890", appliedAt: "2025-02-22", status: "REGISTERED", season: "SEMESTER_1", branch: "N" },
  { id: 4, name: "김나경", age: 21, phone: "010-4567-8901", appliedAt: "2025-02-23", status: "WAITING", season: "SEMESTER_1", branch: "N" },
  { id: 5, name: "김동호", age: 19, phone: "010-5678-9012", appliedAt: "2025-02-24", status: "CANCELED", season: "SEMESTER_1", branch: "Hi-end" },
  { id: 6, name: "김정범", age: 20, phone: "010-6789-0123", appliedAt: "2025-02-25", status: "CONTACTED", season: "SEMESTER_2", branch: "N" },
  { id: 8, name: "모정원", age: 18, phone: "010-8901-2345", appliedAt: "2025-02-26", status: "REGISTERED", season: "SEMESTER_2", branch: "Hi-end" },
  { id: 9, name: "박예은", age: 21, phone: "010-9012-3456", appliedAt: "2025-02-27", status: "WAITING", season: "SUMMER", branch: null },
  { id: 10, name: "박인서", age: 19, phone: "010-0123-4567", appliedAt: "2025-02-27", status: "CONTACTED", season: "SUMMER", branch: null },
  { id: 11, name: "박희원", age: 20, phone: "010-1111-2222", appliedAt: "2025-02-28", status: "WAITING", season: "SUMMER", branch: null },
  { id: 12, name: "이하린", age: 18, phone: "010-3333-4444", appliedAt: "2025-02-28", status: "REGISTERED", season: "WINTER", branch: null },
  { id: 13, name: "황예원", age: 21, phone: "010-5555-6666", appliedAt: "2025-02-28", status: "WAITING", season: "WINTER", branch: null },
];

export default function WaitlistsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("SEM1_N");
  const [items, setItems] = useState<WaitlistItem[]>(DUMMY_DATA);
  const [selectedStudent, setSelectedStudent] = useState<WaitlistItem | null>(null);
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null);

  const currentTabConfig = TABS.find((t) => t.id === activeTab)!;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.season !== currentTabConfig.season) return false;
      if (currentTabConfig.branch === null) return item.branch === null;
      return item.branch === currentTabConfig.branch;
    });
  }, [items, currentTabConfig]);

  const handleStatusSelectChange = (student: WaitlistItem, newStatus: Status) => {
    if (student.status === newStatus) return;
    setSelectedStudent(student);
    setPendingStatus(newStatus);
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setPendingStatus(null);
  };

  const handleConfirm = () => {
    if (!selectedStudent || !pendingStatus) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedStudent.id ? { ...item, status: pendingStatus } : item
      )
    );
    console.log(`[API 호출] ${selectedStudent.id}번 학생 상태 ${pendingStatus}로 PATCH 요청 (문자 발송 됨)`);
    closeModal();
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
            <Users className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">대기열 관리</h1>
        </div>
        <p className="mt-2 text-slate-600">
          등록 대기 학생들을 조회하고 상태를 최신화합니다.
        </p>
      </div>

      {/* Tab Menu */}
      <div className="mb-6 flex gap-1 rounded-lg bg-slate-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 min-w-0 cursor-pointer rounded-md px-4 py-2.5 text-sm font-medium
              transition-all duration-200 ease-out
              ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-800"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-opacity duration-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                대기 순번
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                이름
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                나이
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                연락처
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                신청일
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                상태 변경
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-16 text-center text-sm text-slate-500"
                >
                  해당 구간에 등록된 대기자가 없습니다.
                </td>
              </tr>
            ) : (
              filteredItems.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-0 transition-colors hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-800">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.age}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.appliedAt}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusSelectChange(item, e.target.value as Status)
                      }
                      className={`
                        min-w-[120px] max-w-[140px] rounded-lg border px-3 py-2 text-sm font-medium
                        cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300
                        ${STATUS_STYLES[item.status].bg}
                        ${STATUS_STYLES[item.status].text}
                        ${STATUS_STYLES[item.status].border}
                      `}
                    >
                      {(Object.keys(STATUS_LABELS) as Status[]).map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Modal */}
      {selectedStudent && pendingStatus && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-[logo-transition-fade-in_0.25s_ease-out]"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-[confirm-modal-appear_0.6s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-12 h-12 mx-auto items-center justify-center rounded-full bg-blue-50 p-3 text-blue-500">
              <Bell className="w-6 h-6" strokeWidth={2} />
            </div>
            <h2 id="modal-title" className="mt-4 text-center text-xl font-bold text-gray-900">
              등록 상태 변경 확인
            </h2>
            <p className="mt-3 text-center text-slate-600">
              정말 <span className="font-semibold text-blue-600">{selectedStudent.name}</span> 학생의 대기 상태를{" "}
              <span className="font-semibold text-blue-600">{STATUS_LABELS[pendingStatus]}</span>로 변경하시겠습니까?
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
              변경 시 학생에게 안내 문자가 자동 발송됩니다.
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 active:scale-[0.98]"
              >
                변경 확인
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 cursor-pointer rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 active:scale-[0.98]"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
