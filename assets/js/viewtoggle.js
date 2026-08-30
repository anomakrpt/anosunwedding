/* ============================================================
   VIEW TOGGLE — สลับดูหน้าเว็บแบบ Desktop / Mobile

   ใช้สำหรับ cross check ว่าหน้าตาบนสองอุปกรณ์เป็นอย่างไร
   โดยไม่ต้องเปิดเครื่องจริงหรือ dev tools

   วิธีทำ: โหมด Mobile จะโหลดหน้าเดิมซ้ำในกรอบ iframe ขนาดเท่าโทรศัพท์
   ไม่ใช่แค่บีบความกว้างของ body

   เหตุผล: media query อ่านขนาด "viewport" ไม่ใช่ขนาดกล่อง
   ถ้าแค่บีบ body ให้แคบ กฎ @media (max-width: 640px) จะไม่ทำงาน
   สิ่งที่เห็นก็จะไม่ตรงกับของจริงบนมือถือ — ซึ่งผิดวัตถุประสงค์
   ส่วน iframe มี viewport ของตัวเอง กฎทุกข้อจึงทำงานเหมือนเครื่องจริง

   ถ้าไม่อยากให้แขกเห็นปุ่มนี้ในวันงาน ลบ <script> บรรทัดเดียวออกได้เลย
   หรือเปลี่ยน SHOW_ALWAYS เป็น false แล้วเรียกด้วย ?preview=1 แทน
============================================================ */

(function () {

  const SHOW_ALWAYS = true;
  const KEY = "wedding-view";
  const FRAME_FLAG = "viewframe";

  const params = new URLSearchParams(location.search);

  /* หน้าที่อยู่ "ข้างใน" กรอบมือถือ ไม่ต้องมีปุ่มซ้อนอีกชั้น */
  if (params.has(FRAME_FLAG)) {
    return;
  }

  if (!SHOW_ALWAYS && !params.has("preview")) {
    return;
  }


  const PHONE = { w: 390, h: 844 };


  function read() {
    try {
      return localStorage.getItem(KEY) === "mobile" ? "mobile" : "desktop";
    } catch (e) {
      return "desktop";
    }
  }

  function write(v) {
    try {
      localStorage.setItem(KEY, v);
    } catch (e) { /* โหมดส่วนตัว — ใช้ได้แค่รอบนี้ */ }
  }


  /* ---------- ปุ่มสลับ ---------- */

  const bar = document.createElement("div");
  bar.className = "viewbar";
  bar.innerHTML =
    '<button type="button" class="viewbar-btn" data-view="desktop">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<rect x="2.5" y="4" width="19" height="13" rx="2" />' +
        '<path d="M9 20h6M12 17v3" />' +
      '</svg>' +
      '<span>Desktop</span>' +
    '</button>' +
    '<button type="button" class="viewbar-btn" data-view="mobile">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<rect x="7" y="2.5" width="10" height="19" rx="2.5" />' +
        '<path d="M11 18.6h2" />' +
      '</svg>' +
      '<span>Mobile</span>' +
    '</button>';


  /* ---------- กรอบมือถือ ---------- */

  let overlay = null;

  function frameUrl() {
    const u = new URL(location.href);
    u.searchParams.set(FRAME_FLAG, "1");
    /* ข้ามวิดีโอเปิดหน้า จะได้เห็นหน้าจริงทันทีตอนตรวจ */
    if (u.pathname.endsWith("index.html") || u.pathname.endsWith("/")) {
      u.searchParams.set("skipIntro", "1");
    }
    return u.toString();
  }

  function openFrame() {

    if (overlay) return;

    overlay = document.createElement("div");
    overlay.className = "viewframe-overlay";

    const shell = document.createElement("div");
    shell.className = "viewframe-shell";

    const frame = document.createElement("iframe");
    frame.className = "viewframe";
    frame.title = "ตัวอย่างหน้าจอมือถือ";
    frame.width = PHONE.w;
    frame.height = PHONE.h;
    frame.src = frameUrl();

    const caption = document.createElement("p");
    caption.className = "viewframe-caption";
    caption.textContent = PHONE.w + " × " + PHONE.h;

    shell.appendChild(frame);
    shell.appendChild(caption);
    overlay.appendChild(shell);
    document.body.appendChild(overlay);

    fitFrame();
    document.documentElement.classList.add("is-viewframe");
  }

  function closeFrame() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.documentElement.classList.remove("is-viewframe");
  }

  /* ย่อกรอบลงถ้าหน้าต่างเตี้ยกว่าโทรศัพท์ที่จำลอง
     ใช้ scale เพื่อให้ viewport ข้างในยังเป็น 390x844 เท่าเดิม
     ถ้าไปลดขนาด iframe จริง media query ข้างในจะเปลี่ยนตาม แล้วผลตรวจจะเพี้ยน */
  function fitFrame() {
    if (!overlay) return;
    const shell = overlay.querySelector(".viewframe-shell");
    const room = Math.min(
      (window.innerHeight - 132) / PHONE.h,
      (window.innerWidth - 48) / PHONE.w,
      1
    );
    shell.style.transform = "scale(" + Math.max(room, 0.4).toFixed(3) + ")";
  }

  window.addEventListener("resize", fitFrame);


  /* ---------- สลับโหมด ---------- */

  function apply(view, save) {

    bar.querySelectorAll(".viewbar-btn").forEach((b) => {
      const on = b.dataset.view === view;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });

    if (view === "mobile") {
      openFrame();
    } else {
      closeFrame();
    }

    if (save) {
      write(view);
    }
  }

  bar.addEventListener("click", (e) => {
    const btn = e.target.closest(".viewbar-btn");
    if (btn) {
      apply(btn.dataset.view, true);
    }
  });

  /* กด Esc ออกจากกรอบมือถือ */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay) {
      apply("desktop", true);
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(bar);
    apply(read(), false);
  });

})();
