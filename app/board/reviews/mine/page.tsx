"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { blurName } from "@/lib/blurName";
import PageHero from "@/components/PageHero";
import { Trash2 } from "lucide-react";
import { useFadeIn } from "@/hooks/useFadeIn";

type ReviewStatus = "PENDING" | "APPROVED";

interface MyReview {
  reviewId: number;
  title: string;
  authorName: string;
  status: ReviewStatus;
  createdAt: string;
}

interface MyReviewsResponse {
  myReviews: MyReview[];
}

function getApiBase(): string {
  if (typeof process === "undefined") return "";
  return process.env.NEXT_PUBLIC_CONSULT_API_BASE ?? "";
}

interface SendAuthResponse {
  success: boolean;
  message: string;
}

async function sendVerificationCode(phoneNumber: string): Promise<SendAuthResponse> {
  const base = getApiBase();
  if (!base) throw new Error("API 주소가 설정되지 않았습니다.");
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  const res = await fetch(`${base}/v1/common/auth/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber: digitsOnly }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? `요청 실패: ${res.status}`);
  return data;
}

interface VerifyAuthResponse {
  success: boolean;
  message: string;
  verificationToken: string;
}

async function verifyAuthCode(phoneNumber: string, authCode: string): Promise<VerifyAuthResponse> {
  const base = getApiBase();
  if (!base) throw new Error("API 주소가 설정되지 않았습니다.");
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  const res = await fetch(`${base}/v1/common/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber: digitsOnly, authCode: authCode.trim() }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? `요청 실패: ${res.status}`);
  return data;
}

async function fetchMyReviews(verificationToken: string): Promise<MyReviewsResponse> {
  const base = getApiBase();
  if (!base) throw new Error("API 주소가 설정되지 않았습니다.");
  const res = await fetch(`${base}/v1/user/reviews/mine`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${verificationToken}`,
    },
  });
  if (!res.ok) throw new Error(`목록 조회 실패: ${res.status}`);
  return res.json();
}

interface DeleteReviewResponse {
  success: boolean;
  message: string;
}

async function deleteReview(reviewId: number, verificationToken: string): Promise<DeleteReviewResponse> {
  const base = getApiBase();
  if (!base) throw new Error("API 주소가 설정되지 않았습니다.");
  const res = await fetch(`${base}/v1/user/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${verificationToken}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? `삭제 실패: ${res.status}`);
  return data;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const isPending = status === "PENDING";
  const label = isPending ? "승인 대기" : "노출 중";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isPending
          ? "bg-amber-500/12 text-amber-700 ring-1 ring-amber-500/20"
          : "bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20"
      }`}
    >
      {label}
    </span>
  );
}

// 개발용 미리보기 샘플 데이터 (인증 없이 화면 확인용)
const DEV_MOCK_REVIEWS: MyReview[] = [
  { reviewId: 1, title: "독학재수학원 이용 후기 (샘플)", authorName: "홍길동", status: "PENDING", createdAt: "2026-03-10T00:00:00Z" },
  { reviewId: 2, title: "수업 품질이 좋았어요 (샘플)", authorName: "김철수", status: "APPROVED", createdAt: "2026-03-08T00:00:00Z" },
];

export default function MyReviewsPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [reviews, setReviews] = useState<MyReview[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [sendCodeError, setSendCodeError] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSendVerification = async () => {
    const trimmed = phoneNumber.trim();
    if (!trimmed) return;
    setSendCodeError(null);
    setSendCodeLoading(true);
    try {
      const data = await sendVerificationCode(trimmed);
      setVerificationSent(true);
      setPhoneVerified(false);
      setVerificationCode("");
      setVerificationToken(null);
      setReviews(null);
      if (data.message) alert(data.message);
    } catch (err) {
      setSendCodeError(err instanceof Error ? err.message : "인증번호 발송에 실패했습니다.");
    } finally {
      setSendCodeLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.trim();
    if (!code) return;
    setVerifyError(null);
    setVerifyLoading(true);
    try {
      const data = await verifyAuthCode(phoneNumber.trim(), code);
      setVerificationToken(data.verificationToken);
      setPhoneVerified(true);
      if (data.message) alert(data.message);
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "인증에 실패했습니다.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleLoadReviews = async () => {
    if (!verificationToken) return;
    setError(null);
    setLoading(true);
    try {
      const data = await fetchMyReviews(verificationToken);
      setReviews(data.myReviews ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!verificationToken) return;
    if (!window.confirm("정말 이 후기를 삭제하시겠습니까?")) return;
    if (verificationToken === "dev-token") {
      setReviews((prev) => (prev ?? []).filter((r) => r.reviewId !== reviewId));
      setDeletingId(null);
      return;
    }
    setDeletingId(reviewId);
    try {
      await deleteReview(reviewId, verificationToken);
      setReviews((prev) => (prev ?? []).filter((r) => r.reviewId !== reviewId));
      alert("후기가 삭제되었습니다.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const fade = useFadeIn(0.1);

  const handleDevPreview = () => {
    setVerificationToken("dev-token");
    setPhoneVerified(true);
    setReviews([...DEV_MOCK_REVIEWS]);
    setError(null);
  };

  useEffect(() => {
    if (phoneVerified && verificationToken && reviews === null && !loading && !error) {
      handleLoadReviews();
    }
  }, [phoneVerified, verificationToken]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <PageHero
        imageUrl="/images/note.jpg"
        heroStyle={{ backgroundPosition: "center 5%" }}
        lines={["내가 작성한 후기 조회"]}
        crumbs={[
          { label: "이용 후기", href: "/board/reviews" },
          { label: "내가 작성한 후기 조회", href: "/board/reviews/mine" },
        ]}
      />

      <section
        ref={fade.ref}
        className="mx-auto max-w-5xl px-4 sm:px-6 py-10 lg:py-14 transition-all duration-700 ease-out"
        style={{
          opacity: fade.isVisible ? 1 : 0,
          transform: fade.isVisible ? "translateY(0)" : "translateY(24px)",
        }}
      >
        {!phoneVerified ? (
          <div className="mx-auto max-w-md">
            <h2 className="mb-16 mt-0 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
              <span className="block whitespace-nowrap">휴대폰 인증 후</span>
              <span className="block whitespace-nowrap -translate-x-7">내가 작성한 후기를 확인할 수 있어요</span>
            </h2>
            <div className="mt-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
              <div className="space-y-3">
                <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-gray-50/50">
                  <input
                    type="tel"
                    placeholder="휴대폰 번호를 입력해주세요"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 py-2.5 px-3.5 border-0 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={sendCodeLoading}
                    className="shrink-0 py-2.5 px-3.5 bg-gray-100 text-slate-600 text-sm font-medium hover:bg-gray-200 whitespace-nowrap border-l border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendCodeLoading ? "발송 중…" : "인증번호 받기"}
                  </button>
                </div>
                {sendCodeError && <p className="text-sm text-red-600">{sendCodeError}</p>}
                {verificationSent && (
                  <>
                    <input
                      type="text"
                      placeholder="인증번호를 입력해주세요"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 bg-gray-50/50"
                    />
                    {verifyError && <p className="text-sm text-red-600">{verifyError}</p>}
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={verifyLoading || !verificationCode.trim()}
                      className="w-full py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verifyLoading ? "확인 중…" : "인증하기"}
                    </button>
                  </>
                )}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleDevPreview}
                    className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium hover:bg-slate-100"
                  >
                    개발용: 인증 건너뛰고 미리보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
            <p className="mt-4 text-sm">목록을 불러오는 중…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/60">
            <p className="text-red-600">{error}</p>
            <Link href="/board/reviews" className="mt-4 inline-block text-sm text-emerald-600 hover:underline">
              이용 후기 목록으로
            </Link>
          </div>
        ) : reviews && reviews.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200/60">
            <p className="text-slate-600">아직 작성한 후기가 없어요.</p>
            <Link
              href="/board/reviews/register"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-700 hover:shadow"
            >
              후기 작성하기
            </Link>
          </div>
        ) : reviews && reviews.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-slate-500">총 {reviews.length}건의 후기</p>
            </div>
            <div className="lg:hidden space-y-3">
              {reviews.map((item, index) => (
                <div
                  key={item.reviewId}
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">#{index + 1}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <Link
                    href={`/board/reviews/${item.reviewId}?from=mine`}
                    className="font-semibold text-slate-800"
                  >
                    {item.title}
                  </Link>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-2">
                      <span>{item.authorName}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.reviewId)}
                      disabled={deletingId === item.reviewId}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-16 hidden lg:block overflow-hidden bg-white shadow-sm ring-1 ring-slate-200/60">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      번호
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      제목
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      작성자
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      상태
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                      작성일
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 w-16">
                      삭제
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.map((item, index) => (
                    <tr key={item.reviewId} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-6 py-4 text-center text-sm font-medium text-slate-400">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/board/reviews/${item.reviewId}?from=mine`}
                          className="font-medium text-slate-800"
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-500">
                        {blurName(item.authorName)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <StatusBadge status={item.status} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-500">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleDelete(item.reviewId)}
                            disabled={deletingId === item.reviewId}
                            className="inline-flex items-center justify-center rounded-md p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        <div className="mt-24 mx-auto max-w-md px-6">
          <Link
            href="/board/reviews"
            className="block w-full py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors text-center"
          >
            이용 후기 목록으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
