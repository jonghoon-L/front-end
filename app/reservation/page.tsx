"use client";

import { useState } from "react";
import { apiPost, AUTH_TOKEN_KEY } from "@/api/apiClient";
import { sendVerificationCode, verifyAuthCode } from "@/api/auth";
import { Info } from "lucide-react";

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
    age?: number;
    school?: string;
    grade?: string;
  }
): Promise<SubmitWaitlistResponse> {
  const body: Record<string, unknown> = {
    season: payload.season,
    name: payload.name.trim(),
    phoneNumber: payload.phoneNumber.replace(/\D/g, ""),
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

  const showBranchSelection = season !== null && needsBranch(season);

  const handleSeasonChange = (s: Season) => {
    setSeason(s);
    if (!needsBranch(s)) {
      setBranch(null);
    } else {
      setBranch(null);
    }
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
      const token = data.verificationToken;
      setVerificationToken(token);
      setPhoneVerified(true);
      if (typeof window !== "undefined") localStorage.setItem(AUTH_TOKEN_KEY, token);
      if (data.message) alert(data.message);
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "인증에 실패했습니다.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!season || !name.trim() || !phoneNumber.trim() || !phoneVerified || !verificationToken) return;
    if (needsBranch(season) && !branch) return;

    const isCamp = !needsBranch(season);
    const useAge = needsBranch(season) && branch === "N";

    if (useAge && !age.trim()) {
      alert("나이를 입력해 주세요.");
      return;
    }
    if (isCamp) {
      const hasSchool = school.trim().length > 0;
      const hasGrade = !!grade;
      const hasAge = age.trim().length > 0;

      if (hasSchool && !hasGrade) {
        alert("학년을 선택해 주세요.");
        return;
      }
      if (hasGrade && !hasSchool) {
        alert("학교를 입력해 주세요.");
        return;
      }
      if (!hasSchool && !hasGrade && !hasAge) {
        alert("학교·학년을 선택하시거나, 나이를 입력해 주세요.");
        return;
      }
    } else if (!useAge && (!school.trim() || !grade)) return;

    const payload: {
      branch: string | null;
      season: Season;
      name: string;
      phoneNumber: string;
      age?: number;
      school?: string;
      grade?: string;
    } = {
      branch: needsBranch(season) ? branch! : null,
      season,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
    };
    if (useAge) {
      payload.age = parseInt(age, 10);
    } else if (isCamp) {
      if (school.trim() && grade) {
        payload.school = school.trim();
        payload.grade = grade;
      }
      if (age.trim()) {
        payload.age = parseInt(age, 10);
      }
    } else {
      payload.school = school.trim();
      payload.grade = grade;
    }

    setIsSubmitting(true);
    try {
      const data = await submitWaitlist(payload);
      if (data.message) alert(data.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : "등록 신청에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const useAgeForSubmit = season !== null && needsBranch(season) && branch === "N";
  const isCampForSubmit = season !== null && !needsBranch(season);

  const isValidCampInput = () => {
    const hasSchool = school.trim().length > 0;
    const hasGrade = !!grade;
    const hasAge = age.trim().length > 0;
    if (hasSchool && !hasGrade) return false;
    if (hasGrade && !hasSchool) return false;
    return (hasSchool && hasGrade) || hasAge;
  };

  const canSubmit =
    season &&
    (needsBranch(season) ? branch : true) &&
    name.trim() &&
    phoneNumber.trim() &&
    phoneVerified &&
    verificationToken &&
    (useAgeForSubmit
      ? age.trim()
      : isCampForSubmit
        ? isValidCampInput()
        : school.trim() && grade);

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
                  {season && !needsBranch(season) && (
                    <div className="flex gap-4 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/80 px-5 py-4 shadow-sm ring-1 ring-slate-200/60">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
                        <Info className="h-5 w-5 text-sky-600" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1 pt-0.5">
                        <p className="text-sm font-semibold text-slate-800">입력 안내</p>
                        <p className="text-sm leading-relaxed text-slate-600">
                          <span className="font-medium text-slate-700">학생</span>이시면 학교와 학년을 선택해 주세요.
                          <br />
                          <span className="font-medium text-slate-700">학생이 아닌</span> 경우 나이만 입력해 주세요.
                        </p>
                      </div>
                    </div>
                  )}
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
                    className="w-full py-3 px-4 rounded-xl border border-gray-200 text-base text-gray-800 focus:outline-none focus:border-gray-300 bg-gray-50/50 appearance-none cursor-pointer"
                  >
                    <option value="">학년을 선택해주세요</option>
                    <option value="2학년">2학년</option>
                    <option value="3학년">3학년</option>
                  </select>
                  {season && !needsBranch(season) && (
                    <input
                      type="number"
                      min={1}
                      max={99}
                      placeholder="나이를 입력해주세요 (학생이 아닌 경우)"
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
                className="w-full py-3 px-4 rounded-xl border border-gray-200 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50 disabled:bg-gray-50 disabled:text-gray-500"
              />
              {verifyError && <p className="text-sm text-red-600">{verifyError}</p>}
              {verificationSent && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={phoneVerified || verifyLoading || !verificationCode.trim()}
                    className="cursor-pointer py-3 px-5 rounded-xl border border-gray-200 bg-gray-100 text-gray-600 text-base font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {phoneVerified ? "인증 완료" : verifyLoading ? "확인 중…" : "인증하기"}
                  </button>
                  {phoneVerified && (
                    <p className="text-sm text-slate-600 font-medium">휴대폰 번호가 인증되었습니다.</p>
                  )}
                </div>
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
    </main>
  );
}
