/* ============================================================
   COVERFLOW — ชั้นวางรูปสามมิติ ใช้ร่วมกันระหว่างหน้าแรกกับหน้ารูปภาพ

   เดิมอยู่ใน home.js เพราะมีที่เดียว พอหน้า Photos เปลี่ยนมาใช้
   การนำเสนอแบบเดียวกัน จึงแยกออกมาเป็นไฟล์ของตัวเอง แทนที่จะก๊อปสองชุด

   ตัวช่วยจับ element เปลี่ยนจาก id เป็น class ที่ค้นหาภายใน root
   หน้าหนึ่งจึงมีได้หลายชั้นวาง โดยแต่ละชั้นถือสถานะของตัวเองแยกกัน

   markup ที่ต้องมี:
     .coverflow > .cf-viewport > .cf-frame > .cf-track > .cf-card[]
   ที่มีก็ได้ไม่มีก็ได้:
     .cf-nav.cf-prev / .cf-nav.cf-next / .cf-dots / .cf-pause

   สไตล์อยู่ใน components.css (บล็อก COVERFLOW)
============================================================ */

(function () {

  "use strict";

  /* ============================================================
     COVERFLOW

     การ์ดทุกใบวางซ้อนกันอยู่ที่กลางเวที (position:absolute; left:50%)
     ตำแหน่งจริงมาจาก transform ที่คำนวณใหม่ทุกเฟรมจากค่าเดียว: pos
     ซึ่งเป็น "ดัชนีการ์ดแบบทศนิยม" ของใบที่อยู่ตรงกลางพอดี

     ทำไมต้องเป็นทศนิยม: ระหว่างลากนิ้ว pos = 3.42 ได้ ทั้งฉากจึงขยับ
     ตามนิ้วอย่างต่อเนื่อง ไม่ใช่กระโดดทีละใบ

     ระยะห่าง ความลึก และองศาเอียง ผูกกับความกว้างการ์ดทั้งหมด
     เปลี่ยน --cf-card ใน CSS ค่าเดียว ฉากย่อ/ขยายตามได้ทั้งชุด

     เขียนลง element.style ตรง ๆ ไม่ผ่าน class เพราะค่าเปลี่ยนหกสิบครั้ง
     ต่อวินาที และเป็นตัวเลขที่ไม่มีใครนอกจากตัวเลย์เอาต์ต้องรู้
     ============================================================ */

  function startCoverflow(root) {

    const frame = root.querySelector(".cf-frame");
    const track = root.querySelector(".cf-track");
    const dotsBox = root.querySelector(".cf-dots");

    if (!frame || !track) return;

    const cards = Array.from(track.querySelectorAll(".cf-card"));
    const count = cards.length;

    if (count < 3) return;


    /* ---- รูปทรงของฉาก ----
       ค่าพวกนี้มาจากคอมโพเนนต์ต้นแบบ ปรับให้การ์ดใหญ่ขึ้นเล็กน้อย
       เพราะเป็นรูปถ่ายคน ไม่ใช่ปกอัลบั้ม */

    const ROTATE = 42;      /* องศาที่ใบข้างแรกเอียง */
    const DEPTH = 0.58;     /* ใบข้างแรกถอยลึกเท่าไร คิดเป็นสัดส่วนความกว้างการ์ด */
    const FALLOFF = 0.56;   /* เลขชี้กำลังของระยะ ต่ำกว่า 1 = ยิ่งไกลยิ่งเอียงเพิ่มช้าลง */
    const FADE = 0.1;       /* ความจางที่เสียไปต่อหนึ่งขั้นจากกลาง */
    const GAP = 0.06;       /* ช่องไฟระหว่างการ์ด คิดเป็นสัดส่วนความกว้างการ์ด */
    const MAX_TILT = 82;    /* กันไม่ให้ใบไกล ๆ หันข้างจนมองไม่เห็นหน้า */


    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;


    /* pos = ดัชนีทศนิยมของใบที่อยู่กลางเวที — แหล่งความจริงเพียงที่เดียว */
    let pos = 0;

    /* target = ปลายทางที่กำลังไถลไปหา
       แยกจาก pos เพราะถ้ากดลูกศรซ้ำระหว่างที่ยังไถลไม่ถึง
       การนับต่อจาก pos จะกลืนการกดครั้งนั้นหายไป */
    let target = 0;

    let cardWidth = 0;
    let raf = null;
    let selected = 0;
    let drag = null;


    /* ใบที่ใกล้ที่สุดเมื่อปัดกลับเข้าช่วง 0..count-1 */
    function indexAt(p) {
      return ((Math.round(p) % count) + count) % count;
    }


    function paint() {

      if (!cardWidth) return;

      const pitch = cardWidth * (1 + GAP);

      cards.forEach((card, index) => {

        /* พับระยะให้เป็นทางที่สั้นกว่าเมื่อเดินรอบวง
           นี่คือกลไกวนลูปทั้งหมด — ไม่ต้องโคลนโหนด ไม่ต้องสลับ DOM */
        let offset = index - pos;
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;

        const distance = Math.abs(offset);

        /* ทั้งองศาเอียงและความลึกค่อย ๆ ผ่อนลงเมื่อไกลออกไป
           ระยะเพิ่มเท่าตัวได้เพิ่มมาอีกราวครึ่งเดียว
           ถ้าไล่แบบเส้นตรง ใบที่สองจะพับปิดจนอ่านภาพไม่ออก */
        const ramp = Math.pow(distance, FALLOFF);

        const tilt =
          Math.min(ROTATE * ramp, MAX_TILT) * Math.sign(offset);

        card.style.transform =
          "translateX(calc(-50% + " + (offset * pitch) + "px)) " +
          "translateZ(" + (-DEPTH * cardWidth * ramp) + "px) " +
          "rotateY(" + (-tilt) + "deg)";

        /* ใบที่ถูกย้ายข้ามวงจะสลับฝั่งตอนห่างครึ่งรอบพอดี
           จึงต้องจางหายไปก่อนถึงจุดนั้น ไม่งั้นจะเห็นมันกระโดด */
        const edge =
          Math.min(1, Math.max(0, count / 2 - distance));

        card.style.opacity =
          String(Math.max(0, 1 - FADE * distance) * edge);

        card.style.zIndex =
          String(100 - Math.round(distance));

        /* ใบที่ไม่ได้อยู่กลางไม่ควรถูกอ่านออกเสียงหรือรับโฟกัส */
        card.setAttribute(
          "aria-hidden",
          distance > 0.5 ? "true" : "false"
        );

      });

    }


    function syncDots() {

      if (!dotsBox) return;

      Array.from(dotsBox.children).forEach((dot, i) => {
        dot.setAttribute("aria-selected", String(i === selected));
        dot.tabIndex = i === selected ? 0 : -1;
      });

    }


    function select(index) {

      if (index === selected) return;

      selected = index;

      syncDots();

    }


    function settle(to) {

      if (raf !== null) cancelAnimationFrame(raf);

      target = to;

      select(indexAt(to));

      /* ปิดอนิเมชันไว้ ก็ไปถึงเลยไม่ต้องไถล */
      if (reduceMotion) {
        pos = to;
        paint();
        raf = null;
        return;
      }

      function step() {

        const remaining = target - pos;

        if (Math.abs(remaining) < 0.0004) {
          pos = target;
          paint();
          raf = null;
          return;
        }

        /* ผ่อนแบบ exponential ไม่ใช่สปริง — ไม่มีการเลยเป้าแล้วดีดกลับ */
        pos += remaining * 0.16;

        paint();

        raf = requestAnimationFrame(step);

      }

      raf = requestAnimationFrame(step);

    }


    function goTo(index) {

      /* เดินทางสั้นที่สุด แทนที่จะคลายวงกลับทีละใบจนครบรอบ */
      const to =
        index + Math.round((target - index) / count) * count;

      settle(to);

    }


    function nudge(by) {
      settle(Math.round(target) + by);
    }


    /* ---- จุดบอกตำแหน่ง ----
       สร้างจาก JS เพราะถ้าไม่มี JS จุดก็กดไม่ได้อยู่ดี */

    if (dotsBox) {

      cards.forEach((card, i) => {

        const dot = document.createElement("button");

        dot.type = "button";
        dot.className = "cf-dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-selected", String(i === 0));
        dot.setAttribute(
          "aria-label",
          "ภาพที่ " + (i + 1) + " จาก " + count
        );
        dot.tabIndex = i === 0 ? 0 : -1;

        dot.addEventListener("click", () => {
          pause();
          goTo(i);
        });

        dotsBox.appendChild(dot);

      });

    }


    /* ---- ปุ่มลูกศร ---- */

    const prevBtn = root.querySelector(".cf-prev");
    const nextBtn = root.querySelector(".cf-next");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        pause();
        nudge(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        pause();
        nudge(1);
      });
    }


    /* ---- คีย์บอร์ด ---- */

    frame.addEventListener("keydown", (e) => {

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        pause();
        nudge(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        pause();
        nudge(1);
      }

    });


    /* ---- ลากด้วยนิ้ว/เมาส์ ---- */

    frame.addEventListener("pointerdown", (e) => {

      if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }

      frame.setPointerCapture(e.pointerId);

      target = pos;

      drag = {
        id: e.pointerId,
        x: e.clientX,
        pos: pos,
        v: 0,
        t: performance.now(),
        moved: false
      };

    });


    frame.addEventListener("pointermove", (e) => {

      if (!drag || drag.id !== e.pointerId) return;

      const pitch = cardWidth * (1 + GAP);

      if (!pitch) return;

      const dx = e.clientX - drag.x;

      if (Math.abs(dx) > 3) drag.moved = true;

      const now = performance.now();
      const previous = pos;

      pos = drag.pos - dx / pitch;

      /* หน่วยเป็น "การ์ดต่อวินาที" ไว้ใช้ตอนสะบัดปล่อย */
      drag.v =
        ((pos - previous) / Math.max(now - drag.t, 1)) * 1000;

      drag.t = now;

      select(indexAt(pos));

      paint();

    });


    function endDrag(e) {

      if (!drag || drag.id !== e.pointerId) return;

      const moved = drag.moved;
      const v = drag.v;

      drag = null;

      if (!moved) return;

      pause();

      /* ปล่อยให้แรงสะบัดพาไปต่อได้ แต่ไม่เกินสองใบ */
      const carried = Math.max(-2, Math.min(2, v * 0.18));

      settle(Math.round(pos + carried));

    }

    frame.addEventListener("pointerup", endDrag);
    frame.addEventListener("pointercancel", endDrag);


    /* ---- วัดขนาด ----
       ความกว้างการ์ดเป็นตัวตั้งของทั้งระยะห่าง ความลึก และระยะมอง
       จึงเป็นสิ่งเดียวที่ต้องวัด และวัดเฉพาะตอนกล่องเปลี่ยนขนาดจริง ๆ */

    function measure() {

      const w = cards[0].offsetWidth;

      if (!w || w === cardWidth) return;

      cardWidth = w;

      paint();

    }

    if ("ResizeObserver" in window) {
      new ResizeObserver(measure).observe(frame);
    } else {
      window.addEventListener("resize", measure);
    }


    /* ---- เล่นเอง + วิธีหยุด (WCAG SC 2.2.2 Pause, Stop, Hide) ----

       แยกการหยุดเป็นสองชั้น เพราะเจตนาไม่เหมือนกัน:

       held   หยุดชั่วคราวและคลายเอง — ชี้เมาส์ค้าง โฟกัสอยู่ในนี้
              เลื่อนพ้นจอ หรือสลับแท็บ พอเงื่อนไขหมดไปก็เล่นต่อ
       userStopped  ผู้ใช้ลงมือคุมเอง — กดลูกศร กดจุด ลากนิ้ว หรือกดปุ่มหยุด
              จากนั้นสไลด์เป็นของผู้ใช้ไปจนกว่าจะโหลดหน้าใหม่
              เพราะรูปที่คนกำลังดูอยู่ไม่ควรถูกเลื่อนหนีไปเอง

       ไม่จำลง localStorage แล้ว: ปุ่มหยุดถูกซ่อนไว้จนกว่าจะโฟกัส
       ถ้าจำสถานะข้ามการเข้าเว็บ คนที่เผลอกดลูกศรครั้งเดียว
       จะไม่มีทางเปิดสไลด์กลับมาได้อีกเลยโดยไม่รู้ตัว */

    let userStopped = reduceMotion;

    const pauseBtn = root.querySelector(".cf-pause");

    let timer = null;

    /* เงื่อนไขที่ทำให้หยุดชั่วคราว เก็บเป็นสถานะจริงของแต่ละอย่าง
       ไม่ใช่ตัวนับ เพราะ event ที่หายไปหนึ่งครั้ง (เช่น pointerleave
       ที่ไม่ยิงตอนเมาส์ออกนอกหน้าต่าง) จะทำให้ตัวนับค้างแล้วไม่เล่นอีกเลย */
    const held = {
      offScreen: true,   /* ยังไม่รู้ว่าอยู่ในจอไหม จนกว่า observer จะบอก */
      hovering: false,
      focused: false,
      tabHidden: false
    };

    function canPlay() {

      if (userStopped) return false;

      return !held.offScreen
        && !held.hovering
        && !held.focused
        && !held.tabHidden;

    }

    function sync() {
      if (canPlay()) {
        start();
      } else {
        stop();
      }
    }

    function start() {

      if (timer) return;

      timer = setInterval(
        () => nudge(1),
        typeof HOME_GALLERY_INTERVAL !== "undefined"
          ? HOME_GALLERY_INTERVAL
          : 3600
      );

      syncLive();

    }

    function stop() {

      if (!timer) return;

      clearInterval(timer);

      timer = null;

      syncLive();

    }


    /* APG carousel: ระหว่างที่ยังหมุนเอง ต้องไม่ประกาศทุกครั้งที่เปลี่ยนรูป
       ไม่งั้นโปรแกรมอ่านหน้าจอจะพูดแทรกทุกสองวินาที
       พอหยุดแล้วค่อยเปิด live region ให้ประกาศตอนกดเลื่อนเอง */
    function syncLive() {
      track.setAttribute("aria-live", timer ? "off" : "polite");
    }

    syncLive();


    function pause() {

      if (userStopped) return;

      userStopped = true;

      stop();

      syncPauseBtn();

    }


    function syncPauseBtn() {

      if (!pauseBtn) return;

      pauseBtn.setAttribute("aria-pressed", String(!userStopped));
      pauseBtn.textContent = userStopped ? "เล่นสไลด์" : "หยุดสไลด์";

    }


    if (pauseBtn) {

      pauseBtn.addEventListener("click", () => {

        userStopped = !userStopped;

        syncPauseBtn();

        sync();

      });

      syncPauseBtn();

    }


    /* ชี้เมาส์ค้างบนแกลเลอรี = กำลังดูรูปใบนี้อยู่ ไม่ควรถูกเลื่อนหนี
       ใช้ pointerenter/leave ไม่ใช่ mouseenter เพราะนิ้วก็ยิง pointerenter
       แล้วยิง pointerleave ตามตอนยกนิ้ว จึงไม่ค้างหยุดบนมือถือ */
    root.addEventListener("pointerenter", () => {
      held.hovering = true;
      sync();
    });

    root.addEventListener("pointerleave", () => {
      held.hovering = false;
      sync();
    });

    /* โฟกัสอยู่ในแกลเลอรี = ผู้ใช้คีย์บอร์ดกำลังอ่านอยู่ตรงนี้ */
    root.addEventListener("focusin", () => {
      held.focused = true;
      sync();
    });

    root.addEventListener("focusout", () => {
      held.focused = false;
      sync();
    });


    /* ---- เริ่มทำงาน ----
       ต้องติด is-ready ก่อนวัด เพราะก่อนหน้านั้น CSS ยังจัดการ์ด
       เป็นแถบเลื่อนแนวนอน (ทางถอยของเครื่องที่ JS ไม่ทำงาน) */

    root.classList.add("is-ready");

    measure();
    paint();
    syncDots();


    /* เดินเฉพาะตอนที่แกลเลอรีอยู่ในจอ */
    if ("IntersectionObserver" in window) {

      new IntersectionObserver((entries) => {

        entries.forEach((entry) => {

          held.offScreen = !entry.isIntersecting;

          /* กล่องอาจเพิ่งได้ความกว้างจริงตอนถูกเลื่อนเข้ามา */
          if (entry.isIntersecting) measure();

          sync();

        });

      }, { threshold: 0.1 }).observe(root);

    } else {

      /* ไม่มี IntersectionObserver ก็ไม่มีทางรู้ว่าอยู่ในจอไหม — ถือว่าอยู่ */
      held.offScreen = false;

      sync();

    }


    /* สลับแท็บไปแล้วหยุดไว้ก่อน กลับมาแล้วเล่นต่อ */
    document.addEventListener("visibilitychange", () => {

      held.tabHidden = document.hidden;

      sync();

    });

  }


  /* ทุก .coverflow บนหน้าได้เครื่องยนต์ของตัวเองหนึ่งชุด
     สถานะทั้งหมดอยู่ในตัวฟังก์ชัน จึงวางหลายชั้นวางในหน้าเดียวกันได้ */
  function startAll() {

    document
      .querySelectorAll(".coverflow")
      .forEach(startCoverflow);

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startAll);
  } else {
    startAll();
  }

})();
