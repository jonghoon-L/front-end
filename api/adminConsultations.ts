import { apiGet } from "@/api/apiClient";

/** GET /v1/admin/consultations 쿼리의 관 구분 (조회 시 Hi-end 로 요청) */
export type AdminConsultationBranch = "N" | "Hi-end";

/** 응답의 branch 값 (백엔드에 따라 Hi-end 또는 HI_END) */
export type AdminConsultationBranchResponse = "N" | "Hi-end" | "HI_END";

/** 상담 1건 (API 응답) */
export interface AdminConsultation {
  consultationId: number;
  branch: AdminConsultationBranchResponse;
  date: string;
  time: string;
  name: string;
  /** N수생관 등 나이 표시용 (하이엔드는 생략될 수 있음) */
  age?: number | null;
  phoneNumber: string;
  registeredAt: string;
  /** 하이엔드 — DB `student_school` (또는 JSON camelCase `studentSchool`) */
  student_school?: string | null;
  /** 하이엔드 — DB `student_grade` (또는 JSON camelCase `studentGrade`) */
  student_grade?: string | null;
  /** 백엔드가 camelCase로 줄 때 (Jackson 등) */
  studentSchool?: string | null;
  studentGrade?: string | null;
  /** API가 짧은 키로 줄 때 (예: DTO 필드명 school / grade) */
  school?: string | null;
  grade?: string | null;
}

export function isHiEndBranch(branch: string): boolean {
  return branch === "Hi-end" || branch === "HI_END";
}

export function adminConsultationBranchLabel(branch: string): string {
  if (branch === "N") return "N수생관";
  if (isHiEndBranch(branch)) return "하이엔드관";
  return branch;
}

/** GET /v1/admin/consultations 성공 응답 */
export interface AdminConsultationsResponse {
  consultations: AdminConsultation[];
}

export type FetchAdminConsultationsParams = {
  branch: AdminConsultationBranch;
  startDate: string;
  endDate: string;
};

function readStringField(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const v = obj[key];
    if (v == null || v === "") continue;
    const s = typeof v === "string" ? v.trim() : String(v).trim();
    if (s.length > 0) return s;
  }
  return null;
}

/**
 * API가 student_school / school, student_grade / grade 등 여러 키로 줄 수 있어
 * 화면용 student_school · student_grade 로 통일.
 */
export function normalizeAdminConsultation(
  raw: AdminConsultation & Record<string, unknown>
): AdminConsultation {
  const r = raw as Record<string, unknown>;
  const school = readStringField(r, [
    "student_school",
    "studentSchool",
    "school",
  ]);
  const grade = readStringField(r, [
    "student_grade",
    "studentGrade",
    "grade",
  ]);

  return {
    ...raw,
    student_school: school,
    student_grade: grade,
  };
}

/**
 * URLSearchParams로 쿼리 문자열 조립 (branch, startDate, endDate)
 */
export function buildAdminConsultationsSearchParams(
  params: FetchAdminConsultationsParams
): URLSearchParams {
  const search = new URLSearchParams();
  search.set("branch", params.branch);
  search.set("startDate", params.startDate);
  search.set("endDate", params.endDate);
  return search;
}

/**
 * 관리자 상담 일정 목록 조회 — 상대 경로 + Bearer 토큰(apiClient)
 */
export async function fetchAdminConsultations(
  params: FetchAdminConsultationsParams
): Promise<AdminConsultationsResponse> {
  const search = buildAdminConsultationsSearchParams(params);
  const path = `/v1/admin/consultations?${search.toString()}`;
  const data = await apiGet<AdminConsultationsResponse>(path, {
    useRelativePath: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
  const list = data.consultations ?? [];
  return {
    consultations: list.map((item) =>
      normalizeAdminConsultation(item as AdminConsultation & Record<string, unknown>)
    ),
  };
}
