export type ReservationSeason = "SEMESTER_1" | "SEMESTER_2" | "SUMMER" | "WINTER";
export type ConsultationBranch = "N" | "Hi-end";

export const CONSULTING_LOAD_NOTICE_LINES = [
  "현재 2026년 여름캠프는 전 좌석이 마감되었습니다",
  "해당 프로그램에 관련한 상담 예약은 받지 않고 있으니 참고해주시기 바랍니다 😊",
] as const;

export const CONSULTATION_CLOSED_HI_END_LINES = [
  "현재 하이엔드관 및 여름캠프는 전 좌석이 마감되어 당분간 상담 예약을 받지 않고 있습니다",
  "여름캠프 종료 후 2학기 모집 기간에 다시 찾아주시기 바랍니다 😊",
] as const;

export const RESERVATION_CLOSED_SUMMER_LINES = [
  "2026년 여름캠프는 전 좌석이 마감되어 더이상 등록 예약을 받지 않고 있습니다",
  "다음 시즌에 더 좋은 프로그램으로 찾아뵙겠습니다 😊",
] as const;

export const RESERVATION_CLOSED_SEMESTER_1_LINES = [
  "2027년 1학기 등록 예약은 아직 오픈되지 않았습니다",
  "추후 공지사항을 통해 정확한 모집 일정을 안내해 드리겠습니다 😊",
] as const;

export const RESERVATION_CLOSED_WINTER_LINES = [
  "2026년 겨울캠프 등록 예약은 9월 1일에 오픈될 예정입니다",
  "해당 기간에 찾아주시기 바랍니다 😊",
] as const;

export function isConsultationClosed(branch: ConsultationBranch | null): boolean {
  return branch === "Hi-end";
}

export function isReservationClosed(season: ReservationSeason | null): boolean {
  return season === "SUMMER" || season === "SEMESTER_1" || season === "WINTER";
}

export function getReservationClosedLines(season: ReservationSeason | null): readonly string[] | null {
  if (!season) return null;
  switch (season) {
    case "SUMMER":
      return RESERVATION_CLOSED_SUMMER_LINES;
    case "SEMESTER_1":
      return RESERVATION_CLOSED_SEMESTER_1_LINES;
    case "WINTER":
      return RESERVATION_CLOSED_WINTER_LINES;
    default:
      return null;
  }
}
