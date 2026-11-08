export type ReservationSeason = "SEMESTER_1" | "SEMESTER_2" | "SUMMER" | "WINTER";
export type ConsultationBranch = "N" | "Hi-end";

export type ReservationSlotKey =
  | "SEMESTER_1_N"
  | "SEMESTER_1_HI"
  | "SEMESTER_2_N"
  | "SEMESTER_2_HI"
  | "SUMMER"
  | "WINTER";

export type BookingSettings = {
  consultation: Record<ConsultationBranch, boolean>;
  reservation: Record<ReservationSlotKey, boolean>;
};

/** 기본값: 기존 하드코딩(1학기·여름캠프 마감)과 동일하게 맞춤 */
export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  consultation: {
    N: true,
    "Hi-end": true,
  },
  reservation: {
    SEMESTER_1_N: false,
    SEMESTER_1_HI: false,
    SEMESTER_2_N: true,
    SEMESTER_2_HI: true,
    SUMMER: false,
    WINTER: true,
  },
};

export const CONSULTATION_CLOSED_LINES = [
  "현재 운영상의 이유로 상담 신청은 불가능합니다",
  "문의사항이 있을 시 해당 관으로 전화 주시기 바랍니다😊",
] as const;

export const RESERVATION_CLOSED_LINES = [
  "현재 운영상의 이유로 등록 예약은 불가능합니다",
  "추후 공지사항을 통해 정확한 모집 일정을 안내해 드리겠습니다 😊",
] as const;

export const CONSULTATION_CONTROL_OPTIONS: {
  key: ConsultationBranch;
  label: string;
}[] = [
  { key: "N", label: "N수관" },
  { key: "Hi-end", label: "하이엔드관" },
];

export const RESERVATION_CONTROL_OPTIONS: {
  key: ReservationSlotKey;
  label: string;
}[] = [
  { key: "SEMESTER_1_N", label: "1학기 N수관" },
  { key: "SEMESTER_1_HI", label: "1학기 하이엔드관" },
  { key: "SEMESTER_2_N", label: "2학기 N수관" },
  { key: "SEMESTER_2_HI", label: "2학기 하이엔드관" },
  { key: "SUMMER", label: "여름캠프" },
  { key: "WINTER", label: "겨울캠프" },
];

export function getReservationSlotKey(
  season: ReservationSeason,
  branch: ConsultationBranch | null
): ReservationSlotKey | null {
  if (season === "SUMMER") return "SUMMER";
  if (season === "WINTER") return "WINTER";
  if (!branch) return null;
  if (season === "SEMESTER_1") return branch === "N" ? "SEMESTER_1_N" : "SEMESTER_1_HI";
  if (season === "SEMESTER_2") return branch === "N" ? "SEMESTER_2_N" : "SEMESTER_2_HI";
  return null;
}

export function isConsultationOpen(
  settings: BookingSettings,
  branch: ConsultationBranch | null
): boolean {
  if (!branch) return true;
  return settings.consultation[branch];
}

export function isReservationOpen(
  settings: BookingSettings,
  season: ReservationSeason | null,
  branch: ConsultationBranch | null
): boolean {
  if (!season) return true;
  const key = getReservationSlotKey(season, branch);
  if (!key) return true;
  return settings.reservation[key];
}

export function mergeBookingSettings(partial?: Partial<BookingSettings> | null): BookingSettings {
  return {
    consultation: {
      ...DEFAULT_BOOKING_SETTINGS.consultation,
      ...(partial?.consultation ?? {}),
    },
    reservation: {
      ...DEFAULT_BOOKING_SETTINGS.reservation,
      ...(partial?.reservation ?? {}),
    },
  };
}
