/**
 * Google Apps Script — Wishes + RSVP backend
 * ============================================================
 * สำเนาอ้างอิงของโค้ดที่ deploy จริงแล้ว (Version 4, 30 ส.ค. 2026)
 *
 * โปรเจกต์จริง: Apps Script ชื่อ "Wishes"
 * ผูกกับ Google Sheet: Wedding_Wishes
 * บัญชีเจ้าของ: anoma.krpt@gmail.com
 *
 * ไฟล์นี้เก็บไว้อ้างอิงเท่านั้น — แก้ที่นี่ไม่มีผลกับเว็บ
 * ต้องไปแก้ใน script.google.com แล้ว Deploy ใหม่
 *
 * ด้านล่างคือ "เฉพาะส่วนที่เพิ่มเข้าไป" สำหรับ RSVP
 * (โค้ดคำอวยพรเดิม doPost/doGet/jsonResponse ไม่ได้แก้ไข)
 */


/* ============================================================
   1) ในฟังก์ชัน doPost เดิม — แทรกบล็อกนี้ทันทีหลังบรรทัด

        const data = JSON.parse(e.postData.contents);

      และก่อน validation ของคำอวยพร
   ============================================================ */

// if (data.type === "rsvp") {
//   return handleRsvp_(data);
// }


/* ============================================================
   2) ต่อท้ายไฟล์ — ตัวจัดการ RSVP

   ชีท "RSVP" จะถูกสร้างอัตโนมัติในครั้งแรกที่มีคนตอบรับ
   คอลัมน์: Timestamp | Fullname | Attending | Guests | Side
   ============================================================ */

const RSVP_SHEET_NAME = "RSVP";

function handleRsvp_(data) {

  const fullname =
    String(data.fullname || "").trim().slice(0, 80);

  const attending =
    data.attending === "yes" ? "yes" : "no";

  const guests =
    Math.max(0, Math.min(5, Number(data.guests) || 0));

  const side =
    (data.side === "groom" || data.side === "bride")
      ? data.side
      : "";

  if (!fullname) {
    return jsonResponse({
      success: false,
      message: "Fullname is required"
    });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(RSVP_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(RSVP_SHEET_NAME);
    sheet.appendRow([
      "Timestamp",
      "Fullname",
      "Attending",
      "Guests",
      "Side"
    ]);
  }

  sheet.appendRow([
    new Date(),
    fullname,
    attending,
    guests,
    side
  ]);

  return jsonResponse({
    success: true,
    message: "RSVP saved"
  });
}


/* ============================================================
   3) AVATAR — รูปแทนตัวผู้เขียนคำอวยพร (เพิ่มใน Version 4)

   แก้ 4 จุดในโค้ดคำอวยพรเดิม:

   3.1 ใน doPost หลัง const allowDisplay = ... ให้เพิ่ม

       const avatar =
         String(data.avatar || "").slice(0, 20000);

   3.2 ใน sheet.appendRow([...]) เพิ่ม avatar ต่อท้าย status
       คอลัมน์ใหม่: F = Avatar

   3.3 ใน doGet เปลี่ยน getRange(2, 1, lastRow - 1, 5)
       เป็น getRange(2, 1, lastRow - 1, 6)

   3.4 ใน items.push({...}) เพิ่ม

       avatar: row[5] || "",

   ค่าที่เก็บมี 2 แบบ
     • "hiker-m" / "hiker-f" / "hiker-h" → รูปวาดสำเร็จในเว็บ
     • "data:image/jpeg;base64,..."      → เซลฟี่ที่ย่อ 128px แล้ว (~5 KB)
   ============================================================ */
