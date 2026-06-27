/**
 * /account — Protected page
 * Lists the signed-in user's bookings (upcoming + past)
 * Redirects to /signin if not authenticated
 */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "รอชำระเงิน", color: "#f59e0b" },
  confirmed: { label: "ยืนยันแล้ว", color: "#16a34a" },
  cancelled: { label: "ยกเลิก", color: "#9a9094" },
  completed: { label: "เรียนจบแล้ว", color: "#7c3aed" },
};

function statusBadge(status: string) {
  const s = STATUS_LABEL[status] ?? { label: status, color: "#9a9094" };
  return (
    <span
      style={{
        display: "inline-block",
        background: s.color + "22",
        color: s.color,
        fontWeight: 700,
        fontSize: "12px",
        padding: "3px 10px",
        borderRadius: "999px",
        border: `1px solid ${s.color}44`,
      }}
    >
      {s.label}
    </span>
  );
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/account");
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { startsAt: "desc" },
    include: { payment: true },
  });

  const now = new Date();
  const upcoming = bookings.filter((b) => new Date(b.startsAt) >= now);
  const past = bookings.filter((b) => new Date(b.startsAt) < now);

  function BookingCard({ b }: { b: typeof bookings[0] }) {
    const dt = new Date(b.startsAt);
    return (
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px 22px",
          display: "grid",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "17px" }}>
              {dt.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div style={{ color: "var(--ink2)", fontSize: "14px", marginTop: "2px" }}>
              เวลา {dt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น. · {b.durationMin} นาที
            </div>
          </div>
          {statusBadge(b.status)}
        </div>
        <div style={{ display: "flex", gap: "24px", fontSize: "13.5px", color: "var(--ink2)", marginTop: "4px" }}>
          <span><b style={{ color: "var(--red)" }}>฿{b.priceTHB.toLocaleString()}</b></span>
          {b.focusNote && <span>หัวข้อ: {b.focusNote}</span>}
          {b.payment && <span style={{ color: "var(--green)" }}>ชำระแล้ว</span>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-soft)" }}>
      {/* Simple header */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--red-d), var(--red))",
          color: "#fff",
          padding: "28px 0",
        }}
      >
        <div className="wrap">
          <a href="/" style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
            ← กลับหน้าหลัก
          </a>
          <h1 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, marginTop: "12px" }}>
            <span className="mi" style={{ verticalAlign: "middle", marginRight: "10px" }}>account_circle</span>
            บัญชีของฉัน
          </h1>
          <p style={{ opacity: 0.9, fontSize: "15px", marginTop: "6px" }}>
            {session.user.name ?? session.user.email}
          </p>
        </div>
      </div>

      <div className="wrap" style={{ padding: "40px 22px 80px" }}>
        {/* Upcoming bookings */}
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="mi" style={{ color: "var(--red)" }}>upcoming</span>
            การจองที่กำลังจะมาถึง
          </h2>
          {upcoming.length === 0 ? (
            <div
              style={{
                background: "var(--card)",
                border: "1.5px dashed var(--border)",
                borderRadius: "16px",
                padding: "40px",
                textAlign: "center",
                color: "var(--muted)",
              }}
            >
              <span className="mi" style={{ fontSize: 40, display: "block", marginBottom: "12px" }}>event_busy</span>
              ยังไม่มีการจอง · <a href="/#booking" style={{ color: "var(--red)", fontWeight: 700 }}>จองเรียนเลย</a>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {upcoming.map((b) => <BookingCard key={b.id} b={b} />)}
            </div>
          )}
        </section>

        {/* Past bookings */}
        {past.length > 0 && (
          <section>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="mi" style={{ color: "var(--ink2)" }}>history</span>
              ประวัติการเรียน
            </h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {past.map((b) => <BookingCard key={b.id} b={b} />)}
            </div>
          </section>
        )}

        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <a href="/#booking" className="btn btn-cta">
            <span className="mi">add_circle</span>
            จองคาบใหม่
          </a>
        </div>
      </div>
    </div>
  );
}
