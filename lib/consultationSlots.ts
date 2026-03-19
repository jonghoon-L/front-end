/**
 * 관 종류와 날짜(요일)에 따라 선택 가능한 상담 시간대를 반환합니다.
 * - N수관: 평일(월~금)·토요일 → 10:00, 17:00
 * - 하이엔드관: 평일(월~금) → 17:00, 20:00 / 토요일 → 10:00, 16:00
 * - 일요일: 모든 관 일괄 비활성(달력에서 선택 불가이므로 여기서는 빈 배열)
 */
export type ConsultationBranch = "N" | "Hi-end";

const N_WEEKDAY_SLOTS: string[] = ["10:00", "17:00"];
const N_SATURDAY_SLOTS: string[] = ["10:00", "17:00"];
const HIEND_WEEKDAY_SLOTS: string[] = ["17:00", "20:00"];
const HIEND_SATURDAY_SLOTS: string[] = ["10:00", "16:00"];

export function getAvailableTimeSlots(
  branch: ConsultationBranch,
  date: Date
): string[] {
  const day = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  if (day === 0) return [];

  if (branch === "N") {
    return day === 6 ? N_SATURDAY_SLOTS : N_WEEKDAY_SLOTS;
  }
  return day === 6 ? HIEND_SATURDAY_SLOTS : HIEND_WEEKDAY_SLOTS;
}

/** 선택된 날짜에 대해 N수관·하이엔드관 합집합 시간대(정렬) — 관리자 타임라인 표시용 */
export function getAllTimeSlotsForDate(date: Date): string[] {
  const day = date.getDay();
  if (day === 0) return [];

  const n = getAvailableTimeSlots("N", date);
  const hi = getAvailableTimeSlots("Hi-end", date);
  const set = new Set([...n, ...hi]);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** 오전 구간에 등장할 수 있는 시간 (UI 레이아웃용) */
export const MORNING_SLOTS = ["10:00", "11:00"];

/** 오후 구간에 등장할 수 있는 시간 (UI 레이아웃용, 20:00 포함) */
export const AFTERNOON_SLOTS = ["12:00", "14:00", "15:00", "16:00", "17:00", "20:00"];
