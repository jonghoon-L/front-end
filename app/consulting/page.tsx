"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import ConsultationCalendar from "@/components/ConsultationCalendar";
import { getAvailableTimeSlots } from "@/lib/consultationSlots";
import { apiPost, AUTH_TOKEN_KEY } from "@/api/apiClient";
import { sendVerificationCode, verifyAuthCode } from "@/api/auth";
import { fetchUnavailableSchedules } from "@/api/consultations";
import { getConsultationMinSelectableDateStr } from "@/lib/consultationDateRules";
import MessageModal from "@/components/MessageModal";

type Branch = "N" | "Hi-end";

const BRANCH_OPTIONS: { value: Branch; label: string }[] = [
  { value: "N", label: "N수생관" },
  { value: "Hi-end", label: "하이엔드관" },
];

/** 상담 등록 API 응답 */
interface SubmitConsultationResponse {
  success: boolean;
  message: string;
  consultationId?: number;
  registeredAt?: string;
}

/** POST /v1/user/consultations - token은 localStorage의 verificationToken을 apiClient가 Authorization 헤더에 자동 주입 */
async function submitConsultation(
  payload: {
    branch: Branch;
    date: string;
    time: string;
    name: string;
    phoneNumber: string;
  } & ({ age: number } | { school: string; grade: string })
): Promise<SubmitConsultationResponse> {
  return apiPost<SubmitConsultationResponse>(
    "/v1/user/consultations",
    {
      ...payload,
      phoneNumber: payload.phoneNumber.replace(/\D/g, ""),
    },
    { skipUnauthorizedRedirect: true }
  );
}

export default function ConsultingPage() {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [sendCodeError, setSendCodeError] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState<{
    branch: Branch;
    yearMonth: string;
    bookedByDate: Record<string, string[]>;
  } | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [phoneAuthModalMessage, setPhoneAuthModalMessage] = useState<string | null>(null);
  const reloadAfterModalCloseRef = useRef(false);

  const yearMonthStr = useMemo(() => {
    const y = calendarMonth.getFullYear();
    const m = String(calendarMonth.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }, [calendarMonth]);

  useEffect(() => {
    if (!branch) {
      setScheduleData(null);
      return;
    }
    setScheduleLoading(true);
    setScheduleError(null);
    fetchUnavailableSchedules(branch, yearMonthStr)
      .then((res) => {
        const bookedByDate: Record<string, string[]> = {};
        for (const item of res.unavailableSchedules ?? []) {
          const times = item.bookedTimes ?? item.unavailableTimes ?? [];
          bookedByDate[item.date] = times;
        }
        setScheduleData({ branch, yearMonth: res.yearMonth, bookedByDate });
      })
      .catch((err) => setScheduleError(err instanceof Error ? err.message : "스케줄을 불러오지 못했습니다."))
      .finally(() => setScheduleLoading(false));
  }, [branch, yearMonthStr]);

  const allTimeSlots = useMemo(() => {
    if (!selectedDate || !branch) return [];
    const d = new Date(selectedDate + "T12:00:00");
    return getAvailableTimeSlots(branch, d);
  }, [selectedDate, branch]);

  const bookedTimes = useMemo(() => {
    if (!selectedDate || !scheduleData || scheduleData.yearMonth !== yearMonthStr) return [];
    return scheduleData.bookedByDate[selectedDate] ?? [];
  }, [selectedDate, scheduleData, yearMonthStr]);

  const morningSlots = useMemo(() => allTimeSlots.filter((t) => t < "12:00"), [allTimeSlots]);
  const afternoonSlots = useMemo(() => allTimeSlots.filter((t) => t >= "12:00"), [allTimeSlots]);

  const hasSlots = selectedDate && allTimeSlots.length > 0;
  const hasAvailableSlots = allTimeSlots.some((t) => !bookedTimes.includes(t));

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
    const minDate = getConsultationMinSelectableDateStr();
    if (
      !branch ||
      !selectedDate ||
      selectedDate < minDate ||
      !selectedTime ||
      !name.trim() ||
      !phoneNumber.trim() ||
      !phoneVerified ||
      !verificationToken
    )
      return;
    const isHiEnd = branch === "Hi-end";
    if (isHiEnd && (!school.trim() || !grade)) return;
    if (!isHiEnd && !age.trim()) return;

    const payload = {
      branch,
      date: selectedDate,
      time: selectedTime,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      ...(isHiEnd ? { school: school.trim(), grade } : { age: parseInt(age, 10) }),
    };
    setIsSubmitting(true);
    try {
      const data = await submitConsultation(payload);
      reloadAfterModalCloseRef.current = true;
      setPhoneAuthModalMessage(data.message || "상담 신청이 접수되었습니다.");
    } catch (err) {
      reloadAfterModalCloseRef.current = false;
      setPhoneAuthModalMessage(err instanceof Error ? err.message : "상담 신청에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const minSelectableDateStr = getConsultationMinSelectableDateStr();

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
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {scheduleError}
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
              {scheduleLoading && branch && (
                <p className="mt-2 text-sm text-gray-500">스케줄 불러오는 중…</p>
              )}
            </div>

            {selectedDate && !hasSlots && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-base text-gray-600 mb-4">
                {!branch ? (
                  <>관을 먼저 선택해 주세요.</>
                ) : selectedDate === minSelectableDateStr ? (
                  <>
                    가장 빠른 예약일에도 가능한 시간이 없어요
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
                {!hasAvailableSlots && (
                  <p className="mb-4 text-sm text-amber-600">이 날은 모든 시간이 예약되었어요. 다른 날을 선택해 주세요. 😊</p>
                )}
                <div className="space-y-5">
                  {morningSlots.length > 0 && (
                    <div>
                      <p className="text-base font-semibold text-gray-800 mb-2">오전</p>
                      <div className="grid grid-cols-4 gap-3">
                        {morningSlots.map((t) => {
                          const isSelected = selectedTime === t;
                          const isBooked = bookedTimes.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              disabled={isBooked}
                              onClick={() => !isBooked && setSelectedTime(t)}
                              className={`py-3 rounded-2xl text-base border transition-colors ${
                                isBooked
                                  ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
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
                  )}
                  {afternoonSlots.length > 0 && (
                    <div>
                      <p className="text-base font-semibold text-gray-800 mb-2">오후</p>
                      <div className="grid grid-cols-4 gap-3">
                        {afternoonSlots.map((t) => {
                          const isSelected = selectedTime === t;
                          const isBooked = bookedTimes.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              disabled={isBooked}
                              onClick={() => !isBooked && setSelectedTime(t)}
                              className={`py-3 rounded-2xl text-base border transition-colors ${
                                isBooked
                                  ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
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
                  )}
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
              {branch === "Hi-end" ? (
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
                </>
              ) : branch === "N" ? (
                <input
                  type="number"
                  min={1}
                  max={99}
                  placeholder="나이를 입력해주세요"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl border border-gray-200 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 bg-gray-50/50"
                />
              ) : null}
              <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 overflow-hidden bg-gray-50/50">
                <input
                  type="tel"
                  placeholder="핸드폰번호를 적어주세요"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="min-w-0 flex-1 py-3 px-4 border-0 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 bg-transparent"
                />
                <button
                  type="button"
                  onClick={handleSendVerification}
                  disabled={sendCodeLoading}
                  className="w-28 md:w-32 shrink-0 whitespace-nowrap text-center cursor-pointer py-3 px-2 text-sm md:px-5 md:text-base bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 border-l border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendCodeLoading ? "발송 중…" : "인증번호 받기"}
                </button>
              </div>
              {sendCodeError && (
                <p className="text-sm text-red-600">{sendCodeError}</p>
              )}
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
                      className="w-28 md:w-32 shrink-0 whitespace-nowrap text-center cursor-pointer py-3 px-2 text-sm md:px-5 md:text-base bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 border-l border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={
                isSubmitting ||
                !branch ||
                !selectedDate ||
                !selectedTime ||
                !name.trim() ||
                !phoneNumber.trim() ||
                !phoneVerified ||
                !verificationToken ||
                (branch === "Hi-end" ? !school.trim() || !grade : !age.trim())
              }
              className="w-full cursor-pointer py-4 rounded-xl bg-gray-700 text-white text-base font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              신청서 제출
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
