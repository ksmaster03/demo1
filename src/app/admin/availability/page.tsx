/**
 * /admin/availability — จัดการ slot ที่ปิด
 * Server actions: addBlock, removeBlock
 * BlockedSlot: date + optional startTime (null = ทั้งวัน)
 */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// Time slots เดียวกับ BookingWidget
const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

// ── Server Actions ──────────────────────────────────────────────────────────

async function addBlock(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || !["coach", "admin"].includes(session.user.role)) return;

  const dateStr = formData.get("date") as string;
  const startTime = (formData.get("startTime") as string) || null;
  const reason = (formData.get("reason") as string) || null;

  if (!dateStr) return;

  // แปลง date string เป็น Date (midnight UTC) สำหรับ @db.Date field
  const date = new Date(dateStr + "T00:00:00.000Z");

  await prisma.blockedSlot.create({
    data: { date, startTime, reason },
  });
  revalidatePath("/admin/availability");
}

async function removeBlock(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || !["coach", "admin"].includes(session.user.role)) return;

  const id = formData.get("id") as string;
  await prisma.blockedSlot.delete({ where: { id } });
  revalidatePath("/admin/availability");
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function AdminAvailabilityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/admin/availability");
  if (session.user.role !== "coach" && session.user.role !== "admin") redirect("/");

  // โหลด blocked slots ทั้งหมด เรียงตาม date
  const blocks = await prisma.blockedSlot.findMany({
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  // แยกเป็น upcoming vs past
  const todayUtc = new Date(new Date().toISOString().split("T")[0] + "T00:00:00.000Z");
  const upcoming = blocks.filter((b) => new Date(b.date) >= todayUtc);
  const past = blocks.filter((b) => new Date(b.date) < todayUtc);

  // ค่า default สำหรับ date input = วันเสาร์ถัดไป
  function nextSaturday(): string {
    const d = new Date();
    const day = d.getDay();
    const daysToSat = day === 6 ? 7 : (6 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + daysToSat);
    return d.toISOString().split("T")[0];
  }

  return (
    <div style={{ padding: "32px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "clamp(22px,3vw,28px)",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span className="mi" style={{ color: "var(--red)", fontSize: "28px" }}>
            block
          </span>
          จัดการ Availability
        </h1>
        <p style={{ color: "var(--ink2)", fontSize: "14px", marginTop: "4px" }}>
          ปิดวันหรือ time slot เฉพาะ — ผู้เรียนจะไม่เห็น slot ที่ถูกบล็อก
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* ── Add block form ─────────────────────────────────────── */}
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: "18px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 800,
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span className="mi" style={{ color: "var(--red)", fontSize: "20px" }}>
              add_circle
            </span>
            เพิ่ม Block
          </h2>

          <form action={addBlock} style={{ display: "grid", gap: "14px" }}>
            {/* Date */}
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="block-date">
                วันที่ <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <input
                id="block-date"
                type="date"
                name="date"
                required
                defaultValue={nextSaturday()}
                style={{
                  width: "100%",
                  border: "1.5px solid var(--border)",
                  borderRadius: "11px",
                  padding: "11px 14px",
                  fontFamily: "inherit",
                  fontSize: "15px",
                  color: "var(--ink)",
                }}
              />
            </div>

            {/* Time slot (optional) */}
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="block-time">
                Time Slot <span style={{ color: "var(--muted)", fontWeight: 400 }}>(ว่างไว้ = ปิดทั้งวัน)</span>
              </label>
              <select
                id="block-time"
                name="startTime"
                style={{
                  width: "100%",
                  border: "1.5px solid var(--border)",
                  borderRadius: "11px",
                  padding: "11px 14px",
                  fontFamily: "inherit",
                  fontSize: "15px",
                  color: "var(--ink)",
                  background: "#fff",
                }}
              >
                <option value="">— ปิดทั้งวัน —</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t} น.
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="block-reason">
                เหตุผล <span style={{ color: "var(--muted)", fontWeight: 400 }}>(ไม่บังคับ)</span>
              </label>
              <input
                id="block-reason"
                type="text"
                name="reason"
                placeholder="เช่น ติดธุระ, หยุดพักผ่อน..."
                style={{
                  width: "100%",
                  border: "1.5px solid var(--border)",
                  borderRadius: "11px",
                  padding: "11px 14px",
                  fontFamily: "inherit",
                  fontSize: "15px",
                  color: "var(--ink)",
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-cta"
              style={{ width: "100%", justifyContent: "center", marginTop: "4px" }}
            >
              <span className="mi">block</span>
              ยืนยันปิด Slot
            </button>
          </form>

          {/* Info box */}
          <div
            style={{
              marginTop: "18px",
              background: "var(--pink-s)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "12px 14px",
              fontSize: "13px",
              color: "var(--ink2)",
              display: "flex",
              gap: "8px",
            }}
          >
            <span className="mi" style={{ color: "var(--red)", fontSize: "18px", flexShrink: 0 }}>
              info
            </span>
            <span>
              วันธรรมดา (จ–ศ) ปิดอยู่แล้วโดยค่าเริ่มต้น
              ใช้หน้านี้เพื่อปิดเฉพาะวันเสาร์-อาทิตย์
            </span>
          </div>
        </div>

        {/* ── Block list ─────────────────────────────────────────── */}
        <div>
          {/* Upcoming blocks */}
          <div
            style={{
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: "18px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                fontWeight: 800,
                fontSize: "15px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span className="mi" style={{ color: "var(--red)", fontSize: "20px" }}>
                upcoming
              </span>
              Blocks ที่กำลังจะมา ({upcoming.length})
            </div>
            {upcoming.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "var(--muted)", fontSize: "14px" }}>
                ไม่มี block ที่กำลังจะมา
              </div>
            ) : (
              <div style={{ display: "grid", gap: 0 }}>
                {upcoming.map((b, i) => {
                  const d = new Date(b.date);
                  // แสดงวันในโซน local
                  const dateLabel = d.toLocaleDateString("th-TH", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  });
                  return (
                    <div
                      key={b.id}
                      style={{
                        padding: "14px 20px",
                        borderTop: i === 0 ? "none" : "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          background: "var(--pink)",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span className="mi" style={{ color: "var(--red)", fontSize: "20px" }}>
                          {b.startTime ? "schedule" : "event_busy"}
                        </span>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "14px" }}>{dateLabel}</div>
                        <div style={{ color: "var(--ink2)", fontSize: "12.5px", marginTop: "2px" }}>
                          {b.startTime ? `เวลา ${b.startTime} น.` : "ปิดทั้งวัน"}
                          {b.reason && ` · ${b.reason}`}
                        </div>
                      </div>

                      {/* Remove */}
                      <form action={removeBlock}>
                        <input type="hidden" name="id" value={b.id} />
                        <button
                          type="submit"
                          title="ลบ block นี้"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            border: "1.5px solid var(--border)",
                            background: "#fff",
                            color: "var(--muted)",
                            cursor: "pointer",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          <span className="mi" style={{ fontSize: "18px" }}>delete</span>
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past blocks (collapsible) */}
          {past.length > 0 && (
            <details
              style={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: "18px",
                overflow: "hidden",
              }}
            >
              <summary
                style={{
                  padding: "16px 20px",
                  fontWeight: 800,
                  fontSize: "15px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  listStyle: "none",
                  color: "var(--ink2)",
                }}
              >
                <span className="mi" style={{ fontSize: "20px" }}>history</span>
                Blocks ที่ผ่านมา ({past.length})
                <span className="mi" style={{ marginLeft: "auto", fontSize: "20px" }}>
                  expand_more
                </span>
              </summary>
              {past.map((b, i) => {
                const d = new Date(b.date);
                const dateLabel = d.toLocaleDateString("th-TH", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                });
                return (
                  <div
                    key={b.id}
                    style={{
                      padding: "12px 20px",
                      borderTop: i === 0 ? "1px solid var(--border)" : "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      opacity: 0.65,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "13.5px" }}>{dateLabel}</div>
                      <div style={{ color: "var(--ink2)", fontSize: "12px" }}>
                        {b.startTime ? `เวลา ${b.startTime} น.` : "ปิดทั้งวัน"}
                        {b.reason && ` · ${b.reason}`}
                      </div>
                    </div>
                    <form action={removeBlock}>
                      <input type="hidden" name="id" value={b.id} />
                      <button
                        type="submit"
                        title="ลบ"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "7px",
                          border: "1px solid var(--border)",
                          background: "#fff",
                          color: "var(--muted)",
                          cursor: "pointer",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <span className="mi" style={{ fontSize: "16px" }}>delete</span>
                      </button>
                    </form>
                  </div>
                );
              })}
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
