"use client";

import { useState, useMemo, useEffect } from "react";
import PageHero from "@/components/PageHero";

type Branch = "N" | "Hi-end";

const BRANCH_OPTIONS: { value: Branch; label: string }[] = [
  { value: "N", label: "N수생관" },
  { value: "Hi-end", label: "하이엔드관" },
];

/** API 응답: 월별 상담 가능 스케줄 */
interface ConsultationsScheduleResponse {
  branch: string;
  yearMonth: string;
  availableSchedules: {
    date: string;
    availableTimes: string[];
  }[];
}

function getConsultApiBase(): string {
  if (typeof process === "undefined") return "";
  return process.env.NEXT_PUBLIC_CONSULT_API_BASE ?? "";
}

/** 인증번호 발송 API 응답 */
interface SendAuthResponse {
  success: boolean;
  message: string;
}

async function sendVerificationCode(phoneNumber: string): Promise<SendAuthResponse> {
  const base = getConsultApiBase();
  if (!base) throw new Error("API 주소가 설정되지 않았습니다. NEXT_PUBLIC_CONSULT_API_BASE를 설정해 주세요.");
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

/** 인증 검증 API 응답 */
interface VerifyAuthResponse {
  success: boolean;
  message: string;
  verificationToken: string;
}

async function verifyAuthCode(phoneNumber: string, authCode: string): Promise<VerifyAuthResponse> {
  const base = getConsultApiBase();
  if (!base) throw new Error("API 주소가 설정되지 않았습니다. NEXT_PUBLIC_CONSULT_API_BASE를 설정해 주세요.");
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

/** 상담 등록 API 응답 */
interface SubmitConsultationResponse {
  success: boolean;
  message: string;
  consultationId?: number;
  registeredAt?: string;
}

async function submitConsultation(
  payload: { branch: Branch; date: string; time: string; name: string; age: number; phoneNumber: string },
  verificationToken: string
): Promise<SubmitConsultationResponse> {
  const base = getConsultApiBase();
  if (!base) throw new Error("API 주소가 설정되지 않았습니다. NEXT_PUBLIC_CONSULT_API_BASE를 설정해 주세요.");
  const res = await fetch(`${base}/v1/user/consultations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${verificationToken}`,
    },
    body: JSON.stringify({
      ...payload,
      phoneNumber: payload.phoneNumber.replace(/\D/g, ""),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? `요청 실패: ${res.status}`);
  return data;
}

async function fetchConsultationsSchedule(
  branch: Branch,
  yearMonth: string
): Promise<ConsultationsScheduleResponse> {
  const base = getConsultApiBase();
  if (!base) throw new Error("API 주소가 설정되지 않았습니다. NEXT_PUBLIC_CONSULT_API_BASE를 설정해 주세요.");
  const params = new URLSearchParams({ branch, yearMonth });
  const res = await fetch(`${base}/v1/common/consultations?${params}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`스케줄 조회 실패: ${res.status}`);
  return res.json();
}

/** 특정 날짜에 대해 “가능한” 시간을 목 데이터로 반환 (선택된 날짜의 해시 기반) */
function formatDateForInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const prevMonth = new Date(year, month, 0);
  const prevDays = prevMonth.getDate();

  const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevDays - i);
    days.push({ date: d, isCurrentMonth: false, dateStr: formatDateForInput(d) });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    days.push({ date: d, isCurrentMonth: true, dateStr: formatDateForInput(d) });
  }
  const rest = 42 - days.length;
  for (let i = 1; i <= rest; i++) {
    const d = new Date(year, month + 1, i);
    days.push({ date: d, isCurrentMonth: false, dateStr: formatDateForInput(d) });
  }
  return days;
}

function toYearMonth(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function ConsultingPage() {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleData, setScheduleData] = useState<ConsultationsScheduleResponse | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [sendCodeError, setSendCodeError] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const yearMonth = useMemo(() => toYearMonth(calendarMonth), [calendarMonth]);

  useEffect(() => {
    if (!branch) {
      setScheduleData(null);
      setScheduleError(null);
      return;
    }
    let cancelled = false;
    setScheduleLoading(true);
    setScheduleError(null);
    fetchConsultationsSchedule(branch, yearMonth)
      .then((data) => {
        if (!cancelled) setScheduleData(data);
      })
      .catch((err) => {
        if (!cancelled) setScheduleError(err instanceof Error ? err.message : "스케줄을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setScheduleLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [branch, yearMonth]);

  const calendarDays = useMemo(
    () => getCalendarDays(calendarMonth.getFullYear(), calendarMonth.getMonth()),
    [calendarMonth]
  );

  const availableTimesForDate = useMemo(() => {
    if (!selectedDate || !scheduleData?.availableSchedules) return [];
    const found = scheduleData.availableSchedules.find((s) => s.date === selectedDate);
    return found?.availableTimes ?? [];
  }, [selectedDate, scheduleData]);

  const hasSlots = selectedDate && availableTimesForDate.length > 0;

  const handlePrevMonth = () => {
    setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };
  const handleNextMonth = () => {
    setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1));
    setSelectedDate(null);
    setSelectedTime(null);
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
    if (!branch || !selectedDate || !selectedTime || !name.trim() || !age.trim() || !phoneNumber.trim() || !phoneVerified || !verificationToken) return;
    const payload = {
      branch,
      date: selectedDate,
      time: selectedTime,
      name: name.trim(),
      age: parseInt(age, 10),
      phoneNumber: phoneNumber.trim(),
    };
    setIsSubmitting(true);
    try {
      const data = await submitConsultation(payload, verificationToken);
      if (data.message) alert(data.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : "상담 신청에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = formatDateForInput(new Date());

  return (
    <main>
      <PageHero
        imageUrl="/images/place/n/n_p8.jpg"
        lines={["상담 신청"]}
        crumbs={[{ label: "상담 신청", href: "/consulting" }]}
      />

      <section className="w-full py-12 md:py-16">
        <div className="mx-auto max-w-md px-6">
          {/* 타이틀 */}
          <div className="text-center mb-12">
            <p className="text-gray-500 text-sm md:text-base mb-1">1분 안에</p>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">상담 예약 해드릴게요!</h2>
          </div>

          {/* 관 종류 */}
          <div className="mb-10">
            <h3 className="text-gray-900 font-medium mb-2">관 종류를 선택해주세요</h3>
            <hr className="border-gray-200 mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {BRANCH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                setBranch(opt.value);
                setSelectedDate(null);
                setSelectedTime(null);
              }}
                  className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                    branch === opt.value
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 날짜·시간 선택 */}
          <div className="mb-10">
            <h3 className="text-gray-900 font-medium mb-2">상담을 원하는 시간을 선택해주세요</h3>
            <hr className="border-gray-200 mb-4" />

            {scheduleError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
                {scheduleError}
              </div>
            )}
            {branch && scheduleLoading && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 mb-4">
                스케줄을 불러오는 중…
              </div>
            )}
            {/* 캘린더 */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  aria-label="이전 달"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-900">
                  {calendarMonth.getFullYear()}년 {calendarMonth.getMonth() + 1}월
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  aria-label="다음 달"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                {["일", "월", "화", "수", "목", "금", "토"].map((w, i) => (
                  <span key={w} className={i === 0 ? "text-red-500" : ""}>
                    {w}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(({ date, isCurrentMonth, dateStr }) => {
                  const isSelected = selectedDate === dateStr;
                  const isPast = dateStr < todayStr;
                  const isSunday = date.getDay() === 0;
                  const disabled = isPast;
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (disabled) return;
                        setSelectedDate(dateStr);
                        setSelectedTime(null);
                      }}
                      className={`aspect-square min-w-[2.25rem] w-full max-w-10 flex items-center justify-center rounded-full text-sm transition-colors ${
                        !isCurrentMonth ? "text-gray-300" : isSunday ? "text-red-500" : "text-gray-900"
                      } ${disabled ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100"} ${
                        isSelected ? "bg-green-600 text-white hover:bg-green-700" : ""
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && !hasSlots && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 mb-4">
                {!branch ? (
                  <>관을 먼저 선택해 주세요.</>
                ) : selectedDate === todayStr ? (
                  <>
                    오늘은 가능한 시간이 없어요
                    <br />
                    다른 날을 클릭해주세요 😊
                  </>
                ) : (
                  <>
                    이 날은 가능한 시간이 없어요
                    <br />
                    다른 날을 클릭해주세요 😊
                  </>
                )}
              </div>
            )}

            {selectedDate && hasSlots && (
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">예약 가능 시간</p>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimesForDate.map((t) => {
                    const isSelected = selectedTime === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`py-2 rounded-2xl text-sm border transition-colors ${
                          isSelected
                            ? "border-green-600 bg-green-600 text-white"
                            : "border-gray-200 bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-4 text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100 justify-end">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-md bg-green-600" /> 선택
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 간단한 정보 */}
          <form onSubmit={handleSubmit}>
            <h3 className="text-gray-700 font-medium text-base mb-1.5">간단한 정보만 적어주세요</h3>
            <hr className="border-gray-100 mb-3" />

            <div className="space-y-3 mb-5">
              <input
                type="text"
                placeholder="이름을 적어주세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50"
              />
              <input
                type="number"
                min={1}
                max={99}
                placeholder="나이를 입력해주세요"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50"
              />
              <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50/50">
                <input
                  type="tel"
                  placeholder="핸드폰번호를 적어주세요"
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
              {sendCodeError && (
                <p className="text-sm text-red-600">{sendCodeError}</p>
              )}
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
              {verifyError && (
                <p className="text-sm text-red-600">{verifyError}</p>
              )}
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
                    <p className="text-xs text-green-600 font-medium">휴대폰 번호가 인증되었습니다.</p>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !branch ||
                !selectedDate ||
                !selectedTime ||
                !name.trim() ||
                !age.trim() ||
                !phoneNumber.trim() ||
                !phoneVerified ||
                !verificationToken
              }
              className="w-full py-3 rounded-xl bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              신청서 제출
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
