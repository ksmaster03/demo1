/**
 * /admin layout — role-gated admin shell
 * ต้องมี session.user.role = "coach" | "admin" เท่านั้น
 * ถ้าไม่ใช่ → redirect ไป /
 */
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Sidebar nav items — coach และ admin เห็นเหมือนกัน
// หน้า /admin/users แสดงเฉพาะ admin (guard อยู่ในหน้านั้น)
const NAV = [
  { href: "/admin", icon: "dashboard", label: "ภาพรวม" },
  { href: "/admin/bookings", icon: "event_note", label: "การจอง" },
  { href: "/admin/availability", icon: "block", label: "ปิด Slot" },
  { href: "/admin/students", icon: "groups", label: "ผู้เรียน" },
  { href: "/admin/users", icon: "manage_accounts", label: "ผู้ใช้ทั้งหมด" },
];

export const metadata = { robots: { index: false } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Guard: ต้องล็อกอินและเป็น coach หรือ admin
  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/admin");
  }
  if (session.user.role !== "coach" && session.user.role !== "admin") {
    redirect("/");
  }

  const name = session.user.name ?? session.user.email ?? "Admin";
  const role = session.user.role;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-soft)" }}>
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        style={{
          width: "230px",
          flexShrink: 0,
          background: "#fff",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "auto",
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: "var(--ink)",
            }}
          >
            <span
              className="mi"
              style={{ color: "var(--red)", fontSize: "26px" }}
            >
              weekend
            </span>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 800, fontSize: "14px" }}>CCW Admin</div>
              <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600 }}>
                {role === "admin" ? "ผู้ดูแลระบบ" : "โค้ช"}
              </div>
            </div>
          </a>
        </div>

        {/* Nav items */}
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "12px",
                textDecoration: "none",
                color: "var(--ink2)",
                fontWeight: 600,
                fontSize: "14.5px",
                marginBottom: "2px",
                transition: "background 0.15s, color 0.15s",
              }}
              // highlight handled client-side via CSS :hover — active state needs JS,
              // but for a server component we keep it simple
              onMouseEnter={undefined}
            >
              <span className="mi" style={{ fontSize: "20px", color: "var(--red)" }}>
                {n.icon}
              </span>
              {n.label}
            </a>
          ))}
        </nav>

        {/* User card at bottom */}
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--red), var(--red-l))",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: "14px",
              flexShrink: 0,
            }}
          >
            {name[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: "13px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--muted)" }}>
              {role}
            </div>
          </div>
          <a
            href="/"
            title="กลับหน้าหลัก"
            style={{ color: "var(--muted)", textDecoration: "none" }}
          >
            <span className="mi" style={{ fontSize: "20px" }}>home</span>
          </a>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}
