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

    /* ดูสถานะจริงจาก player ไม่ใช่ธงที่อาจค้างไว้
       (resumeMusic อาจถูกบล็อกโดยนโยบาย autoplay มาก่อน) */
    if (
      typeof isMusicPlaying === "function" &&
      isMusicPlaying()
    ) {

      return;

    }


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

    if (typeof seekedToStart !== "undefined") {

      seekedToStart = true;

    }


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


    /* มาจากหน้าอื่น — ถ้าเคยเปิดเสียงไว้ ให้เล่นต่อ
       (onReady ใน music.js จะจัดการกรณี player ยังไม่พร้อม) */
    if (
      typeof soundWanted === "function" &&
      soundWanted()
    ) {

      if (typeof resumeMusic === "function") {

        resumeMusic();

      }

    }


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


      /* เริ่มเปิดการ์ด — ใช้ทั้งตอนแขกกดปุ่ม และตอนครบเวลาเอง */
      let storyBegun = false;

      let autoplayTimer = null;


      async function beginStory() {

        if (storyBegun) return;

        storyBegun = true;


        clearTimeout(autoplayTimer);


        skipBtn.classList.add(
          "is-hidden"
        );


        try {


          introVideo.currentTime = 0;


          introVideo.muted = true;


          introVideo.playsInline = true;


          await introVideo.play();



          /* เริ่มเพลง
             (ถ้ามาจากการนับเวลาเอง เบราว์เซอร์อาจบล็อกเสียงไว้
              จนกว่าแขกจะแตะหน้าจอ — music.js ดักการแตะครั้งแรกไว้แล้ว) */

          startMusic();


        } catch (error) {


          console.log(
            "Video play failed:",
            error
          );


          storyBegun = false;


          skipBtn.classList.remove(
            "is-hidden"
          );

        }

      }


      skipBtn.addEventListener("click", beginStory);


      /* ไม่ได้กดอะไรใน 5 วินาที ให้เปิดการ์ดเอง
         (วิดีโอปิดเสียงอยู่ เบราว์เซอร์จึงยอมให้เล่นเองได้) */

      autoplayTimer = setTimeout(beginStory, INTRO_AUTOPLAY_MS);

    }



    /* ==========================================================
       VIDEO ENDED
       ========================================================== */

    if (introVideo) {


      introVideo.addEventListener(

        "ended",

        () => {


          /* ค้างเฟรมสุดท้ายไว้ครู่หนึ่ง ให้การ์ดที่เปิดออกอยู่ในสายตา
             ก่อนจะจางเข้าหน้าแรก */

          setTimeout(

            () => showMainContent(false),

            typeof INTRO_HOLD_MS !== "undefined"
              ? INTRO_HOLD_MS
              : 2000

          );


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

        }, 800);

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

      /* ผู้ใช้กดหยุดไว้ — การเลื่อนกลับเข้ามาในจอต้องไม่เริ่มเล่นเอง */
      if (!wantsPlay()) return;

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


    /* ---- ปุ่มหยุด/เล่น (SC 2.2.2 Pause, Stop, Hide) ----
       เนื้อหาที่ขยับเองต่อเนื่องเกินห้าวินาที ต้องมีวิธีให้ผู้ใช้หยุดได้
       wantsPlay คือความตั้งใจของผู้ใช้ แยกจาก start()/stop()
       ที่ใช้หยุดชั่วคราวตอนเลื่อนพ้นจอหรือสลับแท็บ */

    const GALLERY_KEY = "wedding-gallery";

    function wantsPlay() {
      try {
        return localStorage.getItem(GALLERY_KEY) !== "paused";
      } catch (e) {
        return true;
      }
    }

    const toggle =
      document.getElementById("galleryToggle");

    function syncToggle() {

      if (!toggle) return;

      const playing = wantsPlay();

      toggle.classList.toggle("is-paused", !playing);
      toggle.setAttribute("aria-pressed", String(playing));

      const label = toggle.querySelector(".gt-label");

      if (label) {
        label.textContent = playing ? "หยุดสไลด์" : "เล่นสไลด์";
      }

    }

    if (toggle) {

      toggle.addEventListener("click", () => {

        const nowPaused = wantsPlay();

        try {
          localStorage.setItem(
            GALLERY_KEY,
            nowPaused ? "paused" : "playing"
          );
        } catch (e) { /* โหมดส่วนตัว — ใช้ได้แค่รอบนี้ */ }

        syncToggle();

        if (nowPaused) {
          stop();
        } else {
          start();
        }

      });

      syncToggle();

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




/* ============================================================
   TYPEWRITER — ประโยคภาษาอังกฤษในฉาก blessing

   ตัดข้อความเป็นตัวอักษรทีละตัวไว้ล่วงหน้า แล้วค่อยไล่เปิดทีละตัว
   ตัวอักษรถูกจัดหน้าครบตั้งแต่แรก (แค่โปร่งใสอยู่) ข้อความจึงไม่ขยับ
   ระหว่างพิมพ์ — ไม่มี layout shift และตัดบรรทัดถูกตำแหน่งตั้งแต่ต้น

   ทำงานตามสัญญาณ reveal:change จาก main.js
   เลื่อนเข้ามา = พิมพ์ใหม่, เลื่อนพ้น = รีเซ็ต
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  const scenes = document.querySelectorAll(".is-typewriter");

  if (!scenes.length) {
    return;
  }

  /* ms ต่อหนึ่งตัวอักษร */
  const TYPE_SPEED = 26;

  /* รอโบว์กับสายริบบิ้นลงมาให้จบก่อนค่อยเริ่มพิมพ์ */
  const TYPE_START_DELAY = 900;

  const noMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window);


  scenes.forEach((scene) => {

    const target = scene.querySelector(".quote-en");

    if (!target) {
      return;
    }

    /* ไม่มีอนิเมชัน → ปล่อยข้อความไว้อย่างเดิม แล้วเปิดส่วนที่เหลือเลย */
    if (noMotion) {
      scene.classList.add("is-typed");
      return;
    }


    const text = target.textContent.replace(/\s+/g, " ").trim();

    if (!text) {
      return;
    }


    /* ---- สร้างตัวอักษร ----
       ห่อเป็นคำ (.tw-w, nowrap) เพื่อไม่ให้ตัดกลางคำตอนขึ้นบรรทัดใหม่
       ช่องว่างระหว่างคำอยู่นอกห่อ เพื่อให้ยังตัดบรรทัดตรงช่องว่างได้ */

    const words = text.split(" ");
    const chars = [];

    target.textContent = "";

    words.forEach((word, wi) => {

      const wrap = document.createElement("span");
      wrap.className = "tw-w";

      Array.from(word).forEach((ch) => {
        const s = document.createElement("span");
        s.className = "tw-c";
        s.textContent = ch;
        wrap.appendChild(s);
        chars.push(s);
      });

      target.appendChild(wrap);

      if (wi < words.length - 1) {
        const sp = document.createElement("span");
        sp.className = "tw-c";
        sp.textContent = " ";
        target.appendChild(sp);
        chars.push(sp);
      }

    });


    const caret = document.createElement("span");
    caret.className = "tw-caret";
    target.appendChild(caret);


    let rafId = null;
    let startTimer = null;
    let startedAt = 0;
    let typed = 0;


    function reset() {

      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      if (startTimer) {
        clearTimeout(startTimer);
        startTimer = null;
      }

      typed = 0;
      scene.classList.remove("is-typed");

      chars.forEach((c) => c.classList.remove("on"));

      /* พักหัวพิมพ์ไว้หน้าตัวแรก */
      if (chars[0]) {
        chars[0].before(caret);
      }

    }


    function step(now) {

      const want = Math.min(
        chars.length,
        Math.floor((now - startedAt) / TYPE_SPEED)
      );

      while (typed < want) {
        chars[typed].classList.add("on");
        typed += 1;
      }

      if (typed > 0) {
        chars[typed - 1].after(caret);
      }

      if (typed >= chars.length) {
        rafId = null;
        scene.classList.add("is-typed");
        return;
      }

      rafId = requestAnimationFrame(step);

    }


    function play() {

      reset();

      startTimer = setTimeout(() => {

        startTimer = null;

        /* เลื่อนพ้นไปแล้วระหว่างรอ → ไม่ต้องพิมพ์ */
        if (!scene.classList.contains("in-view")) {
          return;
        }

        startedAt = performance.now();
        rafId = requestAnimationFrame(step);

      }, TYPE_START_DELAY);

    }


    reset();

    scene.addEventListener("reveal:change", (e) => {

      if (e.detail && e.detail.inView) {
        play();
      } else {
        reset();
      }

    });

    /* เผื่อกรณีที่ฉากอยู่ในจอตั้งแต่แรก */
    if (scene.classList.contains("in-view")) {
      play();
    }

  });

});

/* ============================================================
   HERO MONOGRAM — วัดความยาวเส้นทางปลายปากกา

   ค่า stroke-dasharray/​dashoffset ต้องเท่ากับความยาวจริงของเส้นโค้ง
   ถ้าฝังตัวเลขไว้ใน CSS แล้ววันหลังมีคนแก้ path เส้นจะเปิดไม่หมด
   จึงวัดด้วย getTotalLength() ตอนโหลด แล้วส่งเข้า custom property
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  const strokes = document.querySelectorAll(".pen-stroke");

  strokes.forEach((p) => {

    let len = 0;

    try {
      len = p.getTotalLength();
    } catch (e) {
      /* browser เก่าวัดไม่ได้ → ปล่อยให้ค่าสำรองใน CSS ทำงาน */
      return;
    }

    if (len > 0) {
      p.style.setProperty("--len", String(Math.ceil(len)));
    }

  });

});
