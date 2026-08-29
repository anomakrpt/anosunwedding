/**
 * Google Apps Script — Wishes + RSVP backend (reference copy)
 * ============================================================
 * ไฟล์นี้เป็น "สำเนาอ้างอิง" ของโค้ดที่ต้องวางใน Apps Script editor
 * (script.google.com) ของบัญชี Google เจ้าของ Sheet
 *
 * สำคัญ: โค้ด doPost/doGet ส่วน Wishes เดิมของคุณอาจต่างจากนี้เล็กน้อย
 * ให้ "เพิ่มเฉพาะส่วน RSVP" เข้าไปในโค้ดเดิม ไม่ใช่วางทับทั้งไฟล์
 * — ดูวิธีใน README.md หัวข้อ "Deploy Apps Script"
 *
 * โครงสร้าง Sheet ที่ใช้:
 *   ชีท "Wishes" : (ของเดิม)
 *   ชีท "RSVP"   : Timestamp | Fullname | Attending | Guests | Side
 */

const RSVP_SHEET_NAME = "RSVP";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    /* ---------- RSVP ---------- */
    if (data.type === "rsvp") {
      return handleRsvp_(data);
    }

    /* ---------- Wishes (ของเดิม) ----------
       วางโค้ดจัดการคำอวยพรเดิมของคุณตรงนี้ */
    return jsonOut_({ success: false, message: "unknown type" });

  } catch (err) {
    return jsonOut_({ success: false, message: String(err) });
  }
}

function handleRsvp_(data) {
  const fullname = String(data.fullname || "").trim().slice(0, 80);
  const attending = data.attending === "yes" ? "yes" : "no";
  const guests = Math.max(0, Math.min(5, Number(data.guests) || 0));
  const side = ["groom", "bride"].indexOf(data.side) !== -1 ? data.side : "";

  if (!fullname) {
    return jsonOut_({ success: false, message: "missing fullname" });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(RSVP_SHEET_NAME);

  /* สร้างชีท RSVP อัตโนมัติครั้งแรก */
  if (!sheet) {
    sheet = ss.insertSheet(RSVP_SHEET_NAME);
    sheet.appendRow(["Timestamp", "Fullname", "Attending", "Guests", "Side"]);
  }

  sheet.appendRow([new Date(), fullname, attending, guests, side]);

  return jsonOut_({ success: true });
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
