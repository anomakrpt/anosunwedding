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


      daysEl.textContent = "00";

      hoursEl.textContent = "00";

      minutesEl.textContent = "00";

      secondsEl.textContent = "00";


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



    daysEl.textContent =
      days;


    hoursEl.textContent =

      String(hours)
        .padStart(2, "0");


    minutesEl.textContent =

      String(minutes)
        .padStart(2, "0");


    secondsEl.textContent =

      String(seconds)
        .padStart(2, "0");

  }



  /* ติดตั้ง interval เฉพาะหน้าที่มี countdown จริง
     (กัน interval วิ่งเปล่าตลอดไปบน wishes.html) */
  if (document.getElementById("days")) {

    updateCountdown();


    setInterval(
      updateCountdown,
      1000
    );

  }


});



