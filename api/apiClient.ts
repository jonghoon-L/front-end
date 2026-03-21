/**
 * 공통 fetch 래퍼 - 백엔드 API 호출 시 일관된 설정 적용
 * - Base URL: .env의 NEXT_PUBLIC_API_BASE_URL 사용
 * - Content-Type: application/json 기본 (FormData 사용 시 제외)
 * - credentials: 'include' (CORS + 쿠키/인증 정보)
 * - JWT: token 옵션 또는 localStorage에서 자동 주입 (로그인 연동 대비)
 */

const getApiBaseUrl = (): string => {
  if (typeof process === "undefined") return "";
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
};

/** localStorage에 저장할 토큰 키 (로그인 연동 시 사용) */
export const AUTH_TOKEN_KEY = "authToken";

/** 관리자 로그아웃 시 삭제할 토큰 키 목록 */
export const TOKEN_KEYS_TO_CLEAR = ["authToken", "token"] as const;

/** API 요청 시 사용할 토큰 조회 - token 옵션 우선, 없으면 localStorage에서 authToken → token 순으로 조회 */
function resolveToken(token?: string | null): string | null {
  if (token !== undefined && token !== null) return token;
  if (typeof window !== "undefined") {
    return localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem("token");
  }
  return null;
}

/** 401 발생 시 토큰 삭제 후 /admin/login으로 리다이렉트 */
function handleUnauthorized(): void {
  if (typeof window === "undefined") return;
  TOKEN_KEYS_TO_CLEAR.forEach((key) => localStorage.removeItem(key));
  window.location.href = "/admin/login";
}

export interface ApiRequestOptions extends Omit<RequestInit, "headers" | "body"> {
  /** JWT 토큰 - 미제공 시 localStorage에서 AUTH_TOKEN_KEY로 조회 (로그인 연동 시) */
  token?: string | null;
  /** 커스텀 헤더 - 기본 헤더와 병합됨 */
  headers?: Record<string, string>;
  /** JSON body (객체) 또는 FormData - FormData인 경우 Content-Type은 자동 설정됨 */
  body?: Record<string, unknown> | FormData | null;
}

/**
 * 공통 API 요청 함수
 * @param path - API 경로 (예: "v1/common/auth/send" 또는 "/v1/common/auth/send")
 * @param options - method, body, token, headers 등
 * @returns 파싱된 응답 데이터 (JSON)
 */
export async function apiClient<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("API 주소가 설정되지 않았습니다. NEXT_PUBLIC_API_BASE_URL를 .env에 설정해 주세요.");
  }

  const { token, headers: customHeaders = {}, body: bodyInput, method = "GET", ...rest } = options;

  const tokenToUse = resolveToken(token);
  const isFormData = bodyInput instanceof FormData;

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  // JSON body인 경우에만 Content-Type 설정 (FormData는 브라우저가 boundary와 함께 자동 설정)
  if (bodyInput && !isFormData && typeof bodyInput === "object") {
    headers["Content-Type"] = "application/json";
  }

  if (tokenToUse) {
    headers["Authorization"] = `Bearer ${tokenToUse}`;
  }

  const body = isFormData ? bodyInput : bodyInput && typeof bodyInput === "object" ? JSON.stringify(bodyInput) : undefined;

  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = `${baseUrl}/${normalizedPath}`;

  const res = await fetch(url, {
    ...rest,
    method,
    headers,
    body,
    credentials: "include",
  });

  const contentType = res.headers.get("content-type");
  const isJsonResponse = contentType?.includes("application/json");

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const errData = isJsonResponse ? await res.json().catch(() => ({})) : {};
    const message = (errData as { message?: string })?.message ?? `요청 실패: ${res.status}`;
    throw new Error(message);
  }

  if (isJsonResponse) {
    return res.json() as Promise<T>;
  }

  return null as unknown as T;
}

/** 편의 메서드: GET */
export async function apiGet<T = unknown>(path: string, options?: Omit<ApiRequestOptions, "body" | "method">): Promise<T> {
  return apiClient<T>(path, { ...options, method: "GET" });
}

/** 편의 메서드: POST (JSON) */
export async function apiPost<T = unknown>(path: string, body?: Record<string, unknown> | null, options?: ApiRequestOptions): Promise<T> {
  return apiClient<T>(path, { ...options, method: "POST", body: body ?? undefined });
}

/** 편의 메서드: POST (FormData) */
export async function apiPostForm<T = unknown>(path: string, formData: FormData, options?: ApiRequestOptions): Promise<T> {
  return apiClient<T>(path, { ...options, method: "POST", body: formData });
}

/** 편의 메서드: DELETE */
export async function apiDelete<T = unknown>(path: string, options?: ApiRequestOptions): Promise<T> {
  return apiClient<T>(path, { ...options, method: "DELETE" });
}
