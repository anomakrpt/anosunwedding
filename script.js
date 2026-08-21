/* ============================================================
   GLOBAL
   ============================================================ */

let player;
let playerReady = false;
let musicStarted = false;


/* ============================================================
   YOUTUBE MUSIC
   ============================================================ */

const VIDEO_ID = "lqWP-nJF0kA";
const START_SECONDS = 28;


/* ============================================================
   YOUTUBE PLAYER
   ============================================================ */

window.onYouTubeIframeAPIReady = function () {

  player = new YT.Player("youtube-player", {

    height: "1",
    width: "1",

    videoId: VIDEO_ID,

    playerVars: {

      autoplay: 0,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1

    },

    events: {

      onReady: () => {

        playerReady = true;

      }

    }

  });

};


/* ============================================================
   INDEX.HTML
   INTRO + MUSIC + MENU + COUNTDOWN
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


  const mapBtn =
    document.querySelector(".map-btn");



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

    }, 800);

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

  if (mapBtn) {


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

  }



  /* ============================================================
     COUNTDOWN
     17 JANUARY 2027 - 10:00
     ============================================================ */

  const targetDate =

    new Date(
      "2027-01-17T10:00:00"
    ).getTime();



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



  updateCountdown();


  setInterval(
    updateCountdown,
    1000
  );


});



/* ============================================================
   ============================================================
   WISHES PAGE
   ============================================================
   ============================================================ */


document.addEventListener("DOMContentLoaded", () => {


  /* ============================================================
     ตรวจว่าเป็น wishes.html หรือไม่

     ถ้าไม่มี #wishForm
     โค้ด Wishes จะไม่ทำงาน
     ============================================================ */

  const wishForm =
    document.getElementById("wishForm");


  if (!wishForm) return;



  /* ============================================================
     GOOGLE APPS SCRIPT WEB APP

     URL ของคุณใส่ไว้แล้ว
     ============================================================ */

  const WISHES_API_URL =

    "https://script.google.com/macros/s/AKfycbywM1mDbhshGlLx5tFYuOcGAyJUVF5BoyDVFI4msBVKGsm9WLwDWKESisH6rZ4EEkGorQ/exec";



  /* ============================================================
     AUTO LOOP SETTINGS

     15 คำอวยพร / 1 ชุด
     เปลี่ยนทุก 15 วินาที
     ============================================================ */

  const WISHES_PER_PAGE = 9;

  const WISHES_INTERVAL = 15000;

  const WISH_FADE_TIME = 1;



  /* ============================================================
     ELEMENTS
     ============================================================ */

  const nameInput =
    document.getElementById("name");


  const wishInput =
    document.getElementById("wish");


  const allowDisplayInput =
    document.getElementById("allowDisplay");


  const countEl =
    document.getElementById("count");


  const submitBtn =
    document.getElementById("submitBtn");


  const formMessage =
    document.getElementById("formMessage");


  const wishesGrid =
    document.getElementById("wishesGrid");


  const reloadBtn =
    document.getElementById("reloadBtn");


  const toast =
    document.getElementById("toast");



  /* ============================================================
     LOOP STATE
     ============================================================ */

  let allWishes = [];

  let currentWishPage = 0;

  let wishLoopTimer = null;

  let resizeTimer = null;



  /* ============================================================
     CHARACTER COUNTER
     ============================================================ */

  if (
    wishInput &&
    countEl
  ) {


    wishInput.addEventListener(

      "input",

      () => {


        countEl.textContent =
          wishInput.value.length;


      }

    );

  }



  /* ============================================================
     TOAST
     ============================================================ */

  function showWishToast(text) {


    if (!toast) return;


    toast.textContent = text;


    toast.classList.add(
      "show"
    );


    clearTimeout(
      showWishToast.timer
    );


    showWishToast.timer =

      setTimeout(

        () => {


          toast.classList.remove(
            "show"
          );


        },

        2600

      );

  }



  /* ============================================================
     FORM MESSAGE
     ============================================================ */

  function showWishMessage(
    text,
    type = "ok"
  ) {


    if (!formMessage) return;


    formMessage.textContent =
      text;


    formMessage.className =
      `message show ${type}`;

  }



  /* ============================================================
     SEND WISH
     ส่งคำอวยพรไป Google Sheet
     ============================================================ */

  async function sendWish(payload) {


    const response =

      await fetch(

        WISHES_API_URL,

        {

          method: "POST",


          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },


          body:
            JSON.stringify(payload)

        }

      );



    if (!response.ok) {


      throw new Error(
        "Network error"
      );


    }



    return response.json();

  }



  /* ============================================================
     SUBMIT WISH
     ============================================================ */

  wishForm.addEventListener(

    "submit",

    async (event) => {


      event.preventDefault();



      const name =

        nameInput

          ? nameInput.value.trim()

          : "";



      const wish =

        wishInput

          ? wishInput.value.trim()

          : "";



      /* ----------------------------------------------------------
         Validation
         ---------------------------------------------------------- */

      if (
        !name ||
        !wish
      ) {


        showWishMessage(

          "กรุณากรอกชื่อและคำอวยพรให้ครบ",

          "error"

        );


        return;

      }



      /* ----------------------------------------------------------
         Disable button
         ---------------------------------------------------------- */

      if (submitBtn) {


        submitBtn.disabled = true;


        submitBtn.textContent =
          "กำลังส่ง...";


      }



      try {


        /* ========================================================
           CHECKBOX

           ติ๊ก
           -> allowDisplay = true
           -> Status ALLOW

           ไม่ติ๊ก
           -> allowDisplay = false
           -> Status HIDE
           ======================================================== */


        const result =

          await sendWish({

            name: name,

            wish: wish,

            allowDisplay:

              allowDisplayInput

                ? allowDisplayInput.checked

                : false

          });



        if (!result.success) {


          throw new Error(

            result.message ||
            "Save failed"

          );


        }



        /* ========================================================
           SUCCESS
           ======================================================== */

        wishForm.reset();



        if (countEl) {

          countEl.textContent = "0";

        }



        showWishMessage(

          "ส่งคำอวยพรเรียบร้อยแล้ว ♡",

          "ok"

        );



        showWishToast(

          "ขอบคุณสำหรับคำอวยพร ♡"

        );



        /* โหลดข้อมูลใหม่ */

        await loadWishes();



      } catch (error) {


        console.error(

          "Wish submit error:",

          error

        );



        showWishMessage(

          "ส่งคำอวยพรไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",

          "error"

        );



      } finally {


        if (submitBtn) {


          submitBtn.disabled = false;


          submitBtn.innerHTML =
            "➤ &nbsp; ส่งคำอวยพร";


        }

      }

    }

  );



  /* ============================================================
     SECURITY
     ป้องกัน HTML / Script Injection
     ============================================================ */

  function escapeWishHtml(
    value = ""
  ) {


    return String(value)

      .replaceAll(
        "&",
        "&amp;"
      )

      .replaceAll(
        "<",
        "&lt;"
      )

      .replaceAll(
        ">",
        "&gt;"
      )

      .replaceAll(
        '"',
        "&quot;"
      )

      .replaceAll(
        "'",
        "&#039;"
      );

  }



  /* ============================================================
     SHUFFLE
     ============================================================ */

  function shuffleWishes(array) {


    const result =
      [...array];



    for (

      let i =
        result.length - 1;

      i > 0;

      i--

    ) {


      const j =

        Math.floor(

          Math.random() *
          (i + 1)

        );



      [
        result[i],
        result[j]
      ] = [
          result[j],
          result[i]
        ];

    }



    return result;

  }



  /* ============================================================
     DESKTOP LAYOUT
     15 ตำแหน่ง
     ============================================================ */

  function getWishDesktopLayout(index) {


    const layouts = [


      {
        left: 1,
        top: 0,
        size: "sm"
      },


      {
        left: 31,
        top: 35,
        size: "lg"
      },


      {
        left: 76,
        top: 14,
        size: "sm"
      },


      {
        left: 0,
        top: 195,
        size: ""
      },


      {
        left: 72,
        top: 210,
        size: "sm"
      },


      {
        left: 31,
        top: 315,
        size: ""
      },


      {
        left: 79,
        top: 390,
        size: ""
      },


      {
        left: 4,
        top: 455,
        size: "sm"
      },


      {
        left: 37,
        top: 535,
        size: "sm"
      },


      {
        left: 75,
        top: 585,
        size: "sm"
      },


      {
        left: 1,
        top: 650,
        size: "lg"
      },


      {
        left: 52,
        top: 705,
        size: "sm"
      },


      {
        left: 77,
        top: 785,
        size: ""
      },


      {
        left: 5,
        top: 855,
        size: "sm"
      },


      {
        left: 34,
        top: 900,
        size: "lg"
      }

    ];



    return layouts[
      index %
      layouts.length
    ];

  }



  /* ============================================================
     MOBILE LAYOUT
     15 ตำแหน่ง
     ============================================================ */

  function getWishMobileLayout(index) {


    const layouts = [


      {
        left: 0,
        top: 0,
        size: "sm"
      },


      {
        left: 35,
        top: 48,
        size: "lg"
      },


      {
        left: 58,
        top: 0,
        size: "sm"
      },


      {
        left: 0,
        top: 190,
        size: ""
      },


      {
        left: 58,
        top: 225,
        size: "sm"
      },


      {
        left: 26,
        top: 360,
        size: ""
      },


      {
        left: 57,
        top: 470,
        size: ""
      },


      {
        left: 0,
        top: 510,
        size: "sm"
      },


      {
        left: 31,
        top: 650,
        size: "sm"
      },


      {
        left: 58,
        top: 735,
        size: "sm"
      },


      {
        left: 1,
        top: 790,
        size: "lg"
      },


      {
        left: 56,
        top: 930,
        size: "sm"
      },


      {
        left: 4,
        top: 1010,
        size: ""
      },


      {
        left: 48,
        top: 1110,
        size: ""
      },


      {
        left: 10,
        top: 1220,
        size: "sm"
      }

    ];



    return layouts[
      index %
      layouts.length
    ];

  }



  /* ============================================================
     RENDER CURRENT PAGE

     ตัวอย่าง:

     page 0
     -> Wishes 1-15

     page 1
     -> Wishes 16-30

     page 2
     -> Wishes 31-45
     ============================================================ */

  function renderWishPage() {


    if (!wishesGrid) return;



    /* ----------------------------------------------------------
       ไม่มีข้อมูล
       ---------------------------------------------------------- */

    if (
      allWishes.length === 0
    ) {


      wishesGrid.innerHTML = `

        <div class="no-wishes">

          ยังไม่มีคำอวยพรที่อนุญาตให้แสดง

        </div>

      `;


      return;

    }



    /* ----------------------------------------------------------
       คำนวณข้อมูลชุดปัจจุบัน
       ---------------------------------------------------------- */

    const start =

      currentWishPage *
      WISHES_PER_PAGE;



    const end =

      start +
      WISHES_PER_PAGE;



    const currentItems =

      allWishes.slice(

        start,

        end

      );



    /* ==========================================================
       FADE OUT
       ========================================================== */

    wishesGrid.classList.add(
      "changing"
    );



    setTimeout(() => {


      wishesGrid.innerHTML = "";



      const isMobile =

        window.matchMedia(

          "(max-width: 700px)"

        ).matches;



      /* ========================================================
         CREATE CARDS
         ======================================================== */

      currentItems.forEach(

        (item, index) => {


          const position =

            isMobile

              ? getWishMobileLayout(
                index
              )

              : getWishDesktopLayout(
                index
              );



          const card =

            document.createElement(
              "article"
            );



          card.className =

            `wish-card ${position.size

              ? "size-" +
              position.size

              : ""
            }`;



          card.style.left =

            position.left +
            "%";



          card.style.top =

            position.top +
            "px";



          /* ------------------------------------------------------
             Animation delay
             ทำให้แต่ละใบลอยไม่พร้อมกัน
             ------------------------------------------------------ */

          card.style.animationDelay =

            `${(index % 5) *
            -1.15
            }s`;



          /* ======================================================
             CARD CONTENT
             ====================================================== */

          card.innerHTML = `


            <div class="quote">

              “

            </div>



            <div class="wish-text">

              ${escapeWishHtml(
            item.wish
          )}

            </div>



            <div class="wish-footer">


              <span class="wish-heart">

                ♥

              </span>


              <span class="wish-name">

                ${escapeWishHtml(

            item.name ||
            "Guest"

          )}

              </span>


            </div>


          `;



          wishesGrid.appendChild(
            card
          );


        }

      );



      /* ========================================================
         FADE IN
         ======================================================== */

      requestAnimationFrame(() => {


        wishesGrid.classList.remove(
          "changing"
        );


      });



    }, WISH_FADE_TIME);

  }



  /* ============================================================
     NEXT WISH PAGE
     ============================================================ */

  function nextWishPage() {


    if (
      allWishes.length === 0
    ) {

      return;

    }



    const totalPages =

      Math.ceil(

        allWishes.length /
        WISHES_PER_PAGE

      );



    currentWishPage++;



    /* ==========================================================
       ครบทุกชุดแล้ว

       -> กลับชุดแรก
       -> Shuffle ใหม่
       -> เริ่มรอบใหม่
       ========================================================== */

    if (
      currentWishPage >=
      totalPages
    ) {


      currentWishPage = 0;


      allWishes =

        shuffleWishes(
          allWishes
        );

    }



    renderWishPage();

  }



  /* ============================================================
     START AUTO LOOP
     ============================================================ */

  function startWishLoop() {


    /* ----------------------------------------------------------
       ล้าง timer เก่าก่อน
       ป้องกันการมี loop ซ้อนกัน
       ---------------------------------------------------------- */

    if (wishLoopTimer) {


      clearInterval(
        wishLoopTimer
      );


      wishLoopTimer = null;

    }



    /* แสดงชุดแรก */

    renderWishPage();



    /* ----------------------------------------------------------
       ถ้ามี 15 ข้อหรือน้อยกว่า
       ไม่ต้องเปลี่ยนชุด
       ---------------------------------------------------------- */

    if (
      allWishes.length <=
      WISHES_PER_PAGE
    ) {


      return;

    }



    /* ==========================================================
       AUTO LOOP

       เปลี่ยนชุดทุก 15 วินาที
       ========================================================== */

    wishLoopTimer =

      setInterval(

        nextWishPage,

        WISHES_INTERVAL

      );

  }



  /* ============================================================
     LOAD WISHES FROM GOOGLE SHEET
     ============================================================ */

  async function loadWishes() {


    /* ----------------------------------------------------------
       Loading button
       ---------------------------------------------------------- */

    if (reloadBtn) {


      reloadBtn.disabled = true;


      reloadBtn.textContent =
        "กำลังโหลด...";

    }



    try {


      /* ========================================================
         FETCH GOOGLE SHEET

         ts = ป้องกัน browser cache
         ======================================================== */

      const response =

        await fetch(

          `${WISHES_API_URL}?action=list&ts=${Date.now()}`,

          {

            method: "GET",

            cache: "no-store"

          }

        );



      if (!response.ok) {


        throw new Error(
          "Network error"
        );

      }



      const data =

        await response.json();



      if (!data.success) {


        throw new Error(

          data.message ||
          "Load failed"

        );

      }



      /* ========================================================
        Wishes ทั้งหมด คำอวยพรล่าสุดขึ้นก่อน

        Apps Script ของเราส่งข้อมูลใหม่สุดมาก่อนอยู่แล้ว
         Apps Script จะส่งมาเฉพาะ Status = ALLOW
        ดังนั้นรอบแรกไม่ต้อง Shuffle
      ======================================================== */

      allWishes =
        data.items || [];


      /* เริ่มจากชุดแรก = คำอวยพรล่าสุด */
      currentWishPage = 0;


      /* เริ่ม Auto Loop */
      startWishLoop();







    } catch (error) {


      console.error(

        "Wish load error:",

        error

      );



      /* ----------------------------------------------------------
         หยุด Loop ถ้าโหลดไม่ได้
         ---------------------------------------------------------- */

      if (wishLoopTimer) {


        clearInterval(
          wishLoopTimer
        );


        wishLoopTimer = null;

      }



      if (wishesGrid) {


        wishesGrid.innerHTML = `

          <div class="no-wishes">

            โหลดคำอวยพรไม่สำเร็จ

          </div>

        `;

      }



    } finally {


      if (reloadBtn) {


        reloadBtn.disabled = false;


        reloadBtn.innerHTML =

          "↻ &nbsp; โหลดคำอวยพรใหม่";

      }

    }

  }



  /* ============================================================
     RELOAD BUTTON
     ============================================================ */

  if (reloadBtn) {


    reloadBtn.addEventListener(

      "click",

      loadWishes

    );

  }



  /* ============================================================
     RESPONSIVE

     ถ้าหมุนมือถือ / ปรับขนาด browser
     จัดตำแหน่งชุดปัจจุบันใหม่

     ไม่โหลด Google Sheet ใหม่
     ============================================================ */

  window.addEventListener(

    "resize",

    () => {


      clearTimeout(
        resizeTimer
      );



      resizeTimer =

        setTimeout(

          () => {


            renderWishPage();


          },

          300

        );

    }

  );



  /* ============================================================
     INITIAL LOAD
     ============================================================ */

  loadWishes();


});

/* =========================================================
   PHOTO GALLERY
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const mainPhoto = document.getElementById("mainPhoto");
  const prevBtn = document.getElementById("photoPrev");
  const nextBtn = document.getElementById("photoNext");
  const thumbnailTrack = document.getElementById("photoThumbnailTrack");
  const dotsContainer = document.getElementById("photoDots");

  // ถ้าไม่ใช่หน้า photo.html
  if (
    !mainPhoto ||
    !prevBtn ||
    !nextBtn ||
    !thumbnailTrack ||
    !dotsContainer
  ) {
    return;
  }


  /* =======================================================
     รายการรูปภาพ
     เพิ่มรูปได้เรื่อย ๆ
  ======================================================== */

  const photos = [
    "pic/photo/photo-01.jpg",
    "pic/photo/photo-02.jpg",
    "pic/photo/photo-03.jpg",
    "pic/photo/photo-04.jpg",
    "pic/photo/photo-05.jpg",
    "pic/photo/photo-06.jpg",
    "pic/photo/photo-07.jpg",
    "pic/photo/photo-08.jpg",
    "pic/photo/photo-09.jpg",
    "pic/photo/photo-10.jpg",
    "pic/photo/photo-11.jpg"
  ];


  let currentIndex = 0;


  /* =======================================================
     CREATE THUMBNAILS
  ======================================================== */

  photos.forEach(function (photo, index) {

    const thumbnailButton = document.createElement("button");

    thumbnailButton.type = "button";
    thumbnailButton.className = "photo-thumbnail";

    const thumbnailImage = document.createElement("img");

    thumbnailImage.src = photo;
    thumbnailImage.alt = "Photo " + (index + 1);

    thumbnailButton.appendChild(thumbnailImage);

    thumbnailButton.addEventListener("click", function () {

      showPhoto(index);

    });

    thumbnailTrack.appendChild(thumbnailButton);

  });


  /* =======================================================
     CREATE DOTS
  ======================================================== */

  photos.forEach(function (_, index) {

    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "photo-dot";

    dot.setAttribute(
      "aria-label",
      "View photo " + (index + 1)
    );

    dot.addEventListener("click", function () {

      showPhoto(index);

    });

    dotsContainer.appendChild(dot);

  });


  const thumbnails =
    thumbnailTrack.querySelectorAll(".photo-thumbnail");

  const dots =
    dotsContainer.querySelectorAll(".photo-dot");


  /* =======================================================
     SHOW PHOTO
  ======================================================== */

  function showPhoto(index) {

    // ถ้าเลื่อนไปก่อนรูปแรก
    if (index < 0) {
      index = photos.length - 1;
    }

    // ถ้าเลื่อนไปหลังรูปสุดท้าย
    if (index >= photos.length) {
      index = 0;
    }

    currentIndex = index;


    /* Fade รูป */
    mainPhoto.classList.add("changing");

    setTimeout(function () {

      mainPhoto.src = photos[currentIndex];

      mainPhoto.classList.remove("changing");

    }, 180);


    /* Thumbnail active */
    thumbnails.forEach(function (thumbnail, i) {

      thumbnail.classList.toggle(
        "active",
        i === currentIndex
      );

    });


    /* Dot active */
    dots.forEach(function (dot, i) {

      dot.classList.toggle(
        "active",
        i === currentIndex
      );

    });


    /* =====================================================
       เลื่อน thumbnail ให้รูปที่เลือกอยู่กลางหน้าจอ
    ====================================================== */

    const activeThumbnail =
      thumbnails[currentIndex];

    if (activeThumbnail) {

      activeThumbnail.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      });

    }

  }


  /* =======================================================
     NEXT
  ======================================================== */

  nextBtn.addEventListener("click", function () {

    showPhoto(currentIndex + 1);

  });


  /* =======================================================
     PREVIOUS
  ======================================================== */

  prevBtn.addEventListener("click", function () {

    showPhoto(currentIndex - 1);

  });


  /* =======================================================
     SWIPE ON MOBILE
  ======================================================== */

  let touchStartX = 0;
  let touchEndX = 0;


  mainPhoto.addEventListener(
    "touchstart",
    function (event) {

      touchStartX =
        event.changedTouches[0].screenX;

    },
    {
      passive: true
    }
  );


  mainPhoto.addEventListener(
    "touchend",
    function (event) {

      touchEndX =
        event.changedTouches[0].screenX;

      handleSwipe();

    },
    {
      passive: true
    }
  );


  function handleSwipe() {

    const swipeDistance =
      touchStartX - touchEndX;


    // swipe left
    if (swipeDistance > 50) {

      showPhoto(currentIndex + 1);

    }


    // swipe right
    if (swipeDistance < -50) {

      showPhoto(currentIndex - 1);

    }

  }


  /* =======================================================
     INITIAL PHOTO
  ======================================================== */

  showPhoto(0);

});