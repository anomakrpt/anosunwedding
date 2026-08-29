/* ============================================================
   HOME — intro video, skip, countdown, map buttons (index.html)
============================================================ */

document.addEventListener("DOMContentLoaded", () => {


  const intro =
    document.getElementById("intro");


  const introVideo =
    document.getElementById("introVideo");


  const main =
    document.getElementById("main");


  const skipBtn =
    document.getElementById("skipBtn");


  const menuBtn =
    document.getElementById("menuBtn");


  const mobileMenu =
    document.getElementById("mobileMenu");


  /* ใช้ querySelectorAll — หน้าแรกมีปุ่มแผนที่ 2 ปุ่ม (สถานที่ + ที่จอดรถ) */
  const mapBtns =
    document.querySelectorAll(".map-btn");



  /* ============================================================
     SKIP INTRO

     ใช้สำหรับลิงก์จากหน้าอื่น เช่น:

     index.html?skipIntro=1#home
     index.html?skipIntro=1#story
     index.html?skipIntro=1#details
     index.html?skipIntro=1#location
     ============================================================ */

  const urlParams =
    new URLSearchParams(
      window.location.search
    );


  const skipIntro =
    urlParams.get("skipIntro") === "1";



  /* ============================================================
     PREPARE INTRO VIDEO
     ============================================================ */

  if (
    introVideo &&
    !skipIntro
  ) {

    introVideo.muted = true;

    introVideo.playsInline = true;

    introVideo.preload = "auto";

    introVideo.load();

  }



  /* ============================================================
     MUSIC
     ============================================================ */

  function startMusic() {

    if (musicStarted) return;


    if (
      !playerReady ||
      !player
    ) {

      setTimeout(
        startMusic,
        300
      );

      return;

    }


    musicStarted = true;


    player.seekTo(
      START_SECONDS,
      true
    );


    player.setVolume(0);

    player.playVideo();


    /* Fade เพลง */

    let vol = 0;


    const fade =
      setInterval(() => {

        if (vol < 30) {

          vol += 2;

          player.setVolume(vol);

        } else {

          clearInterval(fade);

        }

      }, 200);

  }



  /* ============================================================
     SHOW MAIN CONTENT

     immediate = true
     -> ข้าม Intro ทันที

     immediate = false
     -> Fade Intro ก่อนเข้าเว็บ
     ============================================================ */

  function showMainContent(
    immediate = false
  ) {

    if (main) {

      main.style.display = "block";


      /* จังหวะเปิดตัว hero (ดู HERO ENTRANCE ใน home.css)
         ใส่ class หลัง display เปลี่ยนแล้ว 1 เฟรม
         เพื่อให้ animation เริ่มนับจากตอนที่มองเห็นจริง */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          main.classList.add("enter");
        });
      });

    }


    if (!intro) return;


    if (immediate) {

      intro.style.display = "none";

      intro.style.opacity = "0";

      return;

    }


    intro.style.opacity = "0";


    setTimeout(() => {

      intro.style.display = "none";

    }, 1100); /* ให้ตรงกับ transition 1.1s ของ #intro */

  }



  /* ============================================================
     ถ้ามาจาก WISHES / PHOTOS
     ให้ข้าม Intro ทั้งก้อน
     ============================================================ */

  if (skipIntro) {


    if (introVideo) {

      introVideo.pause();

    }


    showMainContent(true);


    /* ----------------------------------------------------------
       ตอนโหลด #main ยัง display:none ทำให้ browser scroll ไป
       hash ไม่ได้ — เลื่อนไปเองหลังแสดงเนื้อหาแล้ว
       ---------------------------------------------------------- */
    if (window.location.hash) {

      const target =
        document.querySelector(window.location.hash);

      if (target) {

        requestAnimationFrame(() => {
          target.scrollIntoView();
        });

      }

    }


    /* ----------------------------------------------------------
       ลบ ?skipIntro=1 ออกจาก URL

       แต่เก็บ #story / #location ฯลฯ ไว้
       ---------------------------------------------------------- */

    const cleanUrl =

      window.location.pathname +

      window.location.hash;


    window.history.replaceState(

      {},

      document.title,

      cleanUrl

    );


  } else {


    /* ==========================================================
       INTRO ปกติ
       ========================================================== */

    if (
      skipBtn &&
      introVideo
    ) {


      skipBtn.addEventListener(

        "click",

        async () => {


          skipBtn.classList.add(
            "is-hidden"
          );


          try {


            introVideo.currentTime = 0;


            introVideo.muted = true;


            introVideo.playsInline = true;


            await introVideo.play();



            /* เริ่มเพลง */

            startMusic();


          } catch (error) {


            console.log(
              "Video play failed:",
              error
            );


            skipBtn.classList.remove(
              "is-hidden"
            );

          }

        }

      );

    }



    /* ==========================================================
       VIDEO ENDED
       ========================================================== */

    if (introVideo) {


      introVideo.addEventListener(

        "ended",

        () => {


          showMainContent(false);


        }

      );


    } else {


      /* ไม่มี video
         ไม่ให้เว็บค้าง */

      if (intro) {

        showMainContent(true);

      }

    }

  }



  /* ============================================================
     MOBILE MENU
     ============================================================ */

  if (
    menuBtn &&
    mobileMenu
  ) {


    menuBtn.addEventListener(

      "click",

      () => {


        mobileMenu.classList.toggle(
          "show"
        );


      }

    );

  }



  const menuLinks =

    document.querySelectorAll(
      ".mobile-menu a"
    );


  menuLinks.forEach(

    (link) => {


      link.addEventListener(

        "click",

        () => {


          if (mobileMenu) {

            mobileMenu.classList.remove(
              "show"
            );

          }


        }

      );

    }

  );



  /* ============================================================
     MAP BUTTON
     ============================================================ */

  mapBtns.forEach((mapBtn) => {


    mapBtn.addEventListener(

      "click",

      (event) => {


        const href =

          mapBtn.getAttribute(
            "href"
          );


        if (
          !href ||
          href === "#"
        ) {


          event.preventDefault();


          alert(
            "ใส่ลิงก์ Google Maps ในปุ่ม View Map ก่อน"
          );


        }

      }

    );

  });



  /* ============================================================
     SPLIT-FLAP — ตัวเลขพลิกแบบป้ายบอกเวลาในสนามบิน

     setFlapNumber(el, "07") จะสร้าง/อัปเดตแผ่นพลิกใน el
     พลิกเฉพาะหลักที่ค่าเปลี่ยนจริง หลักที่เหมือนเดิมอยู่นิ่ง
     ============================================================ */

  const FLAP_FLIP_MS = 520; /* ให้ตรงกับ .26s + .26s ใน home.css */

  const flapReduceMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  function buildFlap(digit) {

    const flap = document.createElement("span");

    flap.className = "flap";

    flap.dataset.value = digit;


    flap.innerHTML =
      '<span class="flap__half flap__half--top"><i></i></span>' +
      '<span class="flap__half flap__half--bottom"><i></i></span>';


    flap.querySelector(".flap__half--top > i").textContent = digit;

    flap.querySelector(".flap__half--bottom > i").textContent = digit;


    return flap;

  }


  function flipFlap(flap, next) {

    const prev = flap.dataset.value;

    if (prev === next) return;

    flap.dataset.value = next;


    const topStatic =
      flap.querySelector(".flap__half--top > i");

    const bottomStatic =
      flap.querySelector(".flap__half--bottom > i");


    /* ปิดอนิเมชัน → เปลี่ยนเลขตรง ๆ */
    if (flapReduceMotion) {

      topStatic.textContent = next;

      bottomStatic.textContent = next;

      return;

    }


    /* ถ้ายังมีแผ่นค้างจากรอบก่อน ให้เก็บกวาดก่อน */
    const stale =
      flap.querySelectorAll(".flap__fold");

    stale.forEach((el) => el.remove());


    /* ครึ่งบนเปลี่ยนเป็นค่าใหม่ทันที — จะถูกเผยเมื่อแผ่นเก่าพลิกพ้น */
    topStatic.textContent = next;


    const foldTop =
      document.createElement("span");

    foldTop.className = "flap__fold flap__fold--top";

    foldTop.innerHTML = "<i></i>";

    foldTop.firstChild.textContent = prev;


    const foldBottom =
      document.createElement("span");

    foldBottom.className = "flap__fold flap__fold--bottom";

    foldBottom.innerHTML = "<i></i>";

    foldBottom.firstChild.textContent = next;


    flap.appendChild(foldTop);

    flap.appendChild(foldBottom);


    setTimeout(() => {

      /* แผ่นล่างลงล็อกแล้ว ค่อยเปลี่ยนครึ่งล่างจริง */
      bottomStatic.textContent = next;

      foldTop.remove();

      foldBottom.remove();

    }, FLAP_FLIP_MS);

  }


  function setFlapNumber(host, value) {

    if (!host) return;


    const text = String(value);


    let group =
      host.querySelector(".flap-group");


    /* สร้างใหม่เมื่อยังไม่มี หรือจำนวนหลักเปลี่ยน (เช่น 100 → 99) */
    if (
      !group ||
      group.children.length !== text.length
    ) {

      group = document.createElement("span");

      group.className = "flap-group";


      for (let i = 0; i < text.length; i++) {

        group.appendChild(
          buildFlap(text.charAt(i))
        );

      }


      host.textContent = "";

      host.appendChild(group);

      return;

    }


    for (let i = 0; i < text.length; i++) {

      flipFlap(
        group.children[i],
        text.charAt(i)
      );

    }

  }



  /* ============================================================
     HOME GALLERY SLIDESHOW

     กรอบ mosaic คงเดิม แต่รูปในแต่ละช่องสลับเองอัตโนมัติ
     • สลับทีละช่อง (ไล่ไปเรื่อย ๆ) ไม่เปลี่ยนพร้อมกันทั้งหมด
     • ไม่ให้รูปซ้ำกันในเวลาเดียวกัน
     • หยุดเมื่อเลื่อนพ้นจอ / สลับแท็บ เพื่อไม่กินเน็ตและแบต
     • ผู้ใช้ที่ปิดอนิเมชันจะเห็นรูปนิ่งชุดแรก
     ============================================================ */

  function startHomeGallery() {

    const tiles =
      Array.from(
        document.querySelectorAll(".gallery-item")
      );

    if (
      tiles.length === 0 ||
      typeof HOME_GALLERY_PHOTOS === "undefined"
    ) {
      return;
    }


    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (reduceMotion) return;


    const pool = HOME_GALLERY_PHOTOS;

    if (pool.length <= tiles.length) return;


    /* รูปที่กำลังโชว์อยู่ตอนนี้ (ตรงกับที่เขียนไว้ใน index.html) */
    const showing = tiles.map((tile) => {

      const img = tile.querySelector("img");

      return img ? img.getAttribute("src") : "";

    });


    /* คิวรูปที่ยังไม่ได้โชว์ */
    let queue = pool
      .map((p) => p.src)
      .filter((src) => showing.indexOf(src) === -1);

    let tileIndex = 0;

    let timer = null;


    function nextPhoto() {

      if (queue.length === 0) {

        /* ครบรอบแล้ว เติมคิวใหม่จากรูปที่ไม่ได้อยู่บนจอ */
        queue = pool
          .map((p) => p.src)
          .filter((src) => showing.indexOf(src) === -1);

      }

      return queue.shift();

    }


    function swapTile(tile, index) {

      const src = nextPhoto();

      if (!src) return;


      const meta =
        pool.find((p) => p.src === src) || { alt: "" };

      const current = tile.querySelector("img");

      if (!current) return;


      const next = document.createElement("img");

      next.src = src;

      next.alt = meta.alt || "";

      next.loading = "eager";

      next.decoding = "async";

      next.style.opacity = "0";


      next.addEventListener("load", () => {

        /* รอเฟรมถัดไปให้ browser วางภาพก่อน แล้วค่อยไล่ opacity */
        requestAnimationFrame(() => {

          requestAnimationFrame(() => {

            next.style.opacity = "1";

            current.style.opacity = "0";

          });

        });


        setTimeout(() => {

          if (current.parentNode) {

            current.remove();

          }

        }, 1200);

      }, { once: true });


      /* โหลดไม่สำเร็จ ให้ทิ้งไปเงียบ ๆ ไม่ต้องเปลี่ยนอะไร */
      next.addEventListener("error", () => {

        next.remove();

      }, { once: true });


      tile.appendChild(next);

      showing[index] = src;

    }


    function tick() {

      swapTile(
        tiles[tileIndex % tiles.length],
        tileIndex % tiles.length
      );

      tileIndex++;

    }


    function start() {

      if (timer) return;

      timer = setInterval(
        tick,
        typeof HOME_GALLERY_INTERVAL !== "undefined"
          ? HOME_GALLERY_INTERVAL
          : 3600
      );

    }


    function stop() {

      if (!timer) return;

      clearInterval(timer);

      timer = null;

    }


    /* เดินเฉพาะตอนที่แกลเลอรีอยู่ในจอ */
    const grid =
      document.querySelector(".gallery-grid");

    if (
      grid &&
      "IntersectionObserver" in window
    ) {

      new IntersectionObserver((entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            start();

          } else {

            stop();

          }

        });

      }, { threshold: 0.1 }).observe(grid);

    } else {

      start();

    }


    /* สลับแท็บไปแล้วหยุดไว้ก่อน */
    document.addEventListener("visibilitychange", () => {

      if (document.hidden) {

        stop();

      }

    });

  }


  startHomeGallery();


  /* ============================================================
     CELEBRATION — ถึงวันงานแล้ว

     เมื่อ countdown ถึง 00:00:00:00
     • เปลี่ยนหัวข้อเป็นข้อความฉลอง
     • จุดพลุบนผ้าใบหลังตัวเลข (วาดเอง ไม่ใช้ไลบรารีภายนอก)
     • หยุด interval เพราะไม่มีอะไรให้นับต่อแล้ว

     ผู้ใช้ที่ตั้งค่า reduce motion จะเห็นข้อความอย่างเดียว ไม่มีพลุ
     ============================================================ */

  let celebrating = false;

  let countdownTimer = null;


  function celebrate() {

    if (celebrating) return;

    celebrating = true;


    /* ไม่ต้องนับต่อแล้ว */
    if (countdownTimer) {

      clearInterval(countdownTimer);

      countdownTimer = null;

    }


    const banner =
      document.getElementById("countdownBanner");

    const title =
      document.getElementById("countdownTitle");

    const message =
      document.getElementById("countdownMessage");


    if (title) {

      title.textContent = "Today Is The Day";

    }


    if (message) {

      message.textContent =
        "วันนี้คือวันของเรา — ขอบคุณที่มาร่วมเป็นส่วนหนึ่งของความทรงจำนี้";

    }


    if (banner) {

      banner.classList.add("is-celebrating");

    }


    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;


    if (!reduceMotion) {

      startFireworks();

    }

  }



  /* ============================================================
     FIREWORKS — วาดบน canvas ด้วย 2D context
     ============================================================ */

  function startFireworks() {

    const canvas =
      document.getElementById("fireworksCanvas");

    if (!canvas || !canvas.getContext) return;


    const ctx = canvas.getContext("2d");

    if (!ctx) return;


    /* สีพลุ — โทนงานแต่ง แต่เข้มพอให้เห็นชัดบนพื้นครีม */
    const COLORS = [
      "#a56a35", /* copper เข้ม */
      "#bd7466", /* rose เข้ม   */
      "#6b7a52", /* olive       */
      "#c19a4b", /* gold        */
      "#8f6f4e"  /* bronze      */
    ];


    let particles = [];

    let rockets = [];

    let width = 0;

    let height = 0;

    let dpr = 1;

    let running = true;


    function resize() {

      const rect = canvas.getBoundingClientRect();

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;

      height = rect.height;

      canvas.width = Math.round(width * dpr);

      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    }


    resize();

    window.addEventListener("resize", resize);


    function launchRocket() {

      if (!running || width === 0) return;


      rockets.push({
        x: width * (0.18 + Math.random() * 0.64),
        y: height,
        /* ระเบิดที่ความสูงช่วงบนของแบนเนอร์ */
        targetY: height * (0.18 + Math.random() * 0.3),
        vy: -(height / 46) * (0.85 + Math.random() * 0.3),
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });

    }


    function explode(x, y, color) {

      const count = 26 + Math.floor(Math.random() * 14);

      for (let i = 0; i < count; i++) {

        const angle =
          (Math.PI * 2 * i) / count +
          Math.random() * 0.2;

        const speed = 1.1 + Math.random() * 2.4;

        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.009 + Math.random() * 0.010,
          color: color,
          size: 1.7 + Math.random() * 1.7
        });

      }

    }


    function frame() {

      if (!running) return;


      /* เฟดภาพเดิมแทนการล้าง เพื่อให้เกิดหางพลุ
         ใช้ source-over ปกติ (ไม่ใช่ lighter) เพราะพื้นหลังเป็นสีครีม
         ถ้าใช้ lighter สีจะจมหายไปกับพื้น */
      ctx.globalCompositeOperation = "destination-out";

      ctx.fillStyle = "rgba(0, 0, 0, 0.09)";

      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = "source-over";


      /* จรวด */
      for (let i = rockets.length - 1; i >= 0; i--) {

        const r = rockets[i];

        r.y += r.vy;

        r.vy += 0.05;


        ctx.beginPath();

        ctx.fillStyle = r.color;

        ctx.globalAlpha = 0.95;

        ctx.shadowBlur = 8;

        ctx.shadowColor = r.color;

        ctx.arc(r.x, r.y, 2.6, 0, Math.PI * 2);

        ctx.fill();

        ctx.shadowBlur = 0;


        if (r.y <= r.targetY || r.vy >= 0) {

          explode(r.x, r.y, r.color);

          rockets.splice(i, 1);

        }

      }


      /* ประกายพลุ */
      for (let i = particles.length - 1; i >= 0; i--) {

        const p = particles[i];

        p.x += p.vx;

        p.y += p.vy;

        p.vx *= 0.985;

        p.vy = p.vy * 0.985 + 0.035; /* แรงโน้มถ่วง */

        p.life -= p.decay;


        if (p.life <= 0) {

          particles.splice(i, 1);

          continue;

        }


        ctx.beginPath();

        ctx.globalAlpha = Math.max(p.life, 0);

        ctx.fillStyle = p.color;

        ctx.shadowBlur = 7;

        ctx.shadowColor = p.color;

        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        ctx.fill();

        ctx.shadowBlur = 0;

      }


      ctx.globalAlpha = 1;

      ctx.globalCompositeOperation = "source-over";


      requestAnimationFrame(frame);

    }


    /* ยิงชุดแรกให้เห็นทันที แล้วยิงต่อเป็นระยะ */
    launchRocket();

    setTimeout(launchRocket, 420);

    setTimeout(launchRocket, 900);

    setInterval(launchRocket, 950);


    requestAnimationFrame(frame);


    /* หยุดวาดเมื่อผู้ใช้สลับแท็บไป ประหยัดแบตเตอรี่ */
    document.addEventListener("visibilitychange", () => {

      if (document.hidden) {

        running = false;

      } else if (!running) {

        running = true;

        requestAnimationFrame(frame);

      }

    });

  }



  /* ============================================================
     COUNTDOWN
     17 JANUARY 2027 - 10:00
     ============================================================ */

  const targetDate =

    new Date(WEDDING_DATE).getTime();



  function updateCountdown() {


    const daysEl =
      document.getElementById("days");


    const hoursEl =
      document.getElementById("hours");


    const minutesEl =
      document.getElementById("minutes");


    const secondsEl =
      document.getElementById("seconds");



    if (
      !daysEl ||
      !hoursEl ||
      !minutesEl ||
      !secondsEl
    ) {

      return;

    }



    const now =
      Date.now();


    const distance =
      targetDate - now;



    if (distance <= 0) {


      setFlapNumber(daysEl, "00");

      setFlapNumber(hoursEl, "00");

      setFlapNumber(minutesEl, "00");

      setFlapNumber(secondsEl, "00");


      celebrate();


      return;

    }



    const days =

      Math.floor(

        distance /

        (
          1000 *
          60 *
          60 *
          24
        )

      );



    const hours =

      Math.floor(

        (
          distance /

          (
            1000 *
            60 *
            60
          )

        ) % 24

      );



    const minutes =

      Math.floor(

        (
          distance /

          (
            1000 *
            60
          )

        ) % 60

      );



    const seconds =

      Math.floor(

        (
          distance /
          1000

        ) % 60

      );



    /* วันคงหลักไว้อย่างน้อย 2 หลัก เพื่อไม่ให้แผ่นพลิกกระตุกเวลาข้ามหลัก */
    setFlapNumber(
      daysEl,
      String(days).padStart(2, "0")
    );


    setFlapNumber(
      hoursEl,
      String(hours).padStart(2, "0")
    );


    setFlapNumber(
      minutesEl,
      String(minutes).padStart(2, "0")
    );


    setFlapNumber(
      secondsEl,
      String(seconds).padStart(2, "0")
    );

  }



  /* ติดตั้ง interval เฉพาะหน้าที่มี countdown จริง
     (กัน interval วิ่งเปล่าตลอดไปบน wishes.html) */
  if (document.getElementById("days")) {

    updateCountdown();


    /* เก็บ id ไว้ให้ celebrate() หยุดได้เมื่อถึงวันงาน */
    countdownTimer = setInterval(
      updateCountdown,
      1000
    );

  }


});



