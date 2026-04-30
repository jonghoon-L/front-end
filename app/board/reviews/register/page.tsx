"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { useFadeIn } from "@/hooks/useFadeIn";
import { apiPost, apiPostForm, AUTH_TOKEN_KEY } from "@/api/apiClient";
import { sendVerificationCode, verifyAuthCode } from "@/api/auth";
import MessageModal from "@/components/MessageModal";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/** 업로드 API 응답 — 최종 후기 등록 시 `imageUrls`로 전달 */
interface ImageUploadResponse {
  success: boolean;
  imageUrl: string;
}

interface SubmitReviewResponse {
  success: boolean;
  message: string;
  reviewId?: number;
}

function isAllowedImageFile(file: File): boolean {
  const mimeOk = file.type.startsWith("image/");
  const extOk = /\.(jpe?g|png|gif|webp)$/i.test(file.name);
  return mimeOk && extOk;
}

export default function ReviewRegisterPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const imageUrlsRef = useRef<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    imageUrlsRef.current = imageUrls;
  }, [imageUrls]);
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
  const [phoneAuthModalMessage, setPhoneAuthModalMessage] = useState<string | null>(null);
  const reloadAfterModalCloseRef = useRef(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastExiting, setToastExiting] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastExiting(false);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastExiting(true);
      toastTimeoutRef.current = setTimeout(() => {
        setToastMessage(null);
        setToastExiting(false);
        toastTimeoutRef.current = null;
      }, 700);
    }, 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        if (imageUrlsRef.current.length >= MAX_IMAGES) break;

        if (file.size > MAX_FILE_SIZE) {
          showToast("5MB 이하의 이미지만 업로드할 수 있습니다.");
          continue;
        }
        if (!isAllowedImageFile(file)) {
          showToast("JPG, PNG, GIF, WEBP 형식만 업로드할 수 있습니다.");
          continue;
        }

        const formData = new FormData();
        formData.append("image", file);

        try {
          const data = await apiPostForm<ImageUploadResponse>("/v1/images", formData, {
            useRelativePath: true,
            skipUnauthorizedRedirect: true,
            ...(verificationToken ? { token: verificationToken } : {}),
          });
          if (data?.success && data.imageUrl) {
            setImageUrls((prev) => {
              if (prev.length >= MAX_IMAGES) return prev;
              const next = [...prev, data.imageUrl];
              imageUrlsRef.current = next;
              return next;
            });
          } else {
            showToast("이미지 업로드에 실패했습니다.");
          }
        } catch {
          showToast("이미지 업로드에 실패했습니다.");
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => {
      const next = prev.filter((_, i) => i !== index);
      imageUrlsRef.current = next;
      return next;
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
      if (typeof window !== "undefined") localStorage.removeItem(AUTH_TOKEN_KEY);
      if (data.message) {
        reloadAfterModalCloseRef.current = false;
        setPhoneAuthModalMessage(data.message);
      }
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
      const token = data.verificationToken;
      setVerificationToken(token);
      setPhoneVerified(true);
      if (token && typeof window !== "undefined") localStorage.setItem(AUTH_TOKEN_KEY, token);
      if (data.message) {
        reloadAfterModalCloseRef.current = false;
        setPhoneAuthModalMessage(data.message);
      }
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "인증에 실패했습니다.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
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
      const body: { title: string; content: string; name: string; imageUrls?: string[] } = {
        title: title.trim(),
        content: content.trim(),
        name: name.trim(),
      };
      if (imageUrls.length > 0) {
        body.imageUrls = imageUrls;
      }

      const data = await apiPost<SubmitReviewResponse>("/v1/user/reviews", body, {
        token: verificationToken,
      });
      reloadAfterModalCloseRef.current = true;
      setPhoneAuthModalMessage(data?.message ?? "후기가 등록되었습니다. 검토 후 노출됩니다.");
    } catch (err) {
      reloadAfterModalCloseRef.current = false;
      setPhoneAuthModalMessage(err instanceof Error ? err.message : "후기 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    title.trim() &&
    content.trim() &&
    name.trim() &&
    phoneNumber.trim() &&
    phoneVerified &&
    verificationToken;

  const fade = useFadeIn(0.1);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <PageHero
        imageUrl="/images/note.jpg"
        heroStyle={{ backgroundPosition: "center 5%" }}
        lines={["이용 후기 작성"]}
        crumbs={[
          { label: "이용 후기", href: "/board/reviews" },
          { label: "후기 작성", href: "/board/reviews/register" },
        ]}
      />

      <section
        ref={fade.ref}
        className="mx-auto max-w-xl px-4 sm:px-6 py-10 lg:py-14 transition-all duration-700 ease-out"
        style={{
          opacity: fade.isVisible ? 1 : 0,
          transform: fade.isVisible ? "translateY(0)" : "translateY(24px)",
        }}
      >
        <h2 className="mb-16 mt-0 text-center text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          <span className="block">로드맵의 솔직한 후기를 남겨주세요</span>
          <span className="block whitespace-nowrap -translate-x-8">관리자 승인 후 이용 후기 목록에 등록됩니다</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 제목 */}
          <div>
            <h3 className="text-gray-900 font-medium text-base mb-2">제목</h3>
            <hr className="border-gray-200 mb-4" />
            <input
              type="text"
              placeholder="제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-3 px-4 rounded-xl border border-gray-200 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50"
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
              className="w-full py-3 px-4 rounded-xl border border-gray-200 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50 resize-none"
            />
          </div>

          {/* 사진 첨부 — 선택 시 S3 업로드 후 URL을 imageUrls에 저장 */}
          <div>
            <h3 className="text-gray-900 font-medium text-base mb-2">사진 첨부 (선택)</h3>
            <hr className="border-gray-200 mb-4" />
            <div className="flex flex-wrap items-start gap-3">
              {imageUrls.map((url, i) => (
                <div key={`${url}-${i}`} className="relative">
                  <img
                    src={url}
                    alt={`첨부 이미지 ${i + 1}`}
                    className="h-28 w-28 object-cover rounded-lg border border-gray-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-sm flex items-center justify-center hover:bg-red-600 shadow-sm"
                    aria-label={`이미지 ${i + 1} 삭제`}
                  >
                    ×
                  </button>
                </div>
              ))}
              {imageUrls.length < MAX_IMAGES && (
                <label
                  className={`h-28 w-28 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 text-sm ${
                    uploading ? "cursor-not-allowed opacity-60" : "hover:bg-gray-100 cursor-pointer"
                  }`}
                >
                  <span>{uploading ? "…" : "+"}</span>
                  <span>{uploading ? "업로드 중" : "추가"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
                    multiple
                    disabled={uploading}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              최대 {MAX_IMAGES}장, 파일당 5MB 이하 (JPG, PNG, GIF, WEBP). 선택 즉시 업로드됩니다.
            </p>
          </div>

          {/* 이름, 휴대폰, 인증 */}
          <div>
            <h3 className="text-gray-900 font-medium text-base mb-2">본인 확인</h3>
            <hr className="border-gray-100 mb-3" />

            <div className="space-y-3">
              <input
                type="text"
                placeholder="이름을 입력해주세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-gray-200 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50"
              />
              <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 overflow-hidden bg-gray-50/50">
                <input
                  type="tel"
                  placeholder="휴대폰 번호를 입력해주세요"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="min-w-0 flex-1 py-3 px-4 border-0 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 bg-transparent"
                />
                <button
                  type="button"
                  onClick={handleSendVerification}
                  disabled={sendCodeLoading}
                  className="w-28 md:w-32 shrink-0 whitespace-nowrap text-center py-3 px-2 text-sm md:px-5 md:text-base bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 border-l border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendCodeLoading ? "발송 중…" : "인증번호 받기"}
                </button>
              </div>
              {sendCodeError && <p className="text-sm text-red-600">{sendCodeError}</p>}
              {verificationSent && (
                <>
                  <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 overflow-hidden bg-gray-50/50">
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
                      className="min-w-0 flex-1 py-3 px-4 border-0 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 bg-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={phoneVerified || verifyLoading || !verificationCode.trim()}
                      className="w-28 md:w-32 shrink-0 whitespace-nowrap text-center py-3 px-2 text-sm md:px-5 md:text-base bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 border-l border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {phoneVerified ? "인증 완료" : verifyLoading ? "확인 중…" : "인증하기"}
                    </button>
                  </div>
                  {verifyError && <p className="text-sm text-red-600">{verifyError}</p>}
                  {phoneVerified && (
                    <p className="text-xs text-emerald-600 font-medium">휴대폰 번호가 인증되었습니다.</p>
                  )}
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !canSubmit || uploading}
            className="w-full py-4 rounded-xl bg-slate-700 text-white text-base font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "등록 중…" : "후기 등록"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/board/reviews"
            className="block w-full py-4 rounded-xl bg-slate-200 text-slate-700 text-base font-medium hover:bg-slate-300 transition-colors text-center"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </section>

      {(toastMessage || toastExiting) && (
        <div
          className={`fixed bottom-5 right-5 z-[60] max-w-[min(100vw-2rem,20rem)] rounded-lg bg-slate-800 px-5 py-3.5 text-sm font-medium text-white shadow-lg ${
            toastExiting
              ? "translate-x-4 opacity-0 pointer-events-none transition-all duration-700 ease-out"
              : "animate-[toast-slide-in_0.5s_ease-out]"
          }`}
        >
          {toastMessage}
        </div>
      )}
      <MessageModal
        message={phoneAuthModalMessage}
        onClose={() => {
          const reload = reloadAfterModalCloseRef.current;
          reloadAfterModalCloseRef.current = false;
          setPhoneAuthModalMessage(null);
          if (reload) window.location.reload();
        }}
      />
    </main>
  );
}
