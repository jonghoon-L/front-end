"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_BOOKING_SETTINGS,
  mergeBookingSettings,
  type BookingSettings,
} from "@/lib/bookingAvailability";

export function useBookingSettings() {
  const [settings, setSettings] = useState<BookingSettings>(DEFAULT_BOOKING_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/booking-settings", { cache: "no-store" });
      if (!res.ok) throw new Error("설정을 불러오지 못했습니다.");
      const data = (await res.json()) as Partial<BookingSettings>;
      setSettings(mergeBookingSettings(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "설정을 불러오지 못했습니다.");
      setSettings(DEFAULT_BOOKING_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveSettings = useCallback(async (next: BookingSettings) => {
    setSaving(true);
    setError(null);
    const prev = settings;
    setSettings(next);
    try {
      const res = await fetch("/api/booking-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error("설정 저장에 실패했습니다.");
      const data = (await res.json()) as Partial<BookingSettings>;
      setSettings(mergeBookingSettings(data));
    } catch (err) {
      setSettings(prev);
      setError(err instanceof Error ? err.message : "설정 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }, [settings]);

  return { settings, loading, saving, error, reload, saveSettings, setSettings };
}
