/* ============================================================
   CONFIG — ค่าที่แก้บ่อยรวมไว้ที่เดียว
============================================================ */

/* เพลงพื้นหลัง (YouTube) */
const VIDEO_ID = "S_E2EHVxNAE";
const START_SECONDS = 136;

/* วันเวลางาน (เวลาไทย) — ใช้กับ countdown */
const WEDDING_DATE = "2027-01-17T10:00:00+07:00";

/* Google Apps Script endpoint (Wishes + RSVP) */
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbywM1mDbhshGlLx5tFYuOcGAyJUVF5BoyDVFI4msBVKGsm9WLwDWKESisH6rZ4EEkGorQ/exec";

/* Wishes wall */
const WISHES_PER_PAGE = 12;     /* จำนวนคำอวยพรที่โชว์บนต้นไม้พร้อมกัน */
const WISHES_INTERVAL = 5000;   /* เปลี่ยนชุดทุก 5 วินาที */
const WISH_FADE_TIME = 500;     /* ให้ตรงกับ CSS transition .5s */

/* รูปที่หมุนสลับในแกลเลอรีหน้าแรก (A Glimpse of Us)
   เพิ่ม/ลดได้ตามต้องการ — ระบบจะกระจายลงช่อง mosaic เอง */
const HOME_GALLERY_PHOTOS = [
  { src: "pic/photo/photo-10.jpg", alt: "คู่บ่าวสาวริมทะเลยามพระอาทิตย์ตก" },
  { src: "pic/photo/photo-01.jpg", alt: "จับมือกันวิ่งบนทุ่งหญ้า" },
  { src: "pic/photo/photo-11.jpg", alt: "เดินขึ้นเขาใต้ท้องฟ้ากว้าง" },
  { src: "pic/photo/photo-03.jpg", alt: "ระหว่างทางเดินป่าด้วยกัน" },
  { src: "pic/photo/photo-09.jpg", alt: "ขับเจ็ตสกีกลางทะเล" },
  { src: "pic/photo/photo-02.jpg", alt: "นั่งพักบนเนินหญ้า" },
  { src: "pic/photo/photo-04.jpg", alt: "ที่หมายบนยอดดอย" },
  { src: "pic/photo/photo-05.jpg", alt: "ช่วงเวลาสบาย ๆ กลางทุ่ง" },
  { src: "pic/photo/photo-06.jpg", alt: "ท้องฟ้าและหมู่เมฆ" },
  { src: "pic/photo/photo-07.jpg", alt: "เดินเคียงกันบนสันเขา" },
  { src: "pic/photo/photo-08.jpg", alt: "ภาพความทรงจำระหว่างทาง" }
];

/* สลับรูปในแกลเลอรีหน้าแรกทีละช่อง ทุกกี่มิลลิวินาที */
const HOME_GALLERY_INTERVAL = 3600;
