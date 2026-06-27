import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Claude Code Weekend · เรียน Claude Code ตัวต่อตัว เสาร์-อาทิตย์ | ฿1,000/ชม.",
  description:
    "คอร์สสด 1:1 สอนใช้ Claude Code ทำงานจริง เฉพาะเสาร์-อาทิตย์ ฿1,000/ชั่วโมง จองออนไลน์ ชำระผ่าน Stripe เข้าสู่ระบบด้วย Google หรือ LINE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        {/* No-FOUC: set data-theme before first paint from localStorage or prefers-color-scheme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ccw_theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
