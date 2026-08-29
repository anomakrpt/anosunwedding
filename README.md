# Ausamah & Mizahasan — Wedding Invitation

เว็บการ์ดเชิญงานแต่งงาน (static site) — 16-17 มกราคม 2027, ดอยหลวงเชียงดาว

## โครงสร้างโปรเจกต์

```
├── index.html          หน้าแรก (intro video, เรื่องราว, countdown, กำหนดการ, dress code, แกลเลอรี, ติดต่อ)
├── photos.html         แกลเลอรีภาพ + ลิงก์ Google Drive
├── wishes.html         ส่งคำอวยพร + ต้นไม้คำอวยพร (มีโหมดเต็มจอสำหรับฉายในงาน)
├── rsvp.html           แบบตอบรับ + การ์ดยืนยัน
├── assets/
│   ├── css/
│   │   ├── base.css        design tokens + reset + header (ใช้ร่วมทุกหน้า)
│   │   ├── components.css  bottom navigation + scroll-reveal (แก้ที่เดียว)
│   │   └── home/photos/wishes/rsvp.css   สไตล์เฉพาะหน้า
│   └── js/
│       ├── config.js       ค่าที่แก้บ่อย: เพลง, วันงาน, Apps Script URL
│       ├── main.js         scroll-reveal (ทุกหน้า)
│       ├── music.js        เพลงพื้นหลัง YouTube (หน้าแรก)
│       ├── home.js         intro, countdown แบบป้ายสนามบิน, พลุวันงาน, ปุ่มแผนที่
│       ├── wishes.js       ฟอร์มคำอวยพร + ต้นไม้ + โหมดเต็มจอ
│       ├── gallery.js      สไลด์ภาพ
│       └── rsvp.js         แบบตอบรับ + การ์ดยืนยัน PNG + .ics
├── pic/                รูปภาพ (บีบอัดแล้ว; ต้นฉบับเก็บนอก repo ที่ ../originals/)
├── favicon.ico / favicon-32.png / apple-touch-icon.png
│                       สร้างจากโมโนแกรมบนการ์ด (pic/logo.png) วางบนพื้นครีม
└── apps-script/Code.gs สำเนาอ้างอิงโค้ด backend (ดูหัวข้อ Deploy ด้านล่าง)
```

## ฟีเจอร์ที่ควรรู้

- **Countdown**: ตัวเลขพลิกแบบป้ายบอกเวลาสนามบิน เมื่อถึงวันงานจะเป็น 00:00:00:00
  เปลี่ยนหัวข้อเป็น "Today Is The Day" แล้วจุดพลุอัตโนมัติ
- **ต้นไม้คำอวยพร** (wishes.html): คำอวยพร 1 ข้อ = หัวใจ 1 ดวงบนกิ่ง ยิ่งมีคนอวยพร
  ต้นไม้ยิ่งเต็ม แตะหัวใจเพื่ออ่านคำอวยพรของคนนั้น
- **โหมดเต็มจอ**: ปุ่ม "เต็มจอ" มุมบนขวาของต้นไม้ ใช้ฉายบนจอในวันงาน
  ระหว่างเต็มจอจะดึงคำอวยพรใหม่ทุก 45 วินาทีอัตโนมัติ
  (รองรับทั้ง Fullscreen API และโหมดจำลองสำหรับ iOS Safari ที่ไม่รองรับ API นี้)

## แก้ค่าที่ใช้บ่อย

ทุกอย่างอยู่ใน `assets/js/config.js`:
- `VIDEO_ID` / `START_SECONDS` — เพลงพื้นหลัง (YouTube)
- `WEDDING_DATE` — วันเวลางาน (countdown)
- `APPS_SCRIPT_URL` — endpoint ของ Google Apps Script

เมื่อแก้ CSS/JS แล้ว ให้เปลี่ยนเลขเวอร์ชัน `?v=YYYYMMDD-N` ใน HTML ทุกหน้า
ให้ตรงกันทุกไฟล์ เพื่อบังคับ browser โหลดไฟล์ใหม่

## รันทดสอบในเครื่อง

```
python3 -m http.server 8765
```
แล้วเปิด http://localhost:8765

## เพิ่มรูปในแกลเลอรี

1. บีบอัดรูปก่อน (กว้างสุด ~1800px): `sips -Z 1800 -s format jpeg -s formatOptions 78 IN.jpg --out pic/photo/photo-12.jpg`
2. สร้าง thumbnail: `sips -Z 300 -s format jpeg -s formatOptions 70 pic/photo/photo-12.jpg --out pic/photo/thumb/photo-12.jpg`
3. เพิ่ม path ใน array `photos` ที่ `assets/js/gallery.js`

**ห้าม commit รูปต้นฉบับจากกล้อง (15-25MB) ลง repo** — ทำให้ repo บวมถาวร

## Deploy Apps Script (ระบบ RSVP)

หน้า RSVP ส่งข้อมูลไป endpoint เดียวกับระบบคำอวยพร โดยแนบ `type: "rsvp"`
ต้องเพิ่ม handler ฝั่ง Apps Script ก่อนระบบจึงจะทำงาน:

1. เปิด script.google.com → โปรเจกต์เดิมที่ผูกกับ Google Sheet คำอวยพร
2. เพิ่มโค้ดจาก `apps-script/Code.gs` ในส่วน RSVP:
   - ฟังก์ชัน `handleRsvp_` และ `RSVP_SHEET_NAME` ทั้งก้อน
   - ใน `doPost` เดิม เพิ่มเช็ค `if (data.type === "rsvp") return handleRsvp_(data);` ไว้บนสุดก่อน logic เดิม
3. Deploy → Manage deployments → แก้ deployment เดิม → New version → Deploy
   (ห้ามสร้าง deployment ใหม่ — URL จะเปลี่ยนแล้วเว็บจะพัง)
4. ชีทชื่อ `RSVP` จะถูกสร้างอัตโนมัติเมื่อมีคนตอบรับครั้งแรก
   คอลัมน์: Timestamp | Fullname | Attending | Guests | Side

## สถานะ Backend

**RSVP ใช้งานได้จริงแล้ว** — deploy Version 3 เมื่อ 30 ส.ค. 2026 บน deployment
"Wishes" เดิม (Deployment ID ไม่เปลี่ยน เว็บจึงไม่ต้องแก้ config)
ทดสอบแล้วบันทึกลงชีท `RSVP` ได้ และระบบคำอวยพรเดิมไม่กระทบ

หมายเหตุ: ในโปรเจกต์ Apps Script มี deployment ชื่อ "add RSVP" (Version 2) ค้างอยู่
ตัวนั้นเว็บไม่ได้ใช้ — archive ทิ้งได้ถ้าต้องการความเรียบร้อย

## งานที่ยังค้าง

1. **ลิงก์เครดิต P'Nueng / Nat** ในหน้าแรกยังเป็น `facebook.com/yourpage`
2. **รูป/Avatar ผู้เขียนคำอวยพร** — ยังไม่ได้ทำ (แผนคือให้เลือกเซลฟี่หรือ avatar
   นักเดินป่าชาย/หญิง แล้วแสดงคู่กับคำอวยพร)

## หมายเหตุ

- og:image ใช้ URL `https://anomakrpt.github.io/anosunwedding/...` — ถ้าเปลี่ยนโดเมน ให้แก้ใน `<head>` ทุกหน้า
- เมื่อแก้ไฟล์ CSS/JS ต้องเปลี่ยนเลข `?v=` ให้ตรงกันทุกหน้า ไม่งั้นแขกที่เคยเปิดจะได้ไฟล์เก่าจาก cache
