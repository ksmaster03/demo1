/**
 * /admin/bookings — ตารางการจองทั้งหมด
 * Server actions: markCompleted, cancelBooking
 * Filter by status + upcoming
 */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// ── Server Actions ──────────────────────────────────────────────────────────

async function markCompleted(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || !["coach", "admin"].includes(session.user.role)) return;

  const id = formData.get("id") as string;
  await prisma.booking.update({
    where: { id },
    data: { status: "completed" },
  });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

async function cancelBooking(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || !["coach", "admin"].includes(session.user.role)) return;

  const id = formData.get("id") as string;
  await prisma.booking.update({
    where: { id },
    data: { status: "cancelled" },
  });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

// ── Types ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "รอชำระ", color: "#f59e0b" },
  confirmed: { label: "ยืนยันแล้ว", color: "#16a34a" },
  cancelled: { label: "ยกเลิก", color: "#9a9094" },
  completed: { label: "เรียนจบ", color: "#7c3aed" },
};

function badge(status: string) {
  const s = STATUS_LABEL[status] ?? { label: status, color: "#9a9094" };
  return (
    <span
      style={{
        display: "inline-block",
        background: s.color + "22",
        color: s.color,
        fontWeight: 700,
        fontSize: "11px",
        padding: "2px 9px",
        borderRadius: "999px",
        border: `1px solid ${s.color}44`,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; upcoming?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/admin/bookings");
  if (session.user.role !== "coach" && session.user.role !== "admin") redirect("/");

  const params = await searchParams;
  const filterStatus = params.status ?? "all";
  const upcomingOnly = params.upcoming === "1";

  const now = new Date();

  const bookings = await prisma.booking.findMany({
    where: {
      ...(filterStatus !== "all" ? { status: filterStatus } : {}),
      ...(upcomingOnly ? { startsAt: { gte: now } } : {}),
    },
    orderBy: { startsAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      payment: { select: { status: true, amountTHB: true } },
    },
  });

  const statuses = ["all", "pending_payment", "confirmed", "completed", "cancelled"];

  return (
    <div style={{ padding: "32px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
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
            event_note
          </span>
          การจองทั้งหมด
        </h1>
        <p style={{ color: "var(--ink2)", fontSize: "14px", marginTop: "4px" }}>
          {bookings.length} รายการ
        </p>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        {/* Status filter tabs */}
        {statuses.map((s) => {
          const labels: Record<string, string> = {
            all: "ทั้งหมด",
            pending_payment: "รอชำระ",
            confirmed: "ยืนยันแล้ว",
            completed: "เรียนจบ",
            cancelled: "ยกเลิก",
          };
          const active = filterStatus === s;
          return (
            <a
              key={s}
              href={`/admin/bookings?status=${s}${upcomingOnly ? "&upcoming=1" : ""}`}
              style={{
                padding: "7px 15px",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "13.5px",
                textDecoration: "none",
                background: active ? "var(--red)" : "#fff",
                color: active ? "#fff" : "var(--ink2)",
                border: `1.5px solid ${active ? "var(--red)" : "var(--border)"}`,
                transition: "all 0.15s",
              }}
            >
              {labels[s] ?? s}
            </a>
          );
        })}

        {/* Upcoming toggle */}
        <a
          href={`/admin/bookings?status=${filterStatus}${upcomingOnly ? "" : "&upcoming=1"}`}
          style={{
            marginLeft: "auto",
            padding: "7px 15px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "13.5px",
            textDecoration: "none",
            background: upcomingOnly ? "#7c3aed" : "#fff",
            color: upcomingOnly ? "#fff" : "var(--ink2)",
            border: `1.5px solid ${upcomingOnly ? "#7c3aed" : "var(--border)"}`,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span className="mi" style={{ fontSize: "17px" }}>event_upcoming</span>
          ที่กำลังจะมา
        </a>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: "18px",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "var(--bg-soft)" }}>
                {["ผู้เรียน", "วัน-เวลา", "ระยะเวลา", "สถานะ", "ราคา", "ชำระ", "หัวข้อ", "จัดการ"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 700,
                        color: "var(--ink2)",
                        fontSize: "12.5px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ padding: "48px", textAlign: "center", color: "var(--muted)" }}
                  >
                    <span className="mi" style={{ fontSize: 36, display: "block", marginBottom: 10 }}>
                      event_busy
                    </span>
                    ไม่มีการจอง
                  </td>
                </tr>
              )}
              {bookings.map((b, i) => {
                const dt = new Date(b.startsAt);
                const isActive = b.status === "confirmed" || b.status === "pending_payment";
                return (
                  <tr
                    key={b.id}
                    style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
                  >
                    {/* ผู้เรียน */}
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontWeight: 700 }}>{b.user.name ?? "—"}</div>
                      <div style={{ color: "var(--muted)", fontSize: "12px" }}>{b.user.email}</div>
                    </td>

                    {/* วัน-เวลา */}
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 600 }}>
                        {dt.toLocaleDateString("th-TH", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div style={{ color: "var(--ink2)", fontSize: "12px" }}>
                        {dt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                      </div>
                    </td>

                    {/* ระยะเวลา */}
                    <td style={{ padding: "13px 16px", color: "var(--ink2)" }}>
                      {b.durationMin} นาที
                    </td>

                    {/* สถานะ */}
                    <td style={{ padding: "13px 16px" }}>{badge(b.status)}</td>

                    {/* ราคา */}
                    <td
                      style={{
                        padding: "13px 16px",
                        fontWeight: 800,
                        color: "var(--red)",
                      }}
                    >
                      ฿{b.priceTHB.toLocaleString()}
                    </td>

                    {/* ชำระ */}
                    <td style={{ padding: "13px 16px" }}>
                      {b.payment?.status === "paid" ? (
                        <span
                          className="mi"
                          style={{ color: "var(--green)", fontSize: "20px" }}
                        >
                          check_circle
                        </span>
                      ) : (
                        <span
                          className="mi"
                          style={{ color: "var(--muted)", fontSize: "20px" }}
                        >
                          radio_button_unchecked
                        </span>
                      )}
                    </td>

                    {/* หัวข้อ */}
                    <td
                      style={{
                        padding: "13px 16px",
                        color: "var(--ink2)",
                        fontSize: "13px",
                        maxWidth: "160px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={b.focusNote ?? ""}
                    >
                      {b.focusNote ?? "—"}
                    </td>

                    {/* จัดการ */}
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "nowrap" }}>
                        {/* Mark completed */}
                        {isActive && (
                          <form action={markCompleted}>
                            <input type="hidden" name="id" value={b.id} />
                            <button
                              type="submit"
                              style={{
                                padding: "6px 11px",
                                borderRadius: "9px",
                                border: "1.5px solid #7c3aed44",
                                background: "#7c3aed18",
                                color: "#7c3aed",
                                fontWeight: 700,
                                fontSize: "12px",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <span className="mi" style={{ fontSize: "15px" }}>
                                task_alt
                              </span>
                              จบแล้ว
                            </button>
                          </form>
                        )}

                        {/* Cancel */}
                        {isActive && (
                          <form action={cancelBooking}>
                            <input type="hidden" name="id" value={b.id} />
                            <button
                              type="submit"
                              style={{
                                padding: "6px 11px",
                                borderRadius: "9px",
                                border: "1.5px solid #15a34a44",
                                background: "var(--pink)",
                                color: "var(--red)",
                                fontWeight: 700,
                                fontSize: "12px",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <span className="mi" style={{ fontSize: "15px" }}>
                                cancel
                              </span>
                              ยกเลิก
                            </button>
                          </form>
                        )}

                        {/* No actions for terminal statuses */}
                        {!isActive && (
                          <span style={{ color: "var(--muted)", fontSize: "13px" }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
