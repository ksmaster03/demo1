"use client";

/**
 * BookingWidget — Client component
 * - ถ้ายังไม่ได้ล็อกอิน: แสดง login gate (Google / LINE buttons)
 * - ถ้าล็อกอินแล้ว: แสดงปฏิทิน (weekends only) + เลือก time slot + pay button
 * - Pay button → POST /api/checkout → redirect ไป Stripe Checkout
 * - Slots: fetch จาก GET /api/availability?date=YYYY-MM-DD (real availability)
 */

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";

// --- helpers -----------------------------------------------------------

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getWeekendDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

/** แปลง Date เป็น "YYYY-MM-DD" (local date) */
function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// --- component ---------------------------------------------------------

export default function BookingWidget() {
  const { data: session, status } = useSession();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [focusNote, setFocusNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Real availability from API ---
  const [availableSlots, setAvailableSlots] = useState<string[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots(null);
      return;
    }
    setSlotsLoading(true);
    setAvailableSlots(null);
    const dateStr = toDateStr(selectedDate);
    fetch(`/api/availability?date=${dateStr}`)
      .then((r) => r.json())
      .then((data: { slots?: string[] }) => setAvailableSlots(data.slots ?? []))
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate]);

  // Show login gate if not authenticated
  if (status === "loading") {
    return <div style={{ textAlign: "center", padding: "60px", color: "var(--muted)" }}>กำลังโหลด...</div>;
  }

  if (!session) {
    return (
      <div className="booking" style={{ gridTemplateColumns: "1fr" }}>
        <div className="bk-main" style={{ maxWidth: "480px", margin: "0 auto" }}>
          <div className="gate">
            <div className="glock"><span className="mi">lock</span></div>
            <h3>เข้าสู่ระบบเพื่อจอง</h3>
            <p>ล็อกอินด้วย Google หรือ LINE เพื่อเลือกวันเวลาและชำระเงิน</p>
            <div className="oauth">
              <button
                className="btn btn-google"
                onClick={() => signIn("google", { callbackUrl: "/#booking" })}
              >
                <svg className="svg-ic" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.8 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.5-.4-3.5z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                  <path fill="#4CAF50" d="M24 44c5.2 0 10-1.9 13.7-5.1l-6.3-5.3C29.5 35.4 26.9 36 24 36c-5.2 0-9.7-3.2-11.3-7.8l-6.5 5C9.6 39.5 16.3 44 24 44z"/>
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l6.3 5.3C37.1 39 44 34 44 24c0-1.2-.1-2.5-.4-3.5z"/>
                </svg>
                เข้าสู่ระบบด้วย Google
              </button>
              <button
                className="btn btn-line"
                onClick={() => signIn("line", { callbackUrl: "/#booking" })}
              >
                <span className="mi" style={{ fontSize: 20 }}>chat</span>
                เข้าสู่ระบบด้วย LINE
              </button>
            </div>
            <div className="gnote">ข้อมูลของคุณจะถูกเก็บเป็นความลับ · ไม่มีการโพสต์อัตโนมัติ</div>
          </div>
        </div>
      </div>
    );
  }

  // Build calendar data
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const weekendDays = getWeekendDays(viewYear, viewMonth);
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null); setSelectedTime(null);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null); setSelectedTime(null);
  }

  function dayClass(d: number): string {
    const date = new Date(viewYear, viewMonth, d);
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isWknd = weekendDays.some(w => isSameDay(w, date));
    const isSel = selectedDate && isSameDay(selectedDate, date);
    if (isPast) return "day off";
    if (!isWknd) return "day off";
    if (isSel) return "day avail sel";
    return "day avail";
  }

  async function handlePay() {
    if (!selectedDate || !selectedTime) return;
    setError(null);
    setLoading(true);

    const [h, m] = selectedTime.split(":").map(Number);
    const startsAt = new Date(selectedDate);
    startsAt.setHours(h, m, 0, 0);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startsAt: startsAt.toISOString(),
          durationMin: 60,
          focusNote: focusNote || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "เกิดข้อผิดพลาด");
      if (data.url) window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="booking">
      {/* Left rail */}
      <div className="bk-rail">
        <div className="logo-b">
          <span className="mi" style={{ color: "var(--red)", fontSize: 28 }}>weekend</span>
        </div>
        <h3>Claude Code Weekend</h3>
        <div className="role">สอนสด 1:1 โดยโค้ช</div>
        <div className="bk-meta">
          <div className="m"><div className="k"><span className="mi">schedule</span></div><span><b>60 นาที</b></span></div>
          <div className="m"><div className="k"><span className="mi">payments</span></div><span><b>฿1,000</b> / ชั่วโมง</span></div>
          <div className="m"><div className="k"><span className="mi">weekend</span></div><span><b>เสาร์-อาทิตย์</b>เท่านั้น</span></div>
          <div className="m"><div className="k"><span className="mi">videocam</span></div><span>ออนไลน์ (Zoom / Meet)</span></div>
          <div className="m"><div className="k"><span className="mi">language</span></div><span>ภาษาไทย / English</span></div>
        </div>
        <div className="guarantee">
          <span className="mi">verified</span>
          <span>ชำระผ่าน Stripe ปลอดภัย · ยกเลิกก่อน 24 ชม. คืนเงินเต็ม</span>
        </div>
      </div>

      {/* Right: calendar + slots + pay */}
      <div className="bk-main">
        <div className="bk-user">
          <span className="mi">check_circle</span>
          <span>เข้าสู่ระบบแล้ว: <b>{session.user?.name ?? session.user?.email}</b></span>
          <button
            onClick={() => signIn(undefined, { callbackUrl: "/#booking" })}
            style={{ background: "none", border: "none", color: "var(--red)", fontWeight: 700, cursor: "pointer", marginLeft: "auto" }}
          >
            เปลี่ยนบัญชี
          </button>
        </div>

        <div className="bk-steps">
          <div className={`st ${!selectedDate ? "on" : ""}`}>
            <span className="n">1</span> เลือกวัน
          </div>
          <div className="bar" />
          <div className={`st ${selectedDate && !selectedTime ? "on" : ""}`}>
            <span className="n">2</span> เลือกเวลา
          </div>
          <div className="bar" />
          <div className={`st ${selectedDate && selectedTime ? "on" : ""}`}>
            <span className="n">3</span> ชำระเงิน
          </div>
        </div>

        <div className="cal-grid">
          {/* Calendar */}
          <div>
            <div className="cal-head">
              <b>{monthName}</b>
              <div className="cal-nav">
                <button onClick={prevMonth}><span className="mi">chevron_left</span></button>
                <button onClick={nextMonth}><span className="mi">chevron_right</span></button>
              </div>
            </div>
            <div className="dow">
              {["อา","จ","อ","พ","พฤ","ศ","ส"].map((d, i) => (
                <span key={d} className={i === 0 || i === 6 ? "we" : ""}>{d}</span>
              ))}
            </div>
            <div className="days">
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`e${i}`} className="day empty" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = i + 1;
                const cls = dayClass(d);
                return (
                  <button
                    key={d}
                    className={cls}
                    disabled={cls === "day off"}
                    onClick={() => {
                      setSelectedDate(new Date(viewYear, viewMonth, d));
                      setSelectedTime(null);
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots — real availability from /api/availability */}
          <div className="slots-wrap">
            <div className="tz"><span className="mi">schedule</span> เวลาในไทย (ICT, UTC+7)</div>
            {!selectedDate ? (
              <div className="slots-empty">เลือกวันเสาร์หรืออาทิตย์ก่อนนะครับ</div>
            ) : slotsLoading ? (
              <div className="slots-empty">กำลังโหลด slot...</div>
            ) : availableSlots && availableSlots.length === 0 ? (
              <div className="slots-empty">ไม่มี slot ว่างในวันนี้ กรุณาเลือกวันอื่น</div>
            ) : (
              <div className="slots">
                {(availableSlots ?? []).map((t) => (
                  <button
                    key={t}
                    className={`slot${selectedTime === t ? " sel" : ""}`}
                    onClick={() => setSelectedTime(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary + Pay */}
        {selectedDate && selectedTime && (
          <div style={{ marginTop: "20px" }}>
            <div className="summary">
              <div className="row">
                <span>วัน</span>
                <b>{selectedDate.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</b>
              </div>
              <div className="row">
                <span>เวลา</span><b>{selectedTime} น. (60 นาที)</b>
              </div>
              <div className="row">
                <span>บริการ</span><b>Claude Code Weekend · 1:1</b>
              </div>
              <div className="row total">
                <span>ยอดชำระ</span><b>฿1,000</b>
              </div>
            </div>
            <div className="field">
              <label>สิ่งที่อยากเรียน / โปรเจกต์ที่มีในใจ (ไม่บังคับ)</label>
              <textarea
                rows={2}
                placeholder="เช่น สร้าง Next.js app + deploy บน AWS, ทำ MCP server..."
                value={focusNote}
                onChange={(e) => setFocusNote(e.target.value)}
              />
            </div>
            {error && (
              <div style={{ color: "var(--red)", fontSize: "14px", marginBottom: "12px", padding: "10px 14px", background: "var(--pink)", borderRadius: "10px" }}>
                {error}
              </div>
            )}
            <button
              className="btn btn-cta"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handlePay}
              disabled={loading}
            >
              <span className="mi">payments</span>
              {loading ? "กำลังเชื่อมต่อ Stripe..." : "ชำระเงิน ฿1,000 ผ่าน Stripe"}
            </button>
            <div className="pay-row">
              <span className="mi" style={{ fontSize: 16 }}>lock</span>
              ชำระผ่าน Stripe (ปลอดภัย) · ไม่เก็บข้อมูลบัตร
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
