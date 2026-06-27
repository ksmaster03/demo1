"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function NavBar() {
  const { data: session } = useSession();

  // Initialize from the attribute already set by the no-FOUC script (avoids hydration mismatch)
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Read the theme the inline script applied before React hydrated
    const current =
      (document.documentElement.getAttribute("data-theme") as "light" | "dark") ?? "light";
    setTheme(current);
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("ccw_theme", next);
    } catch {
      // localStorage unavailable (private browsing, etc.) — silently ignore
    }
    setTheme(next);
  }

  return (
    <nav>
      <div className="wrap nav-in">
        {/* ── GrowGenius-style logo lockup ── */}
        <a className="brand" href="/">
          {/* Gradient tile: brain logo recolored white on green→cyan gradient */}
          <div className="brand-mark">
            <Image
              src="/assets/logo.png"
              alt=""
              width={24}
              height={24}
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
          <span className="bt">
            Claude Code{" "}
            <span className="brand-accent">Weekend</span>
            <small>เรียนตัวต่อตัว · เสาร์-อาทิตย์</small>
          </span>
        </a>

        <div className="nav-links">
          <a className="lnk" href="#learn">เนื้อหา</a>
          <a className="lnk" href="#how">ขั้นตอน</a>
          <a className="lnk" href="#pricing">ราคา</a>
          <a className="lnk" href="#reviews">รีวิว</a>

          {/* TH/EN language toggle */}
          <div className="lang" id="lang">
            <button data-l="th" className="on">TH</button>
            <button data-l="en">EN</button>
          </div>

          {/* Dark/light theme toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "เปลี่ยนเป็นธีมมืด" : "เปลี่ยนเป็นธีมสว่าง"}
          >
            <span className="mi">{theme === "light" ? "dark_mode" : "light_mode"}</span>
          </button>

          {session ? (
            <>
              <a className="lnk" href="/account" style={{ color: "var(--red)", fontWeight: 700 }}>
                <span className="mi" style={{ fontSize: 18, marginRight: 4 }}>account_circle</span>
                {session.user?.name?.split(" ")[0] ?? "บัญชีของฉัน"}
              </a>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <a className="btn btn-cta btn-sm" href="#booking">จองเรียน</a>
          )}
        </div>
      </div>
    </nav>
  );
}
