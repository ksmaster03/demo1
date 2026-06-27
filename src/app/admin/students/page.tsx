/**
 * /admin/students — รายชื่อผู้เรียน
 * แสดง: name, email, # bookings, total spent, last session
 */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/admin/students");
  if (session.user.role !== "coach" && session.user.role !== "admin") redirect("/");

  // ดึง users ที่ role=student และมี bookings
  const students = await prisma.user.findMany({
    where: { role: "student" },
    include: {
      bookings: {
        include: { payment: { select: { amountTHB: true, status: true } } },
        orderBy: { startsAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // คำนวณ aggregates
  const studentData = students.map((u) => {
    const bookingCount = u.bookings.length;
    const totalSpent = u.bookings.reduce(
      (sum, b) => sum + (b.payment?.status === "paid" ? (b.payment.amountTHB ?? 0) : 0),
      0
    );
    const lastSession = u.bookings[0]?.startsAt ?? null; // เรียง desc อยู่แล้ว
    const confirmedCount = u.bookings.filter(
      (b) => b.status === "confirmed" || b.status === "completed"
    ).length;
    return { ...u, bookingCount, totalSpent, lastSession, confirmedCount };
  });

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
            groups
          </span>
          ผู้เรียน
        </h1>
        <p style={{ color: "var(--ink2)", fontSize: "14px", marginTop: "4px" }}>
          {studentData.length} คน
        </p>
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
                {["ผู้เรียน", "จำนวน Booking", "Booking ยืนยัน", "ยอดที่จ่าย", "เรียนครั้งล่าสุด", "สมัครเมื่อ"].map(
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
              {studentData.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: "48px", textAlign: "center", color: "var(--muted)" }}
                  >
                    <span className="mi" style={{ fontSize: 36, display: "block", marginBottom: 10 }}>
                      person_off
                    </span>
                    ยังไม่มีผู้เรียน
                  </td>
                </tr>
              )}
              {studentData.map((s, i) => (
                <tr
                  key={s.id}
                  style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
                >
                  {/* ผู้เรียน */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "var(--pink)",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                          fontWeight: 800,
                          fontSize: "15px",
                          color: "var(--red)",
                        }}
                      >
                        {(s.name ?? s.email ?? "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{s.name ?? "—"}</div>
                        <div style={{ color: "var(--muted)", fontSize: "12px" }}>{s.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* จำนวน booking */}
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <span
                      style={{
                        background: "var(--pink)",
                        color: "var(--red)",
                        fontWeight: 800,
                        fontSize: "14px",
                        padding: "4px 10px",
                        borderRadius: "8px",
                      }}
                    >
                      {s.bookingCount}
                    </span>
                  </td>

                  {/* ยืนยัน */}
                  <td style={{ padding: "14px 16px", textAlign: "center", color: "var(--green)", fontWeight: 700 }}>
                    {s.confirmedCount}
                  </td>

                  {/* ยอด */}
                  <td style={{ padding: "14px 16px", fontWeight: 800, color: "var(--red)" }}>
                    {s.totalSpent > 0 ? `฿${s.totalSpent.toLocaleString()}` : "—"}
                  </td>

                  {/* เรียนล่าสุด */}
                  <td style={{ padding: "14px 16px", color: "var(--ink2)", fontSize: "13.5px" }}>
                    {s.lastSession
                      ? new Date(s.lastSession).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>

                  {/* สมัครเมื่อ */}
                  <td style={{ padding: "14px 16px", color: "var(--muted)", fontSize: "12.5px" }}>
                    {new Date(s.createdAt).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
