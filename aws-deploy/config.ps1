# ===== Demo1 deploy config =====
# แก้ค่าตรงนี้ที่เดียว แล้ว script อื่นอ่านไปใช้
$AWS_PROFILE  = "demo1"
$AWS_REGION   = "ap-southeast-7"
$BUCKET       = "demo1-site-516778747444"
$SITE_DIR     = "D:/Project/Demo1/site"

# เว้นว่างไว้ตอนนี้ (ยังไม่มี CloudFront เพราะ account ใหม่ต้อง verify ก่อน)
# หลัง verify + รัน enable-cloudfront.ps1 แล้ว ให้ใส่ Distribution Id ที่นี่
$DISTRIBUTION_ID = ""

# URL ปัจจุบัน (S3 website endpoint — HTTP เท่านั้น, root ออก index.html อัตโนมัติ)
$WEBSITE_URL  = "http://$BUCKET.s3-website.$AWS_REGION.amazonaws.com"

# URL HTTPS บน AWS ตรงๆ ไม่ต้องมี CloudFront (S3 REST endpoint — ต้องลงท้าย /index.html)
$HTTPS_URL    = "https://$BUCKET.s3.$AWS_REGION.amazonaws.com/index.html"
