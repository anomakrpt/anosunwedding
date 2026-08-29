/* ============================================================
   RSVP — แบบตอบรับ + การ์ดยืนยัน (rsvp.html)

   Flow:
   ฟอร์ม → validate → POST (type:"rsvp") ไป Apps Script
   → แสดงการ์ดยืนยัน → บันทึกเป็น PNG / แชร์ / เพิ่มลงปฏิทิน
   → จำสถานะใน localStorage กันส่งซ้ำ
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("rsvpForm");

  /* ไม่ใช่หน้า rsvp.html → จบเลย */
  if (!form) {
    return;
  }

  const STORAGE_KEY = "rsvp-submitted";

  /* ข้อมูลงาน (ใช้ทั้งการ์ดและไฟล์ปฏิทิน) */
  const EVENT_INFO = {
    title: "งานแต่งงาน Ausamah & Mizahasan",
    location: "ดอยหลวงเชียงดาว, เชียงใหม่",
    /* Nikah Day 17 ม.ค. 2027 09:00-15:00 เวลาไทย (UTC+7 → 02:00Z) */
    startUtc: "20270117T020000Z",
    endUtc: "20270117T080000Z"
  };

  const nameInput = document.getElementById("rsvpName");
  const guestsField = document.getElementById("guestsField");
  const sideField = document.getElementById("sideField");
  const guestsOut = document.getElementById("rsvpGuests");
  const minusBtn = document.getElementById("guestMinus");
  const plusBtn = document.getElementById("guestPlus");
  const submitBtn = document.getElementById("rsvpSubmit");
  const messageEl = document.getElementById("rsvpMessage");

  const confirmSection = document.getElementById("rsvpConfirm");
  const confirmName = document.getElementById("confirmName");
  const confirmStatus = document.getElementById("confirmStatus");
  const confirmNote = document.getElementById("confirmNote");

  const saveCardBtn = document.getElementById("saveCardBtn");
  const shareCardBtn = document.getElementById("shareCardBtn");
  const calendarBtn = document.getElementById("calendarBtn");
  const editBtn = document.getElementById("editRsvpBtn");
  const toast = document.getElementById("toast");


  /* ============================================================
     Helpers
  ============================================================ */

  function showMessage(text, type) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = "message show " + (type || "");
  }

  function hideMessage() {
    if (!messageEl) return;
    messageEl.className = "message";
  }

  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(
      () => toast.classList.remove("show"),
      2600
    );
  }

  function readSaved() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (err) {
      return null;
    }
  }

  function persist(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      /* private mode ฯลฯ — ข้ามได้ */
    }
  }


  /* ============================================================
     Stepper จำนวนผู้ติดตาม (0–5)
  ============================================================ */

  let guests = 0;

  function renderGuests() {
    if (guestsOut) {
      guestsOut.textContent = String(guests);
    }
  }

  if (minusBtn) {
    minusBtn.addEventListener("click", () => {
      guests = Math.max(0, guests - 1);
      renderGuests();
    });
  }

  if (plusBtn) {
    plusBtn.addEventListener("click", () => {
      guests = Math.min(5, guests + 1);
      renderGuests();
    });
  }


  /* ============================================================
     แสดง/ซ่อนช่องเสริมตามคำตอบ มา/ไม่มา
  ============================================================ */

  form.addEventListener("change", (event) => {
    if (event.target.name !== "attending") {
      return;
    }
    const attending = event.target.value === "yes";
    if (guestsField) guestsField.hidden = !attending;
    if (sideField) sideField.hidden = false;
  });


  /* ============================================================
     Submit
  ============================================================ */

  form.addEventListener("submit", async (event) => {

    event.preventDefault();
    hideMessage();

    const fullname = nameInput ? nameInput.value.trim() : "";
    const attendingInput = form.querySelector('input[name="attending"]:checked');
    const sideInput = form.querySelector('input[name="side"]:checked');

    if (!fullname) {
      showMessage("กรุณากรอกชื่อ-นามสกุล", "error");
      if (nameInput) nameInput.focus();
      return;
    }

    if (!attendingInput) {
      showMessage("กรุณาเลือกว่าท่านสะดวกเข้าร่วมงานหรือไม่", "error");
      return;
    }

    const attending = attendingInput.value === "yes";

    const payload = {
      type: "rsvp",
      fullname: fullname,
      attending: attending ? "yes" : "no",
      guests: attending ? guests : 0,
      side: sideInput ? sideInput.value : ""
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "กำลังส่ง...";

    /* กันคำขอค้าง */
    const abortCtrl = new AbortController();
    const abortTimer = setTimeout(() => abortCtrl.abort(), 15000);

    try {

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        /* text/plain = simple request ข้าม CORS preflight
           (แบบเดียวกับระบบคำอวยพร) */
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload),
        signal: abortCtrl.signal
      });

      if (!response.ok) {
        throw new Error("Network error: " + response.status);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Server rejected");
      }

      persist(payload);
      showConfirmation(payload);
      showToast("ส่งคำตอบรับเรียบร้อยแล้ว ♥");

    } catch (err) {

      console.error("RSVP submit failed:", err);
      showMessage(
        "ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
        "error"
      );

    } finally {

      clearTimeout(abortTimer);
      submitBtn.disabled = false;
      submitBtn.innerHTML = "➤ &nbsp; ส่งคำตอบรับ";

    }

  });


  /* ============================================================
     การ์ดยืนยัน
  ============================================================ */

  function showConfirmation(data) {

    const formSection = form.closest(".rsvp-section");
    if (formSection) formSection.hidden = true;

    if (confirmName) {
      confirmName.textContent = data.fullname;
    }

    const attending = data.attending === "yes";

    if (confirmStatus) {
      confirmStatus.classList.toggle("declined", !attending);
      confirmStatus.textContent = attending
        ? (data.guests > 0
            ? `ยินดีเข้าร่วม · ผู้ติดตาม ${data.guests} ท่าน`
            : "ยินดีเข้าร่วม")
        : "ขออภัย ไม่สามารถเข้าร่วมได้";
    }

    if (confirmNote) {
      confirmNote.textContent = attending
        ? "เราตั้งตารอที่จะได้พบคุณในวันสำคัญของเรา"
        : "ขอบคุณที่แจ้งให้เราทราบ — คิดถึงคุณเสมอ";
    }

    /* ปุ่มปฏิทินมีประโยชน์เฉพาะคนที่มา */
    if (calendarBtn) {
      calendarBtn.hidden = !attending;
    }

    if (confirmSection) {
      confirmSection.hidden = false;
      confirmSection.scrollIntoView({ block: "center" });
    }

  }

  function showFormAgain() {
    const formSection = form.closest(".rsvp-section");
    if (formSection) formSection.hidden = false;
    if (confirmSection) confirmSection.hidden = true;
    hideMessage();
    form.scrollIntoView({ block: "start" });
  }

  if (editBtn) {
    editBtn.addEventListener("click", showFormAgain);
  }


  /* เคยตอบไว้แล้ว → แสดงการ์ดเดิมทันที */
  const saved = readSaved();
  if (saved && saved.fullname) {
    guests = Number(saved.guests) || 0;
    renderGuests();
    if (nameInput) nameInput.value = saved.fullname;
    showConfirmation(saved);
  }


  /* ============================================================
     วาดการ์ดเป็นรูป PNG ด้วย canvas (ไม่ใช้ไลบรารีภายนอก)
  ============================================================ */

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function renderCardPng() {

    const data = readSaved();
    if (!data) return null;

    const attending = data.attending === "yes";

    const W = 720;
    const H = 960;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    /* พื้นหลังไล่โทนครีม */
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#fffdf8");
    bg.addColorStop(1, "#f6f0e2");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    /* กรอบ */
    ctx.strokeStyle = "#d8cfae";
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, W - 72, H - 72);
    ctx.strokeStyle = "#e7dfc9";
    ctx.lineWidth = 1;
    ctx.strokeRect(48, 48, W - 96, H - 96);

    /* โลโก้ */
    const logo = await loadImage("pic/logo.png");
    if (logo) {
      const lw = 110;
      const lh = lw * (logo.height / logo.width);
      ctx.drawImage(logo, (W - lw) / 2, 92, lw, lh);
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#403e31";

    ctx.font = "600 30px 'Cormorant Garamond', serif";
    ctx.fillText("AUSAMAH  &  MIZAHASAN", W / 2, 268);

    ctx.strokeStyle = "#9b9870";
    ctx.beginPath();
    ctx.moveTo(W / 2 - 60, 296);
    ctx.lineTo(W / 2 + 60, 296);
    ctx.stroke();

    ctx.fillStyle = "#918c7e";
    ctx.font = "300 22px 'Noto Sans Thai', sans-serif";
    ctx.fillText("ขอบคุณสำหรับการตอบรับ", W / 2, 348);

    ctx.fillStyle = "#403e31";
    ctx.font = "600 44px 'Cormorant Garamond', 'Noto Sans Thai', serif";
    ctx.fillText(data.fullname, W / 2, 420, W - 160);

    /* ป้ายสถานะ */
    const statusText = attending
      ? (data.guests > 0
          ? `ยินดีเข้าร่วม · ผู้ติดตาม ${data.guests} ท่าน`
          : "ยินดีเข้าร่วม")
      : "ขออภัย ไม่สามารถเข้าร่วมได้";

    ctx.font = "400 22px 'Noto Sans Thai', sans-serif";
    const tw = ctx.measureText(statusText).width;
    const pillW = tw + 56;
    const pillH = 46;
    const pillX = (W - pillW) / 2;
    const pillY = 452;
    ctx.fillStyle = attending
      ? "rgba(119,119,71,.12)"
      : "rgba(163,84,63,.10)";
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(pillX, pillY, pillW, pillH, 23);
    } else {
      /* Safari เก่าไม่มี roundRect — ใช้สี่เหลี่ยมธรรมดา */
      ctx.rect(pillX, pillY, pillW, pillH);
    }
    ctx.fill();
    ctx.fillStyle = attending ? "#5f6037" : "#a3543f";
    ctx.fillText(statusText, W / 2, pillY + 31);

    /* รายละเอียดงาน */
    ctx.fillStyle = "#403e31";
    ctx.font = "400 24px 'Noto Sans Thai', sans-serif";
    ctx.fillText("16 – 17 มกราคม 2570", W / 2, 600);
    ctx.fillText("ดอยหลวงเชียงดาว · เชียงใหม่", W / 2, 640);

    ctx.fillStyle = "#918c7e";
    ctx.font = "300 20px 'Noto Sans Thai', sans-serif";
    ctx.fillText(
      attending
        ? "เราตั้งตารอที่จะได้พบคุณในวันสำคัญของเรา"
        : "ขอบคุณที่แจ้งให้เราทราบ",
      W / 2,
      720
    );

    ctx.font = "italic 300 20px 'Cormorant Garamond', serif";
    ctx.fillText("With love,", W / 2, 810);
    ctx.font = "600 24px 'Cormorant Garamond', serif";
    ctx.fillText("A & M", W / 2, 844);

    return new Promise((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

  }

  async function withBusy(btn, fn) {
    const original = btn.innerHTML;
    btn.disabled = true;
    try {
      await fn();
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  }

  if (saveCardBtn) {
    saveCardBtn.addEventListener("click", () => {
      withBusy(saveCardBtn, async () => {
        const blob = await renderCardPng();
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "rsvp-ausamah-mizahasan.png";
        a.click();
        URL.revokeObjectURL(url);
        showToast("บันทึกการ์ดแล้ว");
      });
    });
  }

  if (shareCardBtn) {
    shareCardBtn.addEventListener("click", () => {
      withBusy(shareCardBtn, async () => {
        const blob = await renderCardPng();
        if (!blob) return;

        const file = new File(
          [blob],
          "rsvp-ausamah-mizahasan.png",
          { type: "image/png" }
        );

        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        ) {
          try {
            await navigator.share({
              files: [file],
              title: EVENT_INFO.title
            });
            return;
          } catch (err) {
            /* ผู้ใช้กดยกเลิก — ไม่ต้องทำอะไร */
            if (err && err.name === "AbortError") return;
          }
        }

        /* fallback: ดาวน์โหลดแทน */
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        showToast("อุปกรณ์นี้แชร์ตรงไม่ได้ — บันทึกการ์ดให้แล้ว");
      });
    });
  }


  /* ============================================================
     เพิ่มลงปฏิทิน (.ics — สร้างฝั่ง client)
  ============================================================ */

  if (calendarBtn) {
    calendarBtn.addEventListener("click", () => {

      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//anosunwedding//RSVP//TH",
        "BEGIN:VEVENT",
        `UID:rsvp-${Date.now()}@anosunwedding`,
        `DTSTAMP:${EVENT_INFO.startUtc}`,
        `DTSTART:${EVENT_INFO.startUtc}`,
        `DTEND:${EVENT_INFO.endUtc}`,
        `SUMMARY:${EVENT_INFO.title}`,
        `LOCATION:${EVENT_INFO.location}`,
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([ics], {
        type: "text/calendar;charset=utf-8"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ausamah-mizahasan-wedding.ics";
      a.click();
      URL.revokeObjectURL(url);
      showToast("ดาวน์โหลดไฟล์ปฏิทินแล้ว");

    });
  }

});
