/**
 * proxy.ts — Next.js middleware (Next 16 renamed middleware.ts → proxy.ts)
 * Guards /admin/* — ต้องมี Auth.js session + role coach|admin
 * ใช้ auth() เป็น middleware wrapper (Auth.js v5 pattern)
 */
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

export default auth((req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;

  // ── Guard /admin/* ────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // ถ้าไม่มี session → redirect ไป signin
    if (!req.auth) {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // role check — ต้องเป็น coach หรือ admin เท่านั้น
    const role = req.auth.user?.role as string | undefined;
    if (role !== "coach" && role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
