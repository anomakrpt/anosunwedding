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
const WISHES_PER_PAGE = 9;      /* จำนวนต่อชุด */
const WISHES_INTERVAL = 5000;   /* เปลี่ยนชุดทุก 5 วินาที */
const WISH_FADE_TIME = 500;     /* ให้ตรงกับ CSS transition .5s */
