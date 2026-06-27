# ===== เปิด CloudFront (รันหลัง AWS verify account แล้วเท่านั้น) =====
# จะสร้าง CloudFront distribution (private S3 + OAC + HTTPS) แล้วสลับ bucket
# จากโหมด public-website เป็น private ที่ให้เฉพาะ CloudFront อ่านได้
#
# วิธีใช้:  powershell -ExecutionPolicy Bypass -File D:\Project\Demo1\aws-deploy\enable-cloudfront.ps1
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [Text.Encoding]::UTF8   # ให้ console แสดงภาษาไทยถูก (PS5.1)
. "$PSScriptRoot/config.ps1"

Write-Host "==> 1. Create CloudFront distribution" -ForegroundColor Cyan
$out = aws cloudfront create-distribution --distribution-config "file://$PSScriptRoot/dist.json" --profile $AWS_PROFILE --output json 2>&1
$txt = ($out -join "`n")
if ($txt -notmatch '"ARN"') {
  Write-Host "FAILED:" -ForegroundColor Red
  Write-Host $txt
  Write-Host ""
  Write-Host "ถ้ายังเจอ 'account must be verified' = AWS ยังไม่ verify ให้ — รอแล้วลองใหม่" -ForegroundColor Yellow
  exit 1
}
$d = $txt | ConvertFrom-Json
$distId  = $d.Distribution.Id
$distArn = $d.Distribution.ARN
$distDom = $d.Distribution.DomainName
Write-Host "    DistId = $distId" -ForegroundColor Green
Write-Host "    Domain = $distDom" -ForegroundColor Green

Write-Host "==> 2. Swap bucket policy -> OAC-only (private)" -ForegroundColor Cyan
$policy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontOAC",
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET/*",
      "Condition": { "StringEquals": { "AWS:SourceArn": "$distArn" } }
    }
  ]
}
"@
$pf = "$PSScriptRoot/bucket-policy-oac.json"
$policy | Out-File -FilePath $pf -Encoding ascii
aws s3api put-bucket-policy --bucket $BUCKET --policy "file://$pf" --profile $AWS_PROFILE

Write-Host "==> 3. Re-block all public access (secure)" -ForegroundColor Cyan
aws s3api put-public-access-block --bucket $BUCKET --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" --profile $AWS_PROFILE

Write-Host ""
Write-Host "DONE." -ForegroundColor Green
Write-Host "ใส่ค่านี้ใน config.ps1 :  `$DISTRIBUTION_ID = `"$distId`"" -ForegroundColor Yellow
Write-Host "รอ ~5-10 นาทีให้ distribution = Deployed แล้วเปิด: https://$distDom" -ForegroundColor Yellow
