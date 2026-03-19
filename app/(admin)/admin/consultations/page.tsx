"use client";

import { useState, useMemo } from "react";
import { Calendar } from "lucide-react";
import ConsultationCalendar from "@/components/ConsultationCalendar";
import { getAllTimeSlotsForDate } from "@/lib/consultationSlots";

type Branch = "N" | "Hi-end";

type ConsultationItem = {
  id: number;
  date: string;
  time: string;
  name: string;
  age: number;
  branch: Branch;
};

const BRANCH_LABELS: Record<Branch, string> = {
  N: "N수생관",
  "Hi-end": "하이엔드관",
};

/** 요구사항에 맞는 시간대만 사용한 임시 상담 데이터 (N수관: 평일/토 10:00,17:00 / 하이엔드: 평일 17:00,20:00, 토 10:00,16:00) */
const MOCK_CONSULTATIONS: ConsultationItem[] = [
  { id: 1, date: "2026-03-17", time: "10:00", name: "김민준", age: 19, branch: "N" },
  { id: 2, date: "2026-03-17", time: "17:00", name: "이서연", age: 18, branch: "N" },
  { id: 3, date: "2026-03-17", time: "20:00", name: "최수빈", age: 21, branch: "Hi-end" },
  { id: 4, date: "2026-03-18", time: "10:00", name: "정하은", age: 19, branch: "N" },
  { id: 5, date: "2026-03-18", time: "17:00", name: "강준서", age: 18, branch: "N" },
  { id: 6, date: "2026-03-18", time: "20:00", name: "박지호", age: 20, branch: "Hi-end" },
  { id: 7, date: "2026-03-19", time: "17:00", name: "조예린", age: 20, branch: "Hi-end" },
  { id: 8, date: "2026-03-19", time: "10:00", name: "윤도윤", age: 19, branch: "N" },
  { id: 9, date: "2026-03-19", time: "20:00", name: "임서윤", age: 21, branch: "Hi-end" },
  { id: 10, date: "2026-03-20", time: "10:00", name: "한지우", age: 18, branch: "N" },
  { id: 11, date: "2026-03-20", time: "17:00", name: "오민지", age: 20, branch: "N" },
  { id: 12, date: "2026-03-21", time: "10:00", name: "신재윤", age: 19, branch: "Hi-end" },
  { id: 13, date: "2026-03-21", time: "16:00", name: "권수아", age: 18, branch: "Hi-end" },
  { id: 14, date: "2026-03-21", time: "17:00", name: "배성민", age: 20, branch: "N" },
];

function formatDateForInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ConsultationsPage() {
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const reservationCountByDate = useMemo(() => {
    const count: Record<string, number> = {};
    MOCK_CONSULTATIONS.forEach((c) => {
      count[c.date] = (count[c.date] ?? 0) + 1;
    });
    return count;
  }, []);

  const consultationsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return MOCK_CONSULTATIONS.filter((c) => c.date === selectedDate).sort(
      (a, b) => a.time.localeCompare(b.time)
    );
  }, [selectedDate]);

  const reservationByTime = useMemo(() => {
    const map: Record<string, ConsultationItem> = {};
    consultationsForDate.forEach((c) => {
      map[c.time] = c;
    });
    return map;
  }, [consultationsForDate]);

  const timeSlotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const d = new Date(selectedDate + "T12:00:00");
    return getAllTimeSlotsForDate(d);
  }, [selectedDate]);

  const displayDate = selectedDate
    ? `${selectedDate.slice(0, 4)}년 ${selectedDate.slice(5, 7)}월 ${selectedDate.slice(8, 10)}일`
    : null;

  return (
    <div className="flex flex-col p-8 flex-1 min-h-0">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
            <Calendar className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">상담 일정 조회</h1>
        </div>
        <p className="mt-2 text-slate-600">
          좌측 달력에서 날짜를 선택하면 해당 날짜의 상담 목록을 확인할 수 있습니다.
        </p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[1fr_1fr] gap-6">
        {/* 좌측: 월간 달력 */}
        <div className="min-w-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
            <ConsultationCalendar
              calendarMonth={calendarMonth}
              selectedDate={selectedDate}
              onMonthChange={setCalendarMonth}
              onDateSelect={setSelectedDate}
              reservationCountByDate={reservationCountByDate}
              disablePastDates={false}
            />
          </div>
        </div>

        {/* 우측: 일간 상세 타임라인 */}
        <div className="flex-1 min-w-0 flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="shrink-0 px-6 py-4 border-b border-slate-200 bg-slate-50/80">
            <h2 className="text-lg font-semibold text-slate-800">
              {displayDate ?? "날짜를 선택해 주세요"}
            </h2>
            {selectedDate && (
              <p className="mt-1 text-sm text-slate-500">
                총 {consultationsForDate.length}건의 상담 예약
              </p>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {!selectedDate ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                좌측 달력에서 날짜를 선택해 주세요
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {timeSlotsForSelectedDate.map((time) => {
                  const consultation = reservationByTime[time];
                  const isN = consultation?.branch === "N";
                  const isHiEnd = consultation?.branch === "Hi-end";

                  return (
                    <div
                      key={time}
                      className="flex items-stretch gap-3 min-h-[52px] rounded-lg"
                    >
                      <div className="w-16 shrink-0 flex items-center text-sm font-medium text-slate-500 pt-1">
                        {time}
                      </div>
                      <div className="flex-1 min-w-0">
                        {consultation ? (
                          <div
                            className={`rounded-lg border-l-4 p-4 shadow-sm ${
                              isN
                                ? "border-blue-500 bg-blue-50/80"
                                : isHiEnd
                                  ? "border-teal-500 bg-teal-50/80"
                                  : "border-slate-300 bg-slate-50"
                            }`}
                          >
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                              <span className="font-semibold text-slate-800">
                                {consultation.name}
                              </span>
                              <span className="text-sm text-slate-600">
                                {consultation.age}세
                              </span>
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded ${
                                  isN
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-teal-100 text-teal-700"
                                }`}
                              >
                                {BRANCH_LABELS[consultation.branch]}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {consultation.time} 예약
                            </div>
                          </div>
                        ) : (
                          <div className="h-full min-h-[60px] rounded-lg bg-slate-50/50 border border-dashed border-slate-200" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
