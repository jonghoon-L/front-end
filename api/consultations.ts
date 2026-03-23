/**
 * 상담 관련 API
 * - GET /v1/common/consultations: 월별 상담 불가능 스케줄 조회
 */

import { apiGet } from "@/api/apiClient";

export type ConsultationBranch = "N" | "Hi-end";

export interface ScheduleItem {
  date: string;
  bookedTimes: string[];
  unavailableTimes?: string[];
}

export interface ConsultationsResponse {
  branch: ConsultationBranch;
  yearMonth: string;
  operatingHours?: { start: string; end: string; intervalMinutes: number };
  unavailableSchedules: ScheduleItem[];
}

/**
 * 월별 상담 불가능 스케줄 조회
 * @param branch 관 종류 ("N" | "Hi-end")
 * @param yearMonth 연월 (예: "2026-03")
 */
export async function fetchUnavailableSchedules(
  branch: ConsultationBranch,
  yearMonth: string
): Promise<ConsultationsResponse> {
  const params = new URLSearchParams({ branch, yearMonth });
  return apiGet<ConsultationsResponse>(`/v1/common/consultations?${params}`);
}
