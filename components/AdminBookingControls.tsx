"use client";

import {
  CONSULTATION_CONTROL_OPTIONS,
  RESERVATION_CONTROL_OPTIONS,
  type BookingSettings,
  type ConsultationBranch,
  type ReservationSlotKey,
} from "@/lib/bookingAvailability";
import { useBookingSettings } from "@/hooks/useBookingSettings";

function ToggleButton({
  label,
  open,
  disabled,
  onToggle,
}: {
  label: string;
  open: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        open
          ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-bold ${
          open ? "bg-emerald-600 text-white" : "bg-slate-400 text-white"
        }`}
      >
        {open ? "ON" : "OFF"}
      </span>
    </button>
  );
}

export default function AdminBookingControls() {
  const { settings, loading, saving, error, saveSettings } = useBookingSettings();

  const toggleConsultation = (key: ConsultationBranch) => {
    const next: BookingSettings = {
      ...settings,
      consultation: {
        ...settings.consultation,
        [key]: !settings.consultation[key],
      },
    };
    void saveSettings(next);
  };

  const toggleReservation = (key: ReservationSlotKey) => {
    const next: BookingSettings = {
      ...settings,
      reservation: {
        ...settings.reservation,
        [key]: !settings.reservation[key],
      },
    };
    void saveSettings(next);
  };

  return (
    <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-md md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">상담 신청 / 등록 예약 제어</h2>
        <p className="mt-1 text-sm text-slate-500">
          ON이면 클라이언트가 해당 예약을 할 수 있고, OFF면 운영상 불가 안내가 표시됩니다.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">설정을 불러오는 중…</p>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-800">상담 신청</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CONSULTATION_CONTROL_OPTIONS.map((opt) => (
                <ToggleButton
                  key={opt.key}
                  label={opt.label}
                  open={settings.consultation[opt.key]}
                  disabled={saving}
                  onToggle={() => toggleConsultation(opt.key)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-800">등록 예약</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {RESERVATION_CONTROL_OPTIONS.map((opt) => (
                <ToggleButton
                  key={opt.key}
                  label={opt.label}
                  open={settings.reservation[opt.key]}
                  disabled={saving}
                  onToggle={() => toggleReservation(opt.key)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
