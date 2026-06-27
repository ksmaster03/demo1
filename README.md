# Demo1

เว็บ static หน้าเดียว สำหรับทดลอง deploy ขึ้น **AWS** (S3 + CloudFront)

## โครงสร้าง
```
site/                 เว็บ static (index.html)
aws-deploy/           สคริปต์ deploy + config (ดู aws-deploy/README.md)
```

## Live (AWS, region ap-southeast-7)
- HTTP  (S3 website) : http://demo1-site-516778747444.s3-website.ap-southeast-7.amazonaws.com
- HTTPS (S3 REST)    : https://demo1-site-516778747444.s3.ap-southeast-7.amazonaws.com/index.html
- HTTPS + CDN (CloudFront) : ⏳ รอ AWS verify account ใหม่ก่อน แล้วรัน `aws-deploy/enable-cloudfront.ps1`

## Deploy / redeploy
```powershell
powershell -ExecutionPolicy Bypass -File aws-deploy/deploy.ps1
```

> ⚠️ ไฟล์ AWS access key (`kosin_accessKeys.csv`) ถูกกันไว้ใน `.gitignore` ไม่ขึ้น repo
> รายละเอียดการ deploy ดูที่ [aws-deploy/README.md](aws-deploy/README.md)
