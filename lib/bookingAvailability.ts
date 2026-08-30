export type ReservationSeason = "SEMESTER_1" | "SEMESTER_2" | "SUMMER" | "WINTER";

export const RESERVATION_CLOSED_SUMMER_LINES = [
  "2027년 여름캠프는 아직 오픈되지 않았습니다",
  "추후 공지사항을 통해 정확한 모집 일정을 안내해 드리겠습니다 😊",
] as const;

export const RESERVATION_CLOSED_SEMESTER_1_LINES = [
  "2027년 1학기 등록 예약은 아직 오픈되지 않았습니다",
  "추후 공지사항을 통해 정확한 모집 일정을 안내해 드리겠습니다 😊",
] as const;

export function isReservationClosed(season: ReservationSeason | null): boolean {
  return season === "SUMMER" || season === "SEMESTER_1";
}

export function getReservationClosedLines(season: ReservationSeason | null): readonly string[] | null {
  if (!season) return null;
  switch (season) {
    case "SUMMER":
      return RESERVATION_CLOSED_SUMMER_LINES;
    case "SEMESTER_1":
      return RESERVATION_CLOSED_SEMESTER_1_LINES;
    default:
      return null;
  }
}
