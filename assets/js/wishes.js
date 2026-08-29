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

  /* ============================================================
     TREE GROWTH + FULLSCREEN

     • ต้นไม้โตตามจำนวนคำอวยพร ผ่านตัวแปร CSS --growth (0..1)
     • ปุ่มเต็มจอไว้ฉายบนจอในวันงาน — ขณะเต็มจอจะโหลดคำอวยพรใหม่
       เป็นระยะ เพื่อให้จอโชว์คำอวยพรที่เพิ่งส่งเข้ามาด้วย
     ============================================================ */

  const treeStage =
    document.getElementById("treeStage");

  const treeCount =
    document.getElementById("treeCount");

  const fullscreenBtn =
    document.getElementById("fullscreenBtn");


  /* จำนวนคำอวยพรที่ถือว่าต้นไม้โตเต็มที่ */
  const TREE_FULL_AT = 40;

  /* ระหว่างฉายเต็มจอ ดึงคำอวยพรใหม่ทุก 45 วินาที */
  const FULLSCREEN_POLL_MS = 45000;

  let fullscreenPollTimer = null;


  function updateTree() {

    const total = allWishes.length;


    if (treeStage) {

      const growth =
        Math.min(total / TREE_FULL_AT, 1);

      treeStage.style.setProperty(
        "--growth",
        growth.toFixed(3)
      );

    }


    if (treeCount) {

      treeCount.textContent =
        total > 0
          ? `คำอวยพร ${total} ข้อความ`
          : "";

    }

  }


  function isFullscreen() {

    return Boolean(document.fullscreenElement);

  }


  function stopFullscreenPoll() {

    if (fullscreenPollTimer) {

      clearInterval(fullscreenPollTimer);

      fullscreenPollTimer = null;

    }

  }


  if (fullscreenBtn && treeStage) {

    /* เบราว์เซอร์เก่าที่ไม่รองรับ ให้ซ่อนปุ่มไปเลย */
    if (!treeStage.requestFullscreen) {

      fullscreenBtn.hidden = true;

    } else {

      fullscreenBtn.addEventListener("click", () => {

        if (isFullscreen()) {

          document.exitFullscreen();

        } else {

          treeStage.requestFullscreen().catch((err) => {

            console.error("Fullscreen failed:", err);

          });

        }

      });

    }


    document.addEventListener("fullscreenchange", () => {

      const on = isFullscreen();


      const label =
        fullscreenBtn.querySelector(".tree-fs-label");

      if (label) {

        label.textContent = on ? "ออกจากเต็มจอ" : "เต็มจอ";

      }


      /* จัดตำแหน่งใหม่ให้พอดีกับขนาดจอที่เปลี่ยนไป */
      renderWishPage();


      stopFullscreenPoll();

      if (on) {

        fullscreenPollTimer = setInterval(
          () => { loadWishes(); },
          FULLSCREEN_POLL_MS
        );

      }

    });

  }


  /* ============================================================
     CANOPY LAYOUT

     วางคำอวยพรกระจายในทรงพุ่มของต้นไม้ ด้วยมุมทองคำ (golden angle)
     ทำให้กระจายสม่ำเสมอไม่ว่าจะมีกี่ใบ และตำแหน่งคงที่ทุกครั้ง
     (แทนตำแหน่งตายตัว 15 จุดแบบเดิม ที่ไม่พอเมื่อคำอวยพรเยอะ)
     ============================================================ */

  const GOLDEN_ANGLE = 137.507764;


  function getCanopyLayout(index, total) {

    const count = Math.max(total, 1);


    /* ระยะจากใจกลางพุ่ม — sqrt ทำให้ความหนาแน่นสม่ำเสมอ */
    const radius =
      Math.sqrt((index + 0.5) / count);

    const angle =
      (index * GOLDEN_ANGLE * Math.PI) / 180;


    /* พุ่มกว้างกว่าสูง จึงถ่วงแกน Y ให้แบนลง */
    const cx = 50 + Math.cos(angle) * radius * 42;
    const cy = 45 + Math.sin(angle) * radius * 36;


    /* สลับขนาดใบให้มีจังหวะ ใบใกล้กลางใหญ่กว่า */
    let size = "";

    if (radius < 0.42) {
      size = "lg";
    } else if (radius > 0.82) {
      size = "sm";
    }


    return {
      left: Math.min(Math.max(cx, 6), 94),
      top: Math.min(Math.max(cy, 4), 88),
      size: size
    };

  }


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




      /* ========================================================
         CREATE CARDS
         ======================================================== */

      currentItems.forEach(

        (item, index) => {


          const position =

            getCanopyLayout(
              index,
              currentItems.length
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
            "%";



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


      /* ต้นไม้โตตามจำนวนคำอวยพรที่เพิ่งโหลดมา */
      updateTree();


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

