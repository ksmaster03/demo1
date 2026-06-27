# ===== Demo1 redeploy =====
# sync ไฟล์เว็บขึ้น S3 + (ถ้ามี CloudFront) invalidate cache
# วิธีใช้:  powershell -ExecutionPolicy Bypass -File D:\Project\Demo1\aws-deploy\deploy.ps1
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [Text.Encoding]::UTF8   # ให้ console แสดงภาษาไทยถูก (PS5.1)
. "$PSScriptRoot/config.ps1"

Write-Host "==> Sync $SITE_DIR -> s3://$BUCKET/" -ForegroundColor Cyan
# sync ทั้งโฟลเดอร์ (ลบไฟล์ที่ไม่มีแล้วออกด้วย --delete) ตั้ง cache สั้นๆ ให้ทดสอบง่าย
aws s3 sync "$SITE_DIR" "s3://$BUCKET/" --delete --cache-control "public, max-age=60" --profile $AWS_PROFILE

# บังคับ content-type ของ .html ให้ถูก (กัน sync เดาผิดเป็น binary)
aws s3 cp "s3://$BUCKET/" "s3://$BUCKET/" --recursive --exclude "*" --include "*.html" `
  --content-type "text/html; charset=utf-8" --cache-control "public, max-age=60" `
  --metadata-directive REPLACE --profile $AWS_PROFILE

if ($DISTRIBUTION_ID -ne "") {
  Write-Host "==> Invalidate CloudFront ($DISTRIBUTION_ID)" -ForegroundColor Cyan
  aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" --profile $AWS_PROFILE | Out-Null
  Write-Host "    invalidation submitted" -ForegroundColor Green
} else {
  Write-Host "==> (ยังไม่มี CloudFront — ข้าม invalidation)" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "DONE. URL: $WEBSITE_URL" -ForegroundColor Green
