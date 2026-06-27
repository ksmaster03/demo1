# Demo1 — AWS deploy (static site)

เว็บ static หน้าเดียวสำหรับทดสอบ deploy ขึ้น AWS

| รายการ | ค่า |
|---|---|
| AWS account | `516778747444` (IAM user `kosin`, AdministratorAccess) |
| AWS CLI profile | `demo1` |
| Region | `ap-southeast-7` (กรุงเทพฯ) |
| S3 bucket | `demo1-site-516778747444` |
| ไฟล์เว็บ | `../site/` |

## สถานะตอนนี้ — โหมด S3 Website (ชั่วคราว)

🟢 LIVE: **http://demo1-site-516778747444.s3-website.ap-southeast-7.amazonaws.com**

- เป็น HTTP เท่านั้น (S3 website endpoint ไม่มี HTTPS)
- bucket เปิด public-read ชั่วคราว เพราะ **CloudFront ถูกบล็อก** (account ใหม่)

## เป้าหมาย — S3 + CloudFront (HTTPS) ⏳ รอ verify

AWS บล็อกการสร้าง CloudFront บน account ใหม่:
> *Your account must be verified before you can add new CloudFront resources.*

**สิ่งที่ต้องทำ:** เปิด AWS Support case (Basic ฟรีก็ได้) ขอ verify account สำหรับ CloudFront
→ Console → Support → Create case → Account and billing → ระบุว่าต้องการสร้าง CloudFront distribution

หลัง AWS verify แล้ว รัน:
```powershell
powershell -ExecutionPolicy Bypass -File enable-cloudfront.ps1
```
script จะ: สร้าง distribution (private S3 + OAC + HTTPS) → สลับ bucket เป็น private → re-block public access
แล้วเอา `DISTRIBUTION_ID` ที่ได้ไปใส่ใน `config.ps1`

## คำสั่งที่ใช้บ่อย

```powershell
# redeploy (แก้ไฟล์ใน ../site/ แล้วรัน) — sync + invalidate (ถ้ามี CloudFront)
powershell -ExecutionPolicy Bypass -File deploy.ps1
```

## ไฟล์ในโฟลเดอร์นี้
- `config.ps1` — ตัวแปรกลาง (แก้ที่เดียว)
- `deploy.ps1` — redeploy: sync ไฟล์ + invalidate cache
- `enable-cloudfront.ps1` — เปิด CloudFront (รันหลัง verify)
- `dist.json` — CloudFront distribution config (พร้อม OAC แล้ว)
- `oac.json` — Origin Access Control config
- `bucket-policy-website.json` — policy public-read (โหมดชั่วคราวตอนนี้)
- `bucket-policy-oac.json` — policy OAC (สร้างอัตโนมัติตอนรัน enable-cloudfront)

## ลบทิ้งทั้งหมด (teardown)
```powershell
aws cloudfront ... (disable + delete distribution ถ้ามี)
aws s3 rb s3://demo1-site-516778747444 --force --profile demo1
```
