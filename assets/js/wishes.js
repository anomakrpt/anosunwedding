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


  /* โหมดเต็มจอแบบจำลอง — ใช้เมื่อเบราว์เซอร์ไม่รองรับ Fullscreen API
     (สำคัญ: iOS Safari เรียก requestFullscreen กับ element ทั่วไปไม่ได้
     ซึ่งเป็นกรณีที่จะเจอถ้าฉายจาก iPad/iPhone ในงาน) */
  let pseudoFullscreen = false;


  function setFullscreenUi(on) {

    if (!fullscreenBtn) return;

    const label =
      fullscreenBtn.querySelector(".tree-fs-label");

    if (label) {

      label.textContent = on ? "ออกจากเต็มจอ" : "เต็มจอ";

    }


    stopFullscreenPoll();

    if (on) {

      fullscreenPollTimer = setInterval(
        () => { loadWishes(); },
        FULLSCREEN_POLL_MS
      );

    }


    /* ขนาดเวทีเปลี่ยน — วาดหัวใจใหม่ให้พอดี */
    renderWishPage();

  }


  function enterPseudoFullscreen() {

    pseudoFullscreen = true;

    document.body.classList.add("wish-fs-lock");

    treeStage.classList.add("is-pseudo-fullscreen");

    setFullscreenUi(true);

  }


  function exitPseudoFullscreen() {

    pseudoFullscreen = false;

    document.body.classList.remove("wish-fs-lock");

    treeStage.classList.remove("is-pseudo-fullscreen");

    setFullscreenUi(false);

  }


  if (fullscreenBtn && treeStage) {


    fullscreenBtn.addEventListener("click", () => {


      /* กำลังเต็มจออยู่ → ออก */
      if (isFullscreen()) {

        document.exitFullscreen();

        return;

      }

      if (pseudoFullscreen) {

        exitPseudoFullscreen();

        return;

      }


      /* ลองใช้ Fullscreen API ก่อน ถ้าไม่ได้ค่อยใช้แบบจำลอง */
      if (treeStage.requestFullscreen) {

        treeStage.requestFullscreen().catch(() => {

          enterPseudoFullscreen();

        });

      } else {

        enterPseudoFullscreen();

      }

    });


    document.addEventListener("fullscreenchange", () => {

      setFullscreenUi(isFullscreen());

    });


    /* Esc ปิดโหมดจำลองได้เหมือนเต็มจอจริง */
    document.addEventListener("keydown", (event) => {

      if (
        event.key === "Escape" &&
        pseudoFullscreen
      ) {

        exitPseudoFullscreen();

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


  /* ============================================================
     TREE RENDERER

     สร้างกิ่งก้านแบบแตกกิ่งซ้ำ (recursive) ด้วยสุ่มที่ตรึงค่าไว้
     ต้นไม้จึงหน้าตาเหมือนเดิมทุกครั้งที่เปิด
     คำอวยพรแต่ละข้อ = หัวใจ 1 ดวงที่ปลายกิ่ง
     ============================================================ */

  const HEART_PATH =
    "M50 82C28 63 10 48 10 29C10 16 20 8 32 8C40 8 46 12 50 20" +
    "C54 12 60 8 68 8C80 8 90 16 90 29C90 48 72 63 50 82Z";

  const HEART_COLORS = [
    "#9fad94", /* sage   */
    "#7e824c", /* olive  */
    "#a9826a", /* brown  */
    "#cbbca4", /* cream  */
    "#c06f45"  /* copper */
  ];

  const SVG_NS = "http://www.w3.org/2000/svg";

  let treeTips = [];

  let spotlightIndex = 0;

  let spotlightTimer = null;


  /* สุ่มแบบตรึงค่า (LCG) — ผลลัพธ์เหมือนเดิมทุกครั้ง */
  function makeRng(seed) {

    let state = seed >>> 0;

    return function () {

      state = (state * 1664525 + 1013904223) >>> 0;

      return state / 4294967296;

    };

  }


  function buildTree() {

    const rng = makeRng(20270117);

    const paths = [];

    const tips = [];


    function grow(x, y, angle, len, width, depth) {

      const x2 = x + Math.cos(angle) * len;

      const y2 = y + Math.sin(angle) * len;


      /* จุดควบคุมเยื้องออกด้านข้าง ทำให้กิ่งโค้งไม่เป็นเส้นตรง */
      const bend = (rng() - 0.5) * len * 0.34;

      const mx = (x + x2) / 2 + Math.cos(angle + Math.PI / 2) * bend;

      const my = (y + y2) / 2 + Math.sin(angle + Math.PI / 2) * bend;


      paths.push({
        d:
          "M" + x.toFixed(1) + " " + y.toFixed(1) +
          " Q" + mx.toFixed(1) + " " + my.toFixed(1) +
          ", " + x2.toFixed(1) + " " + y2.toFixed(1),
        w: width
      });


      if (depth === 0) {

        tips.push({ x: x2, y: y2 });

        return;

      }


      /* กิ่งล่างแตก 2 กิ่ง กิ่งบนบางครั้งแตก 3 ให้พุ่มดูแน่น */
      const count = depth > 3 ? 2 : (rng() < 0.45 ? 3 : 2);

      const spread = 0.40 + rng() * 0.20;


      for (let i = 0; i < count; i++) {

        const offset =
          count === 1 ? 0 : (i / (count - 1)) - 0.5;

        grow(
          x2,
          y2,
          angle + offset * spread * 2 + (rng() - 0.5) * 0.16,
          len * (0.70 + rng() * 0.12),
          width * 0.66,
          depth - 1
        );

      }

    }


    grow(500, 700, -Math.PI / 2, 152, 19, 5);


    return { paths: paths, tips: tips };

  }


  function drawTree() {

    const branchGroup =
      document.getElementById("treeBranches");

    if (!branchGroup) return;


    const tree = buildTree();


    branchGroup.textContent = "";


    tree.paths.forEach((p) => {

      const el =
        document.createElementNS(SVG_NS, "path");

      el.setAttribute("d", p.d);

      el.setAttribute("stroke-width", p.w.toFixed(2));

      branchGroup.appendChild(el);

    });


    /* เก็บเฉพาะปลายกิ่งที่อยู่ในทรงพุ่มวงรี
       กันหัวใจไปเกาะกิ่งโดดที่ยื่นออกนอกพุ่ม */
    treeTips = tree.tips.filter((t) => {

      const dx = (t.x - 500) / 310;

      const dy = (t.y - 268) / 200;

      return (dx * dx + dy * dy) <= 1;

    });


    /* เรียงแบบสลับซ้าย-ขวา-กลาง เพื่อให้หัวใจกระจายทั่วพุ่ม
       ตั้งแต่ดวงแรก แทนที่จะกองอยู่ข้างเดียว */
    const rng = makeRng(777);

    treeTips.forEach((t) => { t.k = rng(); });

    treeTips.sort((a, b) => a.k - b.k);

  }


  /* ============================================================
     RENDER — วางหัวใจตามจำนวนคำอวยพร
     ============================================================ */

  function renderWishPage() {

    const heartGroup =
      document.getElementById("treeHearts");

    if (!heartGroup) return;


    if (!treeTips.length) {

      drawTree();

    }


    heartGroup.textContent = "";


    if (allWishes.length === 0) {

      showSpotlight(null);

      return;

    }


    const total =
      Math.min(allWishes.length, treeTips.length);


    for (let i = 0; i < total; i++) {

      const tip = treeTips[i];

      const wish = allWishes[i];


      const scale = 0.25 + (i % 3) * 0.032;

      const g =
        document.createElementNS(SVG_NS, "g");

      g.setAttribute("class", "wish-heart");

      g.setAttribute(
        "transform",
        "translate(" + (tip.x - 50 * scale).toFixed(1) +
        " " + (tip.y - 45 * scale).toFixed(1) +
        ") scale(" + scale.toFixed(3) + ")"
      );

      g.style.setProperty(
        "--pop-delay",
        (i * 26) + "ms"
      );


      const path =
        document.createElementNS(SVG_NS, "path");

      path.setAttribute("d", HEART_PATH);

      path.setAttribute(
        "fill",
        HEART_COLORS[i % HEART_COLORS.length]
      );

      g.appendChild(path);


      /* แตะหัวใจเพื่ออ่านคำอวยพรของคนนั้น */
      g.addEventListener("click", () => {

        spotlightIndex = i;

        showSpotlight(wish);

        restartSpotlight();

      });


      heartGroup.appendChild(g);

    }


    startSpotlight();

  }


  /* ============================================================
     SPOTLIGHT — คำอวยพรที่กำลังฉาย
     ============================================================ */

  function showSpotlight(wish) {

    const textEl =
      document.getElementById("spotlightText");

    const nameEl =
      document.getElementById("spotlightName");

    if (!textEl || !nameEl) return;


    if (!wish) {

      textEl.textContent =
        "ยังไม่มีคำอวยพรที่อนุญาตให้แสดง";

      nameEl.textContent = "";

      return;

    }


    const box =
      document.getElementById("wishSpotlight");

    if (box) {

      box.classList.remove("is-in");

      /* บังคับให้เบราว์เซอร์เริ่มอนิเมชันใหม่ */
      void box.offsetWidth;

      box.classList.add("is-in");

    }


    textEl.textContent =
      "“" + String(wish.wish || "") + "”";

    nameEl.textContent =
      "— " + String(wish.name || "Guest");

  }


  function startSpotlight() {

    stopSpotlight();


    if (allWishes.length === 0) return;


    showSpotlight(allWishes[spotlightIndex % allWishes.length]);


    if (allWishes.length < 2) return;


    spotlightTimer = setInterval(() => {

      spotlightIndex =
        (spotlightIndex + 1) % allWishes.length;

      showSpotlight(allWishes[spotlightIndex]);

    }, WISHES_INTERVAL);

  }


  function stopSpotlight() {

    if (spotlightTimer) {

      clearInterval(spotlightTimer);

      spotlightTimer = null;

    }

  }


  function restartSpotlight() {

    stopSpotlight();

    startSpotlight();

  }


  /* ============================================================
     START

     ไม่ต้องแบ่งหน้าแล้ว — หัวใจขึ้นครบทุกดวงพร้อมกัน
     ส่วนคำอวยพรที่อ่านได้จะหมุนเปลี่ยนใน spotlight เอง
     ============================================================ */

  function startWishLoop() {

    renderWishPage();

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

