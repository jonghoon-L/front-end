"use client";

import { useState } from "react";
import Link from "next/link";
import PageHero from "@/components/PageHero";

type Branch = "N" | "Hi-end";

const BRANCH_OPTIONS: { value: Branch; label: string }[] = [
  { value: "N", label: "N수생관" },
  { value: "Hi-end", label: "하이엔드관" },
];

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

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ReviewRegisterPage() {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [sendCodeError, setSendCodeError] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const valid = files.filter((f) => f.size <= MAX_FILE_SIZE && f.type.startsWith("image/"));
    const total = [...imageFiles, ...valid].slice(0, MAX_IMAGES);
    setImageFiles(total);

    const newPreviews = valid.map((f) => URL.createObjectURL(f));
    const allPreviews = [...imagePreviews, ...newPreviews].slice(0, MAX_IMAGES);
    setImagePreviews((prev) => {
      const toKeep = new Set(allPreviews);
      prev.forEach((url) => {
        if (!toKeep.has(url)) URL.revokeObjectURL(url);
      });
      return allPreviews;
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !branch ||
      !title.trim() ||
      !content.trim() ||
      !name.trim() ||
      !phoneNumber.trim() ||
      !phoneVerified ||
      !verificationToken
    )
      return;

    setIsSubmitting(true);
    try {
      // TODO: 실제 API 연동 시 POST /v1/user/reviews 호출
      const base = getApiBase();
      if (base) {
        const formData = new FormData();
        formData.append("branch", branch);
        formData.append("title", title.trim());
        formData.append("content", content.trim());
        formData.append("name", name.trim());
        formData.append("phoneNumber", phoneNumber.replace(/\D/g, ""));
        imageFiles.forEach((f, i) => formData.append(`images`, f));

        const res = await fetch(`${base}/v1/user/reviews`, {
          method: "POST",
          headers: { Authorization: `Bearer ${verificationToken}` },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          alert(data?.message ?? "후기가 등록되었습니다. 검토 후 노출됩니다.");
          window.location.href = "/board/reviews";
          return;
        }
        const err = await res.json();
        throw new Error(err?.message ?? "등록에 실패했습니다.");
      }

      // API 미설정 시 임시 처리
      alert("후기가 등록 요청되었습니다. (API 연동 후 실제 등록됩니다.)");
      window.location.href = "/board/reviews";
    } catch (err) {
      alert(err instanceof Error ? err.message : "후기 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    branch &&
    title.trim() &&
    content.trim() &&
    name.trim() &&
    phoneNumber.trim() &&
    phoneVerified &&
    verificationToken;

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50">
      <PageHero
        imageUrl=""
        lines={["이용 후기 작성"]}
        crumbs={[
          { label: "게시판" },
          { label: "이용 후기", href: "/board/reviews" },
          { label: "후기 작성", href: "/board/reviews/register" },
        ]}
        heightClass="h-[200px] lg:h-[240px]"
        heroClassName="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800"
        overlayClassName="opacity-0"
        titleClassName="text-white text-xl lg:text-3xl font-bold tracking-tight"
        breadcrumbWrapClassName="border-slate-200 bg-white"
      />

      <section className="mx-auto max-w-md px-4 sm:px-6 py-10 lg:py-14">
        <div className="mb-10 text-center">
          <p className="text-gray-500 text-sm mb-1">솔직한 후기를 남겨주세요</p>
          <h2 className="text-xl font-bold text-gray-900">이용 후기 작성</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 관 선택 */}
          <div>
            <h3 className="text-gray-900 font-medium mb-2">관 종류를 선택해주세요</h3>
            <hr className="border-gray-200 mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {BRANCH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBranch(opt.value)}
                  className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                    branch === opt.value
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <h3 className="text-gray-900 font-medium mb-2">제목</h3>
            <hr className="border-gray-200 mb-4" />
            <input
              type="text"
              placeholder="제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50"
            />
          </div>

          {/* 내용 */}
          <div>
            <h3 className="text-gray-900 font-medium mb-2">내용</h3>
            <hr className="border-gray-200 mb-4" />
            <textarea
              placeholder="이용 후기를 자유롭게 작성해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50 resize-none"
            />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <h3 className="text-gray-900 font-medium mb-2">사진 첨부 (선택)</h3>
            <hr className="border-gray-200 mb-4" />
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                {imagePreviews.map((url, i) => (
                  <div key={url} className="relative">
                    <img
                      src={url}
                      alt={`미리보기 ${i + 1}`}
                      className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-sm flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {imagePreviews.length < MAX_IMAGES && (
                  <label className="h-24 w-24 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 cursor-pointer text-xs">
                    <span>+</span>
                    <span>추가</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500">최대 {MAX_IMAGES}장, 5MB 이하 (jpg, png, gif)</p>
            </div>
          </div>

          {/* 이름, 휴대폰, 인증 */}
          <div>
            <h3 className="text-gray-700 font-medium text-base mb-1.5">본인 확인</h3>
            <hr className="border-gray-100 mb-3" />

            <div className="space-y-3">
              <input
                type="text"
                placeholder="이름을 입력해주세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50"
              />
              <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50/50">
                <input
                  type="tel"
                  placeholder="휴대폰 번호를 입력해주세요"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 py-2.5 px-3.5 border-0 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 bg-transparent"
                />
                <button
                  type="button"
                  onClick={handleSendVerification}
                  disabled={sendCodeLoading}
                  className="shrink-0 py-2.5 px-3.5 bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 whitespace-nowrap border-l border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendCodeLoading ? "발송 중…" : "인증번호 받기"}
                </button>
              </div>
              {sendCodeError && <p className="text-sm text-red-600">{sendCodeError}</p>}
              <input
                type="text"
                placeholder="인증번호를 입력해주세요"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value);
                  setPhoneVerified(false);
                  setVerificationToken(null);
                }}
                disabled={phoneVerified}
                className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50 disabled:bg-gray-50 disabled:text-gray-500"
              />
              {verifyError && <p className="text-sm text-red-600">{verifyError}</p>}
              {verificationSent && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={phoneVerified || verifyLoading || !verificationCode.trim()}
                    className="py-2.5 px-3.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {phoneVerified ? "인증 완료" : verifyLoading ? "확인 중…" : "인증하기"}
                  </button>
                  {phoneVerified && (
                    <p className="text-xs text-emerald-600 font-medium">휴대폰 번호가 인증되었습니다.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="w-full py-3 rounded-xl bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "등록 중…" : "후기 등록"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/board/reviews" className="text-sm text-gray-500 hover:text-gray-700">
            목록으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
