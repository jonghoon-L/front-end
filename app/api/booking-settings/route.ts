import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  DEFAULT_BOOKING_SETTINGS,
  mergeBookingSettings,
  type BookingSettings,
} from "@/lib/bookingAvailability";

const SETTINGS_PATH = path.join(process.cwd(), "data", "booking-settings.json");

async function readSettings(): Promise<BookingSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
    return mergeBookingSettings(JSON.parse(raw) as Partial<BookingSettings>);
  } catch {
    return DEFAULT_BOOKING_SETTINGS;
  }
}

async function writeSettings(settings: BookingSettings): Promise<void> {
  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
}

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<BookingSettings>;
    const settings = mergeBookingSettings(body);
    await writeSettings(settings);
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ message: "설정 저장에 실패했습니다." }, { status: 500 });
  }
}
