/* ============================================================
   MAIN — ใช้ร่วมทุกหน้า

   คุมการ "เผยเนื้อหาเมื่อเลื่อนถึง" ให้ทั้งเว็บ โดยแบ่งเป็นสองแบบ

   1) ฉากที่มีลำดับการเล่าของตัวเอง (CHOREO_TARGETS)
      → ได้แค่ class .in-view แล้วปล่อยให้ CSS ไล่จังหวะข้างในเอง
      ห้ามใส่ .reveal ให้ ไม่งั้นทั้งบล็อกจะจางพร้อมกันจนกลบลำดับข้างใน

   2) ที่เหลือ (REVEAL_TARGETS)
      → fade-up มาตรฐานผ่าน .reveal ใน components.css

   เลื่อนพ้นจอแล้วถอด .in-view ออก เลื่อนกลับขึ้นมาจึงได้ดูใหม่ทุกครั้ง
   เคารพ prefers-reduced-motion (ผู้ใช้ปิดอนิเมชัน = แสดงทันที)
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ฉากที่คุมจังหวะเองใน home.css */
  const CHOREO_TARGETS = [
    ".story-scene",
    ".blessing",
    ".details-wrap",
    ".countdown-banner",
    ".ceremony-card",
    ".location-card",
    ".dress-section",
    ".gallery-section",
    ".final-ending"
  ].join(", ");

  /* ที่เหลือใช้ fade-up มาตรฐาน (ส่วนใหญ่คือหน้า photos / wishes / rsvp) */
  const REVEAL_TARGETS = [
    ".section",
    ".split-section",
    ".gallery-item",
    ".photo-heading",
    ".gallery-wrap",
    ".drive-card",
    ".photo-thanks",
    ".form-section",
    ".cloud-section",
    ".rsvp-section"
  ].join(", ");

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const items = document.querySelectorAll(
    CHOREO_TARGETS + ", " + REVEAL_TARGETS
  );

  if (!items.length) {
    return;
  }

  /* browser เก่าไม่มี IntersectionObserver → แสดงปกติ ไม่ซ่อนอะไร */
  if (reduceMotion || !("IntersectionObserver" in window)) {
    return;
  }

  /* เลื่อนถึง = เล่น, เลื่อนพ้น = รีเซ็ต */
  const observer = new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        const inView = entry.isIntersecting;

        entry.target.classList.toggle("in-view", inView);

        /* บอกสคริปต์ของหน้านั้น ๆ ให้รู้ด้วย
           (home.js ใช้สัญญาณนี้เริ่ม/รีเซ็ตเอฟเฟกต์พิมพ์ดีด) */
        entry.target.dispatchEvent(
          new CustomEvent("reveal:change", {
            detail: { inView }
          })
        );

      });

    },
    {
      /* threshold ต้องเป็น 0 เสมอ — section ที่สูงกว่าจอจะไม่มีวันถึง
         threshold สูง ๆ ได้ ต้องคุมด้วย rootMargin แทน

         rootMargin ติดลบทั้งบนและล่าง = ย่อพื้นที่ตรวจจับเหลือแถบกลางจอ
         ฉากจะเริ่มเล่นก็ต่อเมื่อเลื่อนมาถึงจริง ๆ ไม่ใช่ตั้งแต่ขอบบนโผล่
         (ไม่งั้นฉากถัดไปจะเล่นจบไปแล้วตั้งแต่ยังอ่านฉากนี้ไม่จบ) */
      threshold: 0,
      rootMargin: "-22% 0px -22% 0px"
    }
  );

  items.forEach((el) => {

    /* ฉากที่คุมจังหวะเอง */
    if (el.matches(CHOREO_TARGETS)) {
      observer.observe(el);
      return;
    }

    /* อยู่ข้างในฉากที่คุมจังหวะเองอยู่แล้ว → ไม่ต้องซ้อน fade อีกชั้น */
    if (el.closest(CHOREO_TARGETS)) {
      return;
    }

    el.classList.add("reveal");

    /* ไล่จังหวะเล็กน้อยให้ item ที่อยู่ติดกันในกล่องเดียวกัน */
    const siblings = el.parentElement
      ? Array.prototype.filter.call(
          el.parentElement.children,
          (n) => n.matches(REVEAL_TARGETS)
        )
      : [el];

    const order = siblings.indexOf(el);

    el.style.setProperty(
      "--reveal-delay",
      `${Math.min(order, 5) * 90}ms`
    );

    observer.observe(el);
  });


  /* แถบตรวจจับอยู่กลางจอ ของที่ค้างอยู่ท้ายหน้าจึงมีโอกาสไม่มีวันเข้าแถบ
     เพราะเลื่อนต่อไม่ได้แล้ว — ถึงก้นหน้าเมื่อไหร่ ให้เผยส่วนที่เหลือทั้งหมด */
  function revealTail() {

    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;

    if (!atBottom) {
      return;
    }

    items.forEach((el) => {

      if (el.classList.contains("in-view")) {
        return;
      }

      if (el.getBoundingClientRect().top >= window.innerHeight) {
        return;
      }

      el.classList.add("in-view");

      el.dispatchEvent(
        new CustomEvent("reveal:change", {
          detail: { inView: true }
        })
      );

    });

  }

  window.addEventListener("scroll", revealTail, { passive: true });
  window.addEventListener("resize", revealTail);
  revealTail();

});
