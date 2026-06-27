/**
 * GET /api/availability?date=YYYY-MM-DD
 * คืน time slots ที่ว่างสำหรับวันนั้น (weekends only)
 * ลบ Bookings ที่ confirmed/pending_payment + BlockedSlots ออก
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Time slots เดียวกับ BookingWidget
const BASE_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date"); // "YYYY-MM-DD"

  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json({ error: "date param required (YYYY-MM-DD)" }, { status: 400 });
  }

  // parse เป็น local date (วันที่ผู้ใช้เลือก)
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  // เฉพาะวันหยุด
  if (!isWeekend(date)) {
    return NextResponse.json({ slots: [] });
  }

  // ช่วงเวลาของวันนั้น (UTC) — ใช้ตรวจ Booking.startsAt
  const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0);
  const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

  // วันเดียวกันในรูป UTC midnight — ใช้ตรวจ BlockedSlot.date (@db.Date)
  const dateUtc = new Date(`${dateStr}T00:00:00.000Z`);

  const [bookedSlots, blocks] = await Promise.all([
    // Bookings ที่ confirmed หรือ pending_payment สำหรับวันนั้น
    prisma.booking.findMany({
      where: {
        startsAt: { gte: dayStart, lte: dayEnd },
        status: { in: ["confirmed", "pending_payment"] },
      },
      select: { startsAt: true },
    }),

    // BlockedSlots สำหรับวันนั้น
    prisma.blockedSlot.findMany({
      where: { date: dateUtc },
    }),
  ]);

  // ถ้ามี block ที่ startTime=null = ปิดทั้งวัน
  const wholeDayBlocked = blocks.some((b) => b.startTime === null);
  if (wholeDayBlocked) {
    return NextResponse.json({ slots: [] });
  }

  // Time strings ที่ถูก block เป็น slot เฉพาะ
  const blockedTimes = new Set(blocks.filter((b) => b.startTime !== null).map((b) => b.startTime!));

  // Time strings ที่มีการจองแล้ว
  const bookedTimes = new Set(
    bookedSlots.map((b) => {
      const d = new Date(b.startsAt);
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      return `${h}:${m}`;
    })
  );

  const available = BASE_SLOTS.filter(
    (t) => !bookedTimes.has(t) && !blockedTimes.has(t)
  );

  return NextResponse.json({ slots: available });
}
