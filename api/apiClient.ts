/**
 * 공통 fetch 래퍼 - 백엔드 API 호출 시 일관된 설정 적용
 * - Content-Type: application/json 기본 (FormData 사용 시 제외)
 * - credentials: 'include' (CORS + 쿠키/인증 정보)
 * - JWT: token 옵션 또는 localStorage에서 자동 주입
 *
 * URL 결정:
 * - development: 항상 http://3.225.101.84:8080 + 경로 (배포 백엔드 직접 호출, Next 404 방지)
 * - production + useRelativePath: 상대 경로 /v1/... (Vercel 프록시)
 * - 그 외 production: NEXT_PUBLIC_API_BASE_URL 또는 window.location.origin + 경로
 */

/** 경로 정규화: v1/admin/login 또는 /v1/admin/login → 항상 /v1/admin/login 형태 */
function normalizePath(path: string): string {
  const trimmed = path.trim().replace(/\/+/g, "/");
  const withoutLeading = trimmed.replace(/^\/+/, "");
  return "/" + withoutLeading;
}

/** Base URL 결정: .env의 NEXT_PUBLIC_API_BASE_URL 사용 */
function getApiBaseUrl(): string {
  if (typeof process === "undefined") return "";
  const envBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim().replace(/\/$/, "");
  if (envBase) return envBase;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/** Base URL + 경로를 슬래시 중복 없이 안전하게 조립 */
function buildApiUrl(baseUrl: string, path: string): string {
  const normalizedPath = normalizePath(path);
  const base = baseUrl.replace(/\/+$/, "");
  return base + normalizedPath;
}

const DEV_API_ORIGIN = "http://3.225.101.84:8080";

function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

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
  /** 401 시 로그인 페이지 리다이렉트 건너뛰기 (로그인 API 등에서 사용 - 에러를 throw하여 호출부에서 처리) */
  skipUnauthorizedRedirect?: boolean;
  /**
   * production에서만 적용: 브라우저에서 상대 경로로 요청 (예: /v1/... → Vercel 프록시).
   * development에서는 무시되며 http://3.225.101.84:8080 으로 고정됩니다.
   */
  useRelativePath?: boolean;
}

/**
 * 공통 API 요청 함수
 * @param path - API 경로 (예: "v1/common/auth/send" 또는 "/v1/common/auth/send")
 * @param options - method, body, token, headers 등
 * @returns 파싱된 응답 데이터 (JSON)
 */
export async function apiClient<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    token,
    headers: customHeaders = {},
    body: bodyInput,
    method = "GET",
    skipUnauthorizedRedirect,
    useRelativePath,
    ...rest
  } = options;

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

  const normalizedPath = normalizePath(path);
  let url: string;

  if (isDevelopment()) {
    url = `${DEV_API_ORIGIN.replace(/\/+$/, "")}${normalizedPath}`;
  } else if (Boolean(useRelativePath) && typeof window !== "undefined") {
    url = normalizedPath;
  } else {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      throw new Error(
        "API 주소를 알 수 없습니다. 브라우저 환경에서는 현재 도메인을 사용하고, 서버 환경에서는 .env에 NEXT_PUBLIC_API_BASE_URL을 설정해 주세요."
      );
    }
    url = buildApiUrl(baseUrl, path);
  }

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
    if (res.status === 401 && !skipUnauthorizedRedirect) {
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
