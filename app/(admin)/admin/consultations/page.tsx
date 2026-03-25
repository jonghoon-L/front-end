"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Calendar } from "lucide-react";
import ConsultationCalendar from "@/components/ConsultationCalendar";
import {
  fetchAdminConsultations,
  adminConsultationBranchLabel,
  isHiEndBranch,
  type AdminConsultation,
  type AdminConsultationBranch,
} from "@/api/adminConsultations";

const BRANCHES: AdminConsultationBranch[] = ["N", "Hi-end"];

function formatDateYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthRange(calendarMonth: Date): { startDate: string; endDate: string } {
  const y = calendarMonth.getFullYear();
  const m = calendarMonth.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  return { startDate: formatDateYmd(start), endDate: formatDateYmd(end) };
}

/** N·하이엔드 API 결과 병합 (동일 consultationId는 한 건만 유지) */
function mergeConsultationsById(lists: AdminConsultation[][]): AdminConsultation[] {
  const map = new Map<number, AdminConsultation>();
  for (const list of lists) {
    for (const c of list) {
      map.set(c.consultationId, c);
    }
  }
  return Array.from(map.values());
}

async function fetchConsultationsForRange(
  startDate: string,
  endDate: string
): Promise<AdminConsultation[]> {
  const results = await Promise.all(
    BRANCHES.map((branch) =>
      fetchAdminConsultations({ branch, startDate, endDate }).then(
        (r) => r.consultations ?? []
      )
    )
  );
  return mergeConsultationsById(results);
}

export default function ConsultationsPage() {
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [monthConsultations, setMonthConsultations] = useState<AdminConsultation[]>([]);
  const [dayConsultations, setDayConsultations] = useState<AdminConsultation[]>([]);

  const [monthLoadState, setMonthLoadState] = useState<"idle" | "loading" | "error">("idle");
  const [monthError, setMonthError] = useState<string | null>(null);
  const [dayLoadState, setDayLoadState] = useState<"idle" | "loading" | "error">("idle");
  const [dayError, setDayError] = useState<string | null>(null);

  const loadMonthConsultations = useCallback(async () => {
    const { startDate, endDate } = monthRange(calendarMonth);
    setMonthLoadState("loading");
    setMonthError(null);
    try {
      const merged = await fetchConsultationsForRange(startDate, endDate);
      setMonthConsultations(merged);
      setMonthLoadState("idle");
    } catch (e) {
      setMonthConsultations([]);
      setMonthLoadState("error");
      setMonthError(e instanceof Error ? e.message : "달력 데이터를 불러오지 못했습니다.");
    }
  }, [calendarMonth]);

  const loadDayConsultations = useCallback(async (dateStr: string) => {
    setDayLoadState("loading");
    setDayError(null);
    try {
      const merged = await fetchConsultationsForRange(dateStr, dateStr);
      setDayConsultations(merged);
      setDayLoadState("idle");
    } catch (e) {
      setDayConsultations([]);
      setDayLoadState("error");
      setDayError(e instanceof Error ? e.message : "상담 목록을 불러오지 못했습니다.");
    }
  }, []);

  useEffect(() => {
    void loadMonthConsultations();
  }, [loadMonthConsultations]);

  useEffect(() => {
    if (!selectedDate) {
      setDayConsultations([]);
      setDayLoadState("idle");
      setDayError(null);
      return;
    }
    void loadDayConsultations(selectedDate);
  }, [selectedDate, loadDayConsultations]);

  const reservationCountByDate = useMemo(() => {
    const count: Record<string, number> = {};
    monthConsultations.forEach((c) => {
      count[c.date] = (count[c.date] ?? 0) + 1;
    });
    return count;
  }, [monthConsultations]);

  const consultationsForDate = useMemo(() => {
    return [...dayConsultations].sort((a, b) => {
      const t = a.time.localeCompare(b.time);
      if (t !== 0) return t;
      return a.branch.localeCompare(b.branch);
    });
  }, [dayConsultations]);

  const reservationsByTime = useMemo(() => {
    const map: Record<string, AdminConsultation[]> = {};
    consultationsForDate.forEach((c) => {
      if (!map[c.time]) map[c.time] = [];
      map[c.time].push(c);
    });
    return map;
  }, [consultationsForDate]);

  /** 예약이 실제로 있는 시각만 (빈 슬롯 제외) */
  const bookedTimeSlotsOnly = useMemo(() => {
    return Object.keys(reservationsByTime).sort((a, b) => a.localeCompare(b));
  }, [reservationsByTime]);

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
          좌측 달력에서 날짜를 선택하면 해당 날짜의 N수생관·하이엔드관 상담 일정을 함께 확인할 수 있습니다.
        </p>
        {monthLoadState === "loading" && (
          <p className="mt-2 text-sm text-slate-500">달력 예약 현황을 불러오는 중…</p>
        )}
        {monthLoadState === "error" && monthError && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {monthError}
          </p>
        )}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[1fr_1fr] gap-6">
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

        <div className="flex-1 min-w-0 flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="shrink-0 px-6 py-4 border-b border-slate-200 bg-slate-50/80">
            <h2 className="text-lg font-semibold text-slate-800">
              {displayDate ?? "날짜를 선택해 주세요"}
            </h2>
            {selectedDate &&
              dayLoadState !== "loading" &&
              dayLoadState !== "error" &&
              consultationsForDate.length > 0 && (
                <p className="mt-1 text-sm text-slate-500">
                  총 {consultationsForDate.length}건의 상담 예약 (N수생관·하이엔드관)
                </p>
              )}
            {selectedDate && dayLoadState === "loading" && (
              <p className="mt-1 text-sm text-slate-500">상담 일정을 불러오는 중…</p>
            )}
            {selectedDate && dayLoadState === "error" && dayError && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {dayError}
              </p>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {!selectedDate ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                좌측 달력에서 날짜를 선택해 주세요
              </div>
            ) : dayLoadState === "loading" ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                불러오는 중…
              </div>
            ) : dayLoadState === "error" ? (
              <div className="flex items-center justify-center h-full text-red-600 text-sm px-4 text-center">
                {dayError ?? "목록을 불러오지 못했습니다."}
              </div>
            ) : consultationsForDate.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                상담 일정이 없습니다
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {bookedTimeSlotsOnly.flatMap((time) => {
                  const atTime = reservationsByTime[time] ?? [];
                  return atTime.map((consultation) => {
                    const isN = consultation.branch === "N";
                    const isHiEnd = isHiEndBranch(consultation.branch);
                    const school = consultation.student_school?.trim() || "";
                    const grade = consultation.student_grade?.trim() || "";
                    const schoolGradeLine = [school, grade]
                      .filter((s) => s.length > 0)
                      .join(" ");
                    return (
                      <div
                        key={`${time}-${consultation.consultationId}`}
                        className="flex items-center gap-4 min-h-[52px] rounded-lg"
                      >
                        <div className="w-16 shrink-0 text-center text-sm font-medium text-slate-500">
                          {time}
                        </div>
                        <div className="flex-1 min-w-0">
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
                              {isHiEnd ? (
                                <span className="text-sm text-slate-600">
                                  {schoolGradeLine || "—"}
                                </span>
                              ) : (
                                <span className="text-sm text-slate-600">
                                  {consultation.age != null
                                    ? `${consultation.age}세`
                                    : "—"}
                                </span>
                              )}
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded ${
                                  isN
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-teal-100 text-teal-700"
                                }`}
                              >
                                {adminConsultationBranchLabel(consultation.branch)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
