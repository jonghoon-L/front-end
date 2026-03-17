"use client";

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

type Props = {
  calendarMonth: Date;
  selectedDate: string | null;
  onMonthChange: (date: Date) => void;
  onDateSelect: (dateStr: string) => void;
  reservationCountByDate?: Record<string, number>;
  disablePastDates?: boolean;
};

export default function ConsultationCalendar({
  calendarMonth,
  selectedDate,
  onMonthChange,
  onDateSelect,
  reservationCountByDate = {},
  disablePastDates = true,
}: Props) {
  const calendarDays = getCalendarDays(calendarMonth.getFullYear(), calendarMonth.getMonth());
  const todayStr = formatDateForInput(new Date());

  const handlePrevMonth = () => {
    onMonthChange(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1));
  };

  return (
    <div className="border border-gray-200 rounded-none p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="cursor-pointer p-3 rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label="이전 달"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-base font-medium text-gray-900">
          {calendarMonth.getFullYear()}년 {calendarMonth.getMonth() + 1}월
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="cursor-pointer p-3 rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label="다음 달"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-sm text-gray-500 mb-2 [&>*]:flex [&>*]:aspect-square [&>*]:items-center [&>*]:justify-center">
        {["일", "월", "화", "수", "목", "금", "토"].map((w, i) => (
          <span key={w} className={i === 0 ? "text-red-500" : ""}>
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 [&>*]:min-w-0">
        {calendarDays.map(({ date, isCurrentMonth, dateStr }) => {
          const isSelected = selectedDate === dateStr;
          const isPast = disablePastDates && dateStr < todayStr;
          const isSunday = date.getDay() === 0;
          const disabled = isPast;
          const count = reservationCountByDate[dateStr] ?? 0;
          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                onDateSelect(dateStr);
              }}
              className={`aspect-square min-w-[2.5rem] w-full max-w-12 flex flex-col items-center justify-center rounded-full text-base transition-colors ${
                !isCurrentMonth ? "text-gray-300" : isSunday ? "text-red-500" : "text-gray-900"
              } ${disabled || !isCurrentMonth ? "cursor-default" : "cursor-pointer hover:bg-gray-100"} ${
                disabled ? "opacity-50" : ""
              } ${isSelected ? "bg-slate-800 text-white hover:bg-slate-700" : ""}`}
            >
              <span>{date.getDate()}</span>
              {count > 0 && (
                <span
                  className={`mt-0.5 text-[10px] leading-none ${
                    isSelected ? "text-white/90" : "text-emerald-600"
                  }`}
                >
                  예약 {count}건
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
