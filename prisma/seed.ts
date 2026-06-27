/**
 * Seed ข้อมูลตัวอย่าง Claude Code Weekend
 * รัน: pnpm db:seed
 *
 * สิ่งที่ seed ทำ:
 * 1. ถ้ามี ADMIN_EMAIL ใน .env → upsert user นั้นให้มี role=admin
 *    (ใช้ก่อน sign in ครั้งแรกไม่ได้ — Auth.js สร้าง user ตอน sign in
 *     แต่ถ้า sign in แล้ว → รัน seed อีกครั้งเพื่อ set role=admin ได้เลย)
 * 2. แสดง next steps
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Claude Code Weekend database...");

  const adminEmail = process.env.ADMIN_EMAIL;

  if (adminEmail) {
    // ถ้า user นั้นมีอยู่แล้ว (เคย sign in) → set role=admin
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: "admin" },
      });
      console.log(`✓ Set role=admin for ${adminEmail}`);
    } else {
      console.log(
        `ℹ️  ADMIN_EMAIL=${adminEmail} ยังไม่มีในระบบ (ยังไม่ได้ sign in)\n` +
          `   → Sign in ด้วย Google หรือ LINE ก่อน แล้วรัน pnpm db:seed อีกครั้ง`
      );
    }
  } else {
    console.log("ℹ️  ไม่มี ADMIN_EMAIL ใน .env — ข้าม auto-role");
  }

  console.log("\nSeed complete!");
  console.log("Next steps:");
  console.log("  1. ตั้งค่า ADMIN_EMAIL=your@email.com ใน .env");
  console.log("  2. Sign in ด้วย Google หรือ LINE ที่ /signin");
  console.log("  3. รัน pnpm db:seed → role=admin จะถูก set ให้อัตโนมัติ");
  console.log("  4. เข้าหน้า /admin ได้เลย");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
