/* ============================================================
   MAIN — ใช้ร่วมทุกหน้า
   Scroll-reveal: ค่อย ๆ เผยเนื้อหาเมื่อเลื่อนถึง
   เคารพ prefers-reduced-motion (ผู้ใช้ปิดอนิเมชัน = แสดงทันที)
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* selector ของสิ่งที่อยากให้ reveal ตอนเลื่อนถึง (ทุกหน้า) */
  const REVEAL_TARGETS = [
    ".section",
    ".blessing",
    ".split-section:not(.story-scene)",
    ".story-scene",
    ".details-wrap > *",
    ".gallery-item",
    ".final-ending",
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

  const items = document.querySelectorAll(REVEAL_TARGETS);

  if (!items.length) {
    return;
  }

  /* browser เก่าไม่มี IntersectionObserver → แสดงปกติ ไม่ซ่อนอะไร */
  if (reduceMotion || !("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      /* threshold 0 = โผล่พ้นขอบจอเมื่อไหร่ก็ reveal ทันที
         (ห้ามใช้ threshold สูง — section ที่สูงกว่าจอมาก ๆ จะไม่มีวันถึง) */
      threshold: 0,
      rootMargin: "0px 0px -6% 0px"
    }
  );

  items.forEach((el, i) => {

    /* ฉาก Story มีลำดับการเล่าของตัวเองใน home.css
       ให้ใส่แค่ .in-view ไม่ต้องใส่ .reveal ที่จางทั้งบล็อก */
    if (el.classList.contains("story-scene")) {
      observer.observe(el);
      return;
    }

    el.classList.add("reveal");
    /* ไล่จังหวะเล็กน้อยให้ item ที่อยู่ติดกัน */
    el.style.setProperty("--reveal-delay", `${(i % 4) * 90}ms`);
    observer.observe(el);
  });

});
