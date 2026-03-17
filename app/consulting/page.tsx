"use client";

import { useState, useMemo, useEffect } from "react";
import ConsultationCalendar from "@/components/ConsultationCalendar";

type Branch = "N" | "Hi-end";

const BRANCH_OPTIONS: { value: Branch; label: string }[] = [
  { value: "N", label: "N수생관" },
  { value: "Hi-end", label: "하이엔드관" },
];

const MORNING_SLOTS = ["10:00", "11:00"];
const AFTERNOON_SLOTS = ["12:00", "14:00", "15:00", "16:00", "17:00"];

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

  const MOCK_TIMES = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

  const availableTimesForDate = useMemo(() => {
    if (!selectedDate) return [];
    if (scheduleData?.availableSchedules) {
      const found = scheduleData.availableSchedules.find((s) => s.date === selectedDate);
      if (found?.availableTimes?.length) return found.availableTimes;
    }
    return MOCK_TIMES;
  }, [selectedDate, scheduleData]);

  const hasSlots = selectedDate && availableTimesForDate.length > 0;

  const handleMonthChange = (date: Date) => {
    setCalendarMonth(date);
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
      <section className="w-full py-12 md:py-16">
        <div className="mx-auto max-w-xl px-6">
          {/* 타이틀 */}
          <div className="text-center mb-16">
            <p className="text-gray-500 text-base md:text-lg mb-1">1분 안에</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">상담 예약 해드릴게요!</h2>
          </div>

          {/* 관 종류 */}
          <div className="mb-10">
            <h3 className="text-gray-900 font-medium text-base mb-2">관 종류를 선택해주세요</h3>
            <hr className="border-gray-200 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {BRANCH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                setBranch(opt.value);
                setSelectedDate(null);
                setSelectedTime(null);
              }}
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

          {/* 날짜·시간 선택 */}
          <div className="mb-10">
            <h3 className="text-gray-900 font-medium text-base mb-2">상담을 원하는 시간을 선택해주세요</h3>
            <hr className="border-gray-200 mb-4" />

            {scheduleError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-700 mb-4">
                {scheduleError}
              </div>
            )}
            {branch && scheduleLoading && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-base text-gray-600 mb-4">
                스케줄을 불러오는 중…
              </div>
            )}
            {/* 캘린더 */}
            <div className="mb-4">
              <ConsultationCalendar
                calendarMonth={calendarMonth}
                selectedDate={selectedDate}
                onMonthChange={handleMonthChange}
                onDateSelect={(dateStr) => {
                  setSelectedDate(dateStr);
                  setSelectedTime(null);
                }}
                disablePastDates={true}
              />
            </div>

            {selectedDate && !hasSlots && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-base text-gray-600 mb-4">
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
              <div className="rounded-none border border-gray-200 p-5">
                <div className="space-y-5">
                  <div>
                    <p className="text-base font-semibold text-gray-800 mb-2">오전</p>
                    <div className="grid grid-cols-4 gap-3">
                      {MORNING_SLOTS.map((t) => {
                        const isAvailable = availableTimesForDate.includes(t);
                        const isSelected = selectedTime === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => isAvailable && setSelectedTime(t)}
                            className={`py-3 rounded-2xl text-base border transition-colors ${
                              !isAvailable
                                ? "cursor-not-allowed border-gray-200 bg-white text-gray-400"
                                : isSelected
                                  ? "cursor-pointer border-slate-800 bg-slate-800 text-white hover:bg-slate-700"
                                  : "cursor-pointer border-gray-200 bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-800 mb-2">오후</p>
                    <div className="grid grid-cols-4 gap-3">
                      {AFTERNOON_SLOTS.map((t) => {
                        const isAvailable = availableTimesForDate.includes(t);
                        const isSelected = selectedTime === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => isAvailable && setSelectedTime(t)}
                            className={`py-3 rounded-2xl text-base border transition-colors ${
                              !isAvailable
                                ? "cursor-not-allowed border-gray-200 bg-white text-gray-400"
                                : isSelected
                                  ? "cursor-pointer border-slate-800 bg-slate-800 text-white hover:bg-slate-700"
                                  : "cursor-pointer border-gray-200 bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-base text-gray-500 mt-4 pt-4 border-t border-gray-100 justify-end">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-md border border-gray-200 bg-gray-200" /> 가능
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-md border border-gray-200 bg-white" /> 불가능
                  </span>
                </div>
              </div>
            )}
          </div>

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
              <input
                type="number"
                min={1}
                max={99}
                placeholder="나이를 입력해주세요"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-gray-200 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50"
              />
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
                className="w-full py-3 px-4 rounded-xl border border-gray-200 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50 disabled:bg-gray-50 disabled:text-gray-500"
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
              className="w-full cursor-pointer py-4 rounded-xl bg-gray-700 text-white text-base font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              신청서 제출
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
