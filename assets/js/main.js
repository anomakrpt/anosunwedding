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

  /* ---------------------------------------------------------
     ตัวตรวจจับสองตัว ที่มีเกณฑ์เข้ากับเกณฑ์ออกไม่เท่ากัน (hysteresis)

     ถ้าใช้ตัวเดียวจะได้อย่างเสียอย่างเสมอ:
       เกณฑ์แคบ  → ฉากเริ่มตอนเลื่อนมาถึงจริง (ดี)
                    แต่ขยับเมาส์นิดเดียวก็หลุดเกณฑ์ อนิเมชันรีเซ็ตกลางคัน (แย่)
       เกณฑ์กว้าง → เล่นจนจบแน่ (ดี)
                    แต่ฉากถัดไปเริ่มเล่นตั้งแต่ยังอ่านฉากนี้ไม่จบ (แย่)

     จึงแยกเป็นสองตัว:
       startObserver  เกือบทั้งจอ (เว้นขอบล่าง 12%) → "เริ่ม" เมื่อโผล่บนจอจริง
       endObserver    ทั้งจอ                        → "รีเซ็ต" เมื่อออกนอกจอหมดแล้ว

     ทำไมขอบล่างเป็น 12% ไม่ใช่ 35%:
     เกณฑ์ลึกกว่านี้จะทำให้ของที่ "เห็นอยู่บนจอแล้ว" ยังโปร่งใสอยู่
     เช่นแถวหัวใจ Dress Code ที่อยู่ครึ่งล่างของจอ ผู้ใช้จะเห็นเป็นช่องว่าง
     ส่วนการกันไม่ให้ฉากถัดไปเริ่มก่อนเวลา ใช้วิธีอื่นที่ตรงกว่า:
     ฉากเล่าเรื่องทุกฉากสูงหนึ่งจอพอดีและ snap อยู่แล้ว เวลาหยุดอ่านฉากหนึ่ง
     ขอบบนของฉากถัดไปจะอยู่ที่ก้นจอพอดี ซึ่งยังไม่ถึงเกณฑ์ 88%

     ผลคือฉากเริ่มตรงจังหวะ เล่นจนจบโดยไม่มีอะไรมาขัด
     และเลื่อนกลับมาเมื่อไหร่ก็ได้ดูใหม่ตั้งแต่ต้นทุกครั้ง
  --------------------------------------------------------- */

  function setInView(el, inView) {

    /* เปลี่ยนเฉพาะตอนที่สถานะต่างจากเดิมจริง ๆ
       ไม่งั้นเอฟเฟกต์พิมพ์ดีดจะโดนสั่งให้เริ่มใหม่ทั้งที่กำลังพิมพ์อยู่ */
    if (el.classList.contains("in-view") === inView) {
      return;
    }

    el.classList.toggle("in-view", inView);

    /* บอกสคริปต์ของหน้านั้น ๆ ให้รู้ด้วย
       (home.js ใช้สัญญาณนี้เริ่ม/รีเซ็ตเอฟเฟกต์พิมพ์ดีด) */
    el.dispatchEvent(
      new CustomEvent("reveal:change", {
        detail: { inView }
      })
    );

  }


  const startObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setInView(entry.target, true);
        }
        /* ไม่สนใจตอนหลุดแถบ — endObserver เป็นคนตัดสินว่าจบแล้วหรือยัง */
      });
    },
    {
      /* threshold ต้องเป็น 0 เสมอ — section ที่สูงกว่าจอจะไม่มีวันถึง
         threshold สูง ๆ ได้ ต้องคุมขอบเขตด้วย rootMargin แทน */
      threshold: 0,
      rootMargin: "0px 0px -12% 0px"
    }
  );

  const endObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          setInView(entry.target, false);
        }
      });
    },
    {
      threshold: 0,
      rootMargin: "0px"
    }
  );

  function observe(el) {
    startObserver.observe(el);
    endObserver.observe(el);
  }

  items.forEach((el) => {

    /* ฉากที่คุมจังหวะเอง */
    if (el.matches(CHOREO_TARGETS)) {
      observe(el);
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

    observe(el);
  });


  /* เกณฑ์เริ่มเว้นขอบล่างไว้ 12% ของที่ค้างอยู่ในช่วงนั้นตอนเลื่อนสุดหน้า
     จึงไม่มีวันถึงเกณฑ์ เพราะเลื่อนต่อไม่ได้แล้ว — ถึงก้นหน้าเมื่อไหร่
     ให้เผยเฉพาะของที่ "อยู่บนจอจริง" ตอนนั้น

     สำคัญ: ต้องเช็คว่าอยู่ในจอจริง ๆ ทั้งขอบบนและขอบล่าง
     ของเดิมเช็คแค่ top < innerHeight ซึ่งจริงกับทุกอย่างที่อยู่เหนือจอด้วย
     พอเลื่อนถึงก้นหน้าครั้งเดียว ฉากที่ผ่านไปแล้วทั้งหน้าจะถูกมาร์ค in-view
     แล้ว endObserver ก็ไม่ยิงซ้ำ (สถานะข้างในมันคือ "ออกนอกจอ" อยู่แล้ว)
     ผลคือเลื่อนกลับขึ้นไป ทุกฉากขึ้นมาแบบเล่นจบแล้ว ไม่ได้ดูอนิเมชันอีกเลย */
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

      const rect = el.getBoundingClientRect();

      /* อยู่บนจอจริงเท่านั้น */
      if (rect.top >= window.innerHeight || rect.bottom <= 0) {
        return;
      }

      setInView(el, true);

    });

  }

  /* หน่วงด้วย rAF — ของเดิมอ่าน scrollHeight ทุก scroll event
     ซึ่งบังคับให้ browser คำนวณ layout ใหม่ทุกเฟรม แล้วการเลื่อนจะสะดุด */
  let tailQueued = false;

  function queueRevealTail() {
    if (tailQueued) {
      return;
    }
    tailQueued = true;
    requestAnimationFrame(() => {
      tailQueued = false;
      revealTail();
    });
  }

  window.addEventListener("scroll", queueRevealTail, { passive: true });
  window.addEventListener("resize", queueRevealTail);
  revealTail();

});
