/**
 * /admin/users — รายชื่อผู้ใช้ทั้งหมด (admin เท่านั้น)
 * Server action: changeRole → เปลี่ยน student↔coach↔admin
 */
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// ── Server Action ───────────────────────────────────────────────────────────

async function changeRole(formData: FormData) {
  "use server";
  const session = await auth();
  // admin เท่านั้น
  if (!session?.user || session.user.role !== "admin") return;

  const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as string;

  // ป้องกัน admin เปลี่ยน role ตัวเอง (ต้องทำผ่าน DB โดยตรง)
  if (userId === session.user.id) return;

  const allowed = ["student", "coach", "admin"];
  if (!allowed.includes(newRole)) return;

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });
  revalidatePath("/admin/users");
}

// ── Role badge ──────────────────────────────────────────────────────────────

const ROLE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  admin: { bg: "#7c3aed18", color: "#7c3aed", label: "Admin" },
  coach: { bg: "var(--pink)", color: "var(--red)", label: "Coach" },
  student: { bg: "#0ea5e918", color: "#0ea5e9", label: "Student" },
};

function roleBadge(role: string) {
  const s = ROLE_STYLE[role] ?? { bg: "#f3f4f6", color: "#6b7280", label: role };
  return (
    <span
      style={{
        display: "inline-block",
        background: s.bg,
        color: s.color,
        fontWeight: 700,
        fontSize: "11.5px",
        padding: "3px 10px",
        borderRadius: "999px",
        border: `1px solid ${s.color}33`,
      }}
    >
      {s.label}
    </span>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/admin/users");
  // หน้านี้เฉพาะ admin
  if (session.user.role !== "admin") redirect("/admin");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookings: true } },
    },
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
            manage_accounts
          </span>
          ผู้ใช้ทั้งหมด
        </h1>
        <p style={{ color: "var(--ink2)", fontSize: "14px", marginTop: "4px" }}>
          {users.length} บัญชี · เปลี่ยน role ได้เฉพาะ admin
        </p>
      </div>

      {/* Admin note */}
      <div
        style={{
          background: "#7c3aed10",
          border: "1px solid #7c3aed33",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "13.5px",
          color: "#7c3aed",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        <span className="mi" style={{ fontSize: "20px" }}>admin_panel_settings</span>
        คุณกำลังใช้งานในฐานะ Admin — การเปลี่ยน role มีผลทันที (ยกเว้นบัญชีของตัวเอง)
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
                {["ผู้ใช้", "Role ปัจจุบัน", "Bookings", "สมัครเมื่อ", "เปลี่ยน Role"].map((h) => (
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
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const isSelf = u.id === session.user.id;
                return (
                  <tr
                    key={u.id}
                    style={{
                      borderTop: i === 0 ? "none" : "1px solid var(--border)",
                      background: isSelf ? "var(--bg-soft)" : undefined,
                    }}
                  >
                    {/* ผู้ใช้ */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background:
                              u.role === "admin"
                                ? "#7c3aed22"
                                : u.role === "coach"
                                ? "var(--pink)"
                                : "#0ea5e918",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            fontWeight: 800,
                            fontSize: "15px",
                            color:
                              u.role === "admin"
                                ? "#7c3aed"
                                : u.role === "coach"
                                ? "var(--red)"
                                : "#0ea5e9",
                          }}
                        >
                          {(u.name ?? u.email ?? "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>
                            {u.name ?? "—"}
                            {isSelf && (
                              <span
                                style={{
                                  marginLeft: "6px",
                                  fontSize: "11px",
                                  color: "var(--muted)",
                                  fontWeight: 600,
                                }}
                              >
                                (คุณ)
                              </span>
                            )}
                          </div>
                          <div style={{ color: "var(--muted)", fontSize: "12px" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: "14px 16px" }}>{roleBadge(u.role)}</td>

                    {/* Bookings count */}
                    <td
                      style={{
                        padding: "14px 16px",
                        textAlign: "center",
                        fontWeight: 700,
                        color: u._count.bookings > 0 ? "var(--red)" : "var(--muted)",
                      }}
                    >
                      {u._count.bookings}
                    </td>

                    {/* สมัครเมื่อ */}
                    <td style={{ padding: "14px 16px", color: "var(--ink2)", fontSize: "13px" }}>
                      {new Date(u.createdAt).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* เปลี่ยน role */}
                    <td style={{ padding: "14px 16px" }}>
                      {isSelf ? (
                        <span style={{ color: "var(--muted)", fontSize: "13px" }}>
                          — (ตัวเอง)
                        </span>
                      ) : (
                        <form action={changeRole} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <input type="hidden" name="userId" value={u.id} />
                          <select
                            name="role"
                            defaultValue={u.role}
                            style={{
                              border: "1.5px solid var(--border)",
                              borderRadius: "9px",
                              padding: "7px 10px",
                              fontFamily: "inherit",
                              fontSize: "13.5px",
                              color: "var(--ink)",
                              background: "#fff",
                              cursor: "pointer",
                            }}
                          >
                            <option value="student">student</option>
                            <option value="coach">coach</option>
                            <option value="admin">admin</option>
                          </select>
                          <button
                            type="submit"
                            style={{
                              padding: "7px 13px",
                              borderRadius: "9px",
                              border: "1.5px solid var(--border)",
                              background: "#fff",
                              color: "var(--ink2)",
                              fontWeight: 700,
                              fontSize: "13px",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span className="mi" style={{ fontSize: "16px" }}>save</span>
                            บันทึก
                          </button>
                        </form>
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
