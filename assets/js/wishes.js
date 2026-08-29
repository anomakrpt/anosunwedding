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

  const WISHES_API_URL = APPS_SCRIPT_URL;



  /* ============================================================
     AUTO LOOP SETTINGS

     9 คำอวยพร / 1 ชุด
     เปลี่ยนทุก 5 วินาที
     ============================================================ */






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


    /* ใช้ .replace(/…/g) แทน replaceAll เพื่อรองรับ Safari เก่า */
    return String(value)

      .replace(
        /&/g,
        "&amp;"
      )

      .replace(
        /</g,
        "&lt;"
      )

      .replace(
        />/g,
        "&gt;"
      )

      .replace(
        /"/g,
        "&quot;"
      )

      .replace(
        /'/g,
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
                <img src="pic/icon-like.png" alt="" />
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

  /* กันยิงซ้ำระหว่างที่คำขอเก่ายังไม่จบ */
  let wishesLoading = false;


  async function loadWishes() {


    if (wishesLoading) {
      return;
    }

    wishesLoading = true;


    /* ตัดคำขอทิ้งถ้าเกิน 15 วินาที — กันปุ่มค้าง "กำลังโหลด..." */
    const abortCtrl = new AbortController();

    const abortTimer = setTimeout(
      () => abortCtrl.abort(),
      15000
    );


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

            cache: "no-store",

            signal: abortCtrl.signal

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


      clearTimeout(abortTimer);

      wishesLoading = false;


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

