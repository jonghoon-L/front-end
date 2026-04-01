"use client";

import { useState, useRef } from "react";
import { apiPost, AUTH_TOKEN_KEY } from "@/api/apiClient";
import { sendVerificationCode, verifyAuthCode } from "@/api/auth";
import MessageModal from "@/components/MessageModal";

type Season = "SEMESTER_1" | "SEMESTER_2" | "SUMMER" | "WINTER";
type Branch = "N" | "Hi-end";

const SEASON_OPTIONS: { value: Season; label: string }[] = [
  { value: "SEMESTER_1", label: "1학기" },
  { value: "SEMESTER_2", label: "2학기" },
  { value: "SUMMER", label: "여름캠프" },
  { value: "WINTER", label: "겨울캠프" },
];

const BRANCH_OPTIONS: { value: Branch; label: string }[] = [
  { value: "N", label: "N수생관" },
  { value: "Hi-end", label: "하이엔드관" },
];

interface SubmitWaitlistResponse {
  success: boolean;
  message: string;
  waitlistId?: number;
  registeredAt?: string;
}

/** POST /v1/user/waitlists - token은 localStorage의 verificationToken을 apiClient가 Authorization 헤더에 자동 주입 */
async function submitWaitlist(
  payload: {
    branch: string | null;
    season: Season;
    name: string;
    phoneNumber: string;
    isExisting: boolean;
    age?: number;
    school?: string;
    grade?: string;
  }
): Promise<SubmitWaitlistResponse> {
  const body: Record<string, unknown> = {
    season: payload.season,
    name: payload.name.trim(),
    phoneNumber: payload.phoneNumber.replace(/\D/g, ""),
    isExisting: payload.isExisting,
  };
  if (payload.branch != null) {
    body.branch = payload.branch;
  }
  if (payload.age != null) {
    body.age = payload.age;
  }
  if (payload.school?.trim()) {
    body.school = payload.school.trim();
    if (payload.grade) body.grade = payload.grade;
  }
  return apiPost<SubmitWaitlistResponse>("/v1/user/waitlists", body, { skipUnauthorizedRedirect: true });
}

const needsBranch = (season: Season) => season === "SEMESTER_1" || season === "SEMESTER_2";

export default function ReservationPage() {
  const [season, setSeason] = useState<Season | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [name, setName] = useState("");
  /** 미선택: null — 제출 시 true(기존 재원생) / false(신규생) */
  const [isExisting, setIsExisting] = useState<boolean | null>(null);
  const [age, setAge] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
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
  const [isExistingError, setIsExistingError] = useState<string | null>(null);

  const showBranchSelection = season !== null && needsBranch(season);

  const handleSeasonChange = (s: Season) => {
    setSeason(s);
    setBranch(null);
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
    setIsExistingError(null);
    if (!season || !name.trim() || !phoneNumber.trim() || !phoneVerified || !verificationToken) return;
    if (isExisting === null) {
      setIsExistingError("기존 재원 여부를 선택해주세요.");
      return;
    }
    if (needsBranch(season) && !branch) return;

    const isCamp = !needsBranch(season);
    const isNBranch = needsBranch(season) && branch === "N";

    if (isNBranch) {
      if (!age.trim()) return;
    } else if (isCamp) {
      if (!school.trim() || !grade || !age.trim()) return;
    } else {
      if (!school.trim() || !grade) return;
    }

    const payload: {
      branch: string | null;
      season: Season;
      name: string;
      phoneNumber: string;
      isExisting: boolean;
      age?: number;
      school?: string;
      grade?: string;
    } = {
      branch: needsBranch(season) ? branch! : null,
      season,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      isExisting,
    };
    if (isNBranch) {
      payload.age = parseInt(age, 10);
    } else if (isCamp) {
      payload.school = school.trim();
      payload.grade = grade;
      payload.age = parseInt(age, 10);
    } else {
      payload.school = school.trim();
      payload.grade = grade;
    }

    setIsSubmitting(true);
    try {
      const data = await submitWaitlist(payload);
      reloadAfterModalCloseRef.current = true;
      setPhoneAuthModalMessage(data.message || "등록 신청이 접수되었습니다.");
    } catch (err) {
      reloadAfterModalCloseRef.current = false;
      setPhoneAuthModalMessage(err instanceof Error ? err.message : "등록 신청에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    !!season &&
    name.trim() &&
    isExisting !== null &&
    phoneNumber.trim() &&
    phoneVerified &&
    !!verificationToken &&
    (needsBranch(season)
      ? !!branch && (branch === "N" ? !!age.trim() : !!(school.trim() && grade))
      : !!(school.trim() && grade && age.trim()));

  return (
    <main>
      <section className="w-full py-12 md:py-16">
        <div className="mx-auto max-w-xl px-6">
          {/* 타이틀 */}
          <div className="text-center mb-16">
            <p className="text-gray-500 text-base md:text-lg mb-1">1분 안에</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">등록 예약 해드릴게요!</h2>
          </div>

          {/* 시즌 선택 */}
          <div className="mb-10">
            <h3 className="text-gray-900 font-medium text-base mb-2">시즌을 선택해주세요</h3>
            <hr className="border-gray-200 mb-4" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {SEASON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSeasonChange(opt.value)}
                  className={`cursor-pointer py-3 px-6 rounded-lg border text-base font-medium transition-colors ${
                    season === opt.value
                      ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-700"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 관 종류 (1학기/2학기 선택 시에만) */}
          {showBranchSelection && (
            <div className="mb-10">
              <h3 className="text-gray-900 font-medium text-base mb-2">관 종류를 선택해주세요</h3>
              <hr className="border-gray-200 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {BRANCH_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBranch(opt.value)}
                    className={`cursor-pointer py-3 px-6 rounded-lg border text-base font-medium transition-colors ${
                      branch === opt.value
                        ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-700"
                        : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 간단한 정보 */}
          <form onSubmit={handleSubmit}>
            <h3 className="text-gray-900 font-medium text-base mb-2">간단한 정보만 적어주세요</h3>
            <hr className="border-gray-100 mb-3" />

            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="이름을 적어주세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-gray-200 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50"
              />
              <select
                value={isExisting === null ? "" : isExisting ? "true" : "false"}
                onChange={(e) => {
                  const v = e.target.value;
                  setIsExisting(v === "" ? null : v === "true");
                  setIsExistingError(null);
                }}
                className={`w-full py-3 px-4 rounded-xl border border-gray-200 text-base focus:outline-none focus:border-gray-300 bg-gray-50/50 appearance-none cursor-pointer ${
                  isExisting !== null ? "text-gray-800" : "text-gray-400"
                }`}
                aria-invalid={Boolean(isExistingError)}
              >
                <option value="" disabled hidden>
                  기존 재원 여부를 선택해주세요
                </option>
                <option value="true">기존 재원생</option>
                <option value="false">신규생</option>
              </select>
              {isExistingError && <p className="text-sm text-red-600">{isExistingError}</p>}
              {showBranchSelection && branch === "N" ? (
                <input
                  type="number"
                  min={1}
                  max={99}
                  placeholder="나이를 입력해주세요"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl border border-gray-200 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50"
                />
              ) : (showBranchSelection && branch === "Hi-end") || (season && !needsBranch(season)) ? (
                <>
                  <input
                    type="text"
                    placeholder="학교를 입력해주세요"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl border border-gray-200 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50"
                  />
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className={`w-full py-3 px-4 rounded-xl border border-gray-200 text-base focus:outline-none focus:border-gray-300 bg-gray-50/50 appearance-none cursor-pointer ${grade ? "text-gray-800" : "text-gray-400"}`}
                  >
                    <option value="" disabled hidden>
                      학년을 선택해주세요
                    </option>
                    <option value="2학년">2학년</option>
                    <option value="3학년">3학년</option>
                  </select>
                  {season && !needsBranch(season) && (
                    <input
                      type="number"
                      min={1}
                      max={99}
                      placeholder="나이를 입력해주세요"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full py-3 px-4 rounded-xl border border-gray-200 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50"
                    />
                  )}
                </>
              ) : null}
              <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50/50">
                <input
                  type="tel"
                  placeholder="핸드폰번호를 적어주세요"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 py-3 px-4 border-0 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 bg-transparent"
                />
                <button
                  type="button"
                  onClick={handleSendVerification}
                  disabled={sendCodeLoading}
                  className="shrink-0 cursor-pointer py-3 px-5 bg-gray-100 text-gray-600 text-base font-medium hover:bg-gray-200 whitespace-nowrap border-l border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendCodeLoading ? "발송 중…" : "인증번호 받기"}
                </button>
              </div>
              {sendCodeError && <p className="text-sm text-red-600">{sendCodeError}</p>}
              {verificationSent && (
                <>
                  <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50/50">
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
                      className="flex-1 py-3 px-4 border-0 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 bg-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={phoneVerified || verifyLoading || !verificationCode.trim()}
                      className="shrink-0 cursor-pointer py-3 px-5 bg-gray-100 text-gray-600 text-base font-medium hover:bg-gray-200 whitespace-nowrap border-l border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {phoneVerified ? "인증 완료" : verifyLoading ? "확인 중…" : "인증하기"}
                    </button>
                  </div>
                  {verifyError && <p className="text-sm text-red-600">{verifyError}</p>}
                  {phoneVerified && (
                    <p className="text-sm text-slate-600 font-medium">휴대폰 번호가 인증되었습니다.</p>
                  )}
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="w-full cursor-pointer py-4 rounded-xl bg-gray-700 text-white text-base font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              등록 신청
            </button>
          </form>
        </div>
      </section>
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
