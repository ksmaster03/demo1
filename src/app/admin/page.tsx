/**
 * /admin — Dashboard KPIs
 * แสดง: upcoming sessions, weekend bookings, total revenue, distinct students,
 * recent bookings list
 */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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

/** วันเสาร์-อาทิตย์ของสัปดาห์ปัจจุบัน */
function thisWeekend(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 6=Sat
  // หา Saturday ของสัปดาห์นี้
  const daysToSat = (6 - day + 7) % 7;
  const sat = new Date(now);
  sat.setDate(now.getDate() + (day === 0 ? -1 : daysToSat));
  sat.setHours(0, 0, 0, 0);
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 2); // จนถึงวันจันทร์ 00:00 (exclusive)
  return { start: sat, end: sun };
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/admin");
  if (session.user.role !== "coach" && session.user.role !== "admin") redirect("/");

  const now = new Date();
  const { start: wkStart, end: wkEnd } = thisWeekend();

  // KPI queries — เรียกแบบ parallel
  const [
    upcomingCount,
    weekendBookings,
    paidPayments,
    distinctStudents,
    recentBookings,
  ] = await Promise.all([
    // 1. upcoming sessions (confirmed + pending, startsAt >= now)
    prisma.booking.count({
      where: {
        startsAt: { gte: now },
        status: { in: ["confirmed", "pending_payment"] },
      },
    }),

    // 2. this weekend bookings
    prisma.booking.count({
      where: {
        startsAt: { gte: wkStart, lt: wkEnd },
        status: { not: "cancelled" },
      },
    }),

    // 3. total revenue — sum of paid payments
    prisma.payment.aggregate({
      _sum: { amountTHB: true },
      where: { status: "paid" },
    }),

    // 4. distinct students (users with at least 1 booking)
    prisma.booking.findMany({
      distinct: ["userId"],
      select: { userId: true },
    }),

    // 5. recent bookings (last 10) with user info
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        payment: { select: { status: true } },
      },
    }),
  ]);

  const totalRevenue = paidPayments._sum.amountTHB ?? 0;

  const kpis = [
    {
      icon: "event_upcoming",
      label: "คิวที่กำลังจะมา",
      value: upcomingCount.toString(),
      sub: "session ยืนยันแล้ว / รอชำระ",
      color: "var(--red)",
    },
    {
      icon: "weekend",
      label: "วีคเอนด์นี้",
      value: weekendBookings.toString(),
      sub: "การจองสัปดาห์นี้",
      color: "#7c3aed",
    },
    {
      icon: "payments",
      label: "รายรับรวม",
      value: `฿${totalRevenue.toLocaleString()}`,
      sub: "จาก payment ที่ paid แล้ว",
      color: "#16a34a",
    },
    {
      icon: "groups",
      label: "ผู้เรียนทั้งหมด",
      value: distinctStudents.length.toString(),
      sub: "unique students",
      color: "#0ea5e9",
    },
  ];

  return (
    <div style={{ padding: "32px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "clamp(22px,3vw,30px)",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span className="mi" style={{ color: "var(--red)", fontSize: "30px" }}>
            dashboard
          </span>
          ภาพรวม
        </h1>
        <p style={{ color: "var(--ink2)", fontSize: "14px", marginTop: "4px" }}>
          Claude Code Weekend — ระบบจัดการโค้ช
        </p>
      </div>

      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
          gap: "16px",
          marginBottom: "36px",
        }}
      >
        {kpis.map((k) => (
          <div
            key={k.label}
            style={{
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: "18px",
              padding: "22px 20px",
              boxShadow: "var(--shadow)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: k.color + "18",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <span className="mi" style={{ color: k.color, fontSize: "22px" }}>
                  {k.icon}
                </span>
              </div>
              <span style={{ color: "var(--ink2)", fontSize: "13px", fontWeight: 600 }}>
                {k.label}
              </span>
            </div>
            <div style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: 800 }}>{k.value}</div>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: "18px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ fontSize: "17px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="mi" style={{ color: "var(--red)", fontSize: "20px" }}>history</span>
            การจองล่าสุด
          </h2>
          <a
            href="/admin/bookings"
            style={{ color: "var(--red)", fontWeight: 700, fontSize: "13.5px", textDecoration: "none" }}
          >
            ดูทั้งหมด →
          </a>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "var(--bg-soft)" }}>
                {["ผู้เรียน", "วัน-เวลา", "สถานะ", "ราคา", "ชำระแล้ว"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 16px",
                      textAlign: "left",
                      fontWeight: 700,
                      color: "var(--ink2)",
                      fontSize: "12.5px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{ padding: "32px", textAlign: "center", color: "var(--muted)" }}
                  >
                    ยังไม่มีการจอง
                  </td>
                </tr>
              )}
              {recentBookings.map((b, i) => {
                const dt = new Date(b.startsAt);
                return (
                  <tr
                    key={b.id}
                    style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 700 }}>{b.user.name ?? "—"}</div>
                      <div style={{ color: "var(--muted)", fontSize: "12px" }}>{b.user.email}</div>
                    </td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 600 }}>
                        {dt.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      <div style={{ color: "var(--ink2)", fontSize: "12px" }}>
                        {dt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>{badge(b.status)}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--red)" }}>
                      ฿{b.priceTHB.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {b.payment?.status === "paid" ? (
                        <span className="mi" style={{ color: "var(--green)", fontSize: "20px" }}>
                          check_circle
                        </span>
                      ) : (
                        <span className="mi" style={{ color: "var(--muted)", fontSize: "20px" }}>
                          radio_button_unchecked
                        </span>
                      )}
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
