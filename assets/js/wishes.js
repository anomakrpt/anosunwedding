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

            avatar: selectedAvatar,

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


        /* คืนค่า avatar กลับเป็นค่าเริ่มต้น */
        selectedAvatar = "";

        const avPrev = document.getElementById("avPreview");

        if (avPrev) avPrev.hidden = true;

        document
          .querySelectorAll(".av-choice[data-avatar]")
          .forEach((c, i) => {

            c.classList.toggle("is-selected", i === 0);

            c.setAttribute("aria-pressed", i === 0 ? "true" : "false");

          });



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
  /* ตอนฉายบนจอในงาน ต้องเห็นคำอวยพรใหม่ไว ๆ
     มีแค่จอเดียวที่ poll ไม่ใช่ทุกเครื่องของแขก */
  const FULLSCREEN_POLL_MS = 10000;

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

      /* ถ้าคำอวยพรมากกว่าที่ต้นไม้แขวนไหว ให้ตัวเลขบอกความจริงทั้งสองค่า
         ไม่งั้นคนอ่านจะเห็นเลขหนึ่งอย่างแต่นับหัวใจได้อีกอย่าง
         (เพดานปัจจุบันราว 381 ดวงที่ความลึกสูงสุด) */

      const shown =
        Math.min(total, treeTips.length || total);

      treeCount.textContent =
        total > 0
          ? (shown < total
              ? `คำอวยพร ${total} ข้อความ · บนต้นไม้ ${shown} ดวงล่าสุด`
              : `คำอวยพร ${total} ข้อความ`)
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

    const text = on ? "ออกจากเต็มจอ" : "แสดงเต็มจอ";

    const label =
      fullscreenBtn.querySelector(".tree-fs-label");

    if (label) {

      label.textContent = text;

    }

    /* ปุ่มเหลือแต่ไอคอน ชื่อปุ่มจึงต้องอยู่ที่ aria-label */
    fullscreenBtn.setAttribute("aria-label", text);


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
     AVATAR — รูปแทนตัวผู้เขียนคำอวยพร

     เก็บได้ 2 แบบ
       • "hiker-m" / "hiker-f" / "hiker-h"  → รูปวาดสำเร็จ
       • "data:image/jpeg;base64,..."       → เซลฟี่ที่ย่อแล้ว

     เซลฟี่ถูกย่อเป็นสี่เหลี่ยมจัตุรัส 128px ฝั่งเบราว์เซอร์ก่อนส่ง
     เพื่อให้ข้อมูลเล็กพอเก็บในเซลล์ของ Google Sheet
     ============================================================ */

  const AVATAR_SIZE = 128;

  const AVATAR_QUALITY = 0.72;

  let selectedAvatar = "";


  function isPhotoAvatar(value) {

    return typeof value === "string" &&
      value.indexOf("data:image/") === 0;

  }


  /* ย่อ + ครอปกลางเป็นสี่เหลี่ยมจัตุรัส คืนค่าเป็น data URL */
  function shrinkImage(file) {

    return new Promise((resolve, reject) => {

      const reader = new FileReader();

      reader.onerror = () => reject(new Error("read failed"));

      reader.onload = () => {

        const img = new Image();

        img.onerror = () => reject(new Error("decode failed"));

        img.onload = () => {

          const side = Math.min(img.width, img.height);

          const sx = (img.width - side) / 2;

          const sy = (img.height - side) / 2;


          const canvas = document.createElement("canvas");

          canvas.width = AVATAR_SIZE;

          canvas.height = AVATAR_SIZE;


          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("no canvas"));
            return;
          }

          ctx.drawImage(
            img,
            sx, sy, side, side,
            0, 0, AVATAR_SIZE, AVATAR_SIZE
          );


          resolve(
            canvas.toDataURL("image/jpeg", AVATAR_QUALITY)
          );

        };

        img.src = reader.result;

      };

      reader.readAsDataURL(file);

    });

  }


  /* สร้าง element สำหรับโชว์ avatar (รูปวาด = svg, เซลฟี่ = img) */
  function buildAvatarEl(value) {

    if (isPhotoAvatar(value)) {

      const img = document.createElement("img");

      img.className = "wish-avatar";

      img.src = value;

      img.alt = "";

      return img;

    }


    const known = ["hiker-m", "hiker-f", "hiker-h"];

    const id = known.indexOf(value) !== -1 ? value : "heart";


    const svg =
      document.createElementNS(SVG_NS, "svg");

    svg.setAttribute("class", "wish-avatar");

    svg.setAttribute("aria-hidden", "true");


    const use =
      document.createElementNS(SVG_NS, "use");

    use.setAttribute("href", "#av-" + id);

    svg.appendChild(use);

    return svg;

  }


  function setupAvatarPicker() {

    const choices =
      Array.from(
        document.querySelectorAll(".av-choice[data-avatar]")
      );

    const fileInput =
      document.getElementById("avatarPhoto");

    const preview =
      document.getElementById("avPreview");

    const previewImg =
      document.getElementById("avPreviewImg");

    const clearBtn =
      document.getElementById("avClear");


    if (choices.length === 0) return;


    function markSelected(el) {

      choices.forEach((c) => {

        const on = c === el;

        c.classList.toggle("is-selected", on);

        c.setAttribute("aria-pressed", on ? "true" : "false");

      });

    }


    function showPreview(dataUrl) {

      if (!preview || !previewImg) return;

      previewImg.src = dataUrl;

      preview.hidden = false;

    }


    function hidePreview() {

      if (!preview) return;

      preview.hidden = true;

    }


    choices.forEach((choice) => {

      choice.addEventListener("click", () => {

        selectedAvatar = choice.dataset.avatar || "";

        markSelected(choice);

        hidePreview();

      });

    });


    if (fileInput) {

      fileInput.addEventListener("change", async () => {

        const file = fileInput.files && fileInput.files[0];

        if (!file) return;


        try {

          const dataUrl = await shrinkImage(file);

          selectedAvatar = dataUrl;

          markSelected(null);

          showPreview(dataUrl);

        } catch (err) {

          console.error("Avatar resize failed:", err);

          showWishMessage(
            "ใช้รูปนี้ไม่ได้ ลองเลือกรูปอื่น",
            "error"
          );

        }


        /* ล้างค่า input เพื่อให้เลือกไฟล์เดิมซ้ำได้ */
        fileInput.value = "";

      });

    }


    if (clearBtn) {

      clearBtn.addEventListener("click", () => {

        selectedAvatar = "";

        hidePreview();

        markSelected(choices[0]);

      });

    }

  }


  setupAvatarPicker();


  /* ============================================================
     WISH TIP — ข้อความเต็มเมื่อชี้ (เดสก์ท็อป) หรือแตะ (มือถือ)

     แตะแล้วจะ "ปักหมุด" ไว้จนกว่าจะแตะที่อื่น
     เพื่อให้บนมือถืออ่านได้จริง ไม่หายทันทีที่ยกนิ้ว
     ============================================================ */

  let tipPinned = false;

  let tipHideTimer = null;


  function showWishTip(heartEl, wish) {

    const tip = document.getElementById("wishTip");

    const stage = document.getElementById("treeStage");

    if (!tip || !stage) return;


    clearTimeout(tipHideTimer);


    const textEl = document.getElementById("wishTipText");

    const nameEl = document.getElementById("wishTipName");

    if (textEl) {
      textEl.textContent = "“" + String(wish.wish || "") + "”";
    }

    if (nameEl) {

      nameEl.textContent = "";

      nameEl.className = "wish-tip-name wish-tip-who";

      nameEl.appendChild(
        buildAvatarEl(wish.avatar || "")
      );

      const who = document.createElement("span");

      who.textContent = String(wish.name || "Guest");

      nameEl.appendChild(who);

    }


    /* วางกล่องเหนือหัวใจ โดยอิงพิกัดเทียบกับเวที */
    const stageBox = stage.getBoundingClientRect();

    const heartBox = heartEl.getBoundingClientRect();

    let left =
      heartBox.left - stageBox.left + heartBox.width / 2;

    const top =
      heartBox.top - stageBox.top;


    /* กันกล่องล้นขอบเวทีซ้าย-ขวา */
    const half = tip.offsetWidth / 2 || 150;

    const margin = 8;

    left = Math.min(
      Math.max(left, half + margin),
      stageBox.width - half - margin
    );


    tip.style.left = left + "px";

    tip.style.top = top + "px";

    tip.classList.add("is-visible");

    tip.setAttribute("aria-hidden", "false");

  }


  function hideWishTip(immediate) {

    const tip = document.getElementById("wishTip");

    if (!tip) return;

    clearTimeout(tipHideTimer);


    const doHide = () => {

      tip.classList.remove("is-visible");

      tip.setAttribute("aria-hidden", "true");

    };


    if (immediate) {

      doHide();

    } else {

      tipHideTimer = setTimeout(doHide, 160);

    }

  }


  /* แตะที่ว่างเพื่อปิดกล่องที่ปักหมุดไว้ */
  document.addEventListener("click", (event) => {

    if (
      tipPinned &&
      !event.target.closest(".wish-heart")
    ) {

      tipPinned = false;

      hideWishTip(true);

    }

  });


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


  /* ความลึกของการแตกกิ่ง กำหนดจำนวนปลายกิ่งที่ใช้แขวนหัวใจ
     depth 5 ≈ 67 ปลาย, 6 ≈ 150, 7 ≈ 330 (โตประมาณสองเท่าครึ่งต่อชั้น) */
  function buildTree(depth) {

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


    grow(
      500, 700, -Math.PI / 2, 152, 19,
      typeof depth === "number" ? depth : 5
    );


    return { paths: paths, tips: tips };

  }


  /* ความลึกที่ใช้วาดครั้งล่าสุด — วาดใหม่เฉพาะตอนที่ต้องเปลี่ยนชั้น */
  let treeDepth = 0;

  /* ปลายกิ่งที่ใช้แขวนได้ = ปลายกิ่งที่อยู่ในทรงพุ่มวงรี
     กันหัวใจไปเกาะกิ่งโดดที่ยื่นออกนอกพุ่ม */
  function inCanopy(t) {
    const dx = (t.x - 500) / 310;
    const dy = (t.y - 268) / 200;
    return (dx * dx + dy * dy) <= 1;
  }

  /* ความลึกสูงสุด — ลึกกว่านี้จำนวนเส้นกิ่งเพิ่มเร็วกว่าที่ตาจะแยกออก */
  const MAX_TREE_DEPTH = 8;

  function drawTree(needed) {

    const branchGroup =
      document.getElementById("treeBranches");

    if (!branchGroup) return;


    /* โตจน "นับแล้วพอ" ไม่ใช่เดาจากตารางที่คำนวณไว้ล่วงหน้า

       เคยตั้งเป็นตายตัวว่า depth 6 ได้ 135 ปลาย แต่ของจริงได้ 103
       เพราะลำดับการดึงค่าจาก rng ในโค้ดจริงไม่เหมือนที่จำลองไว้
       วิธีนี้จึงสร้างแล้วนับปลายกิ่งจริง ถ้ายังไม่พอค่อยแตกเพิ่มอีกชั้น */

    const want =
      Math.max(1, typeof needed === "number" ? needed : 1);

    let depth = 5;
    let tree = buildTree(depth);
    let tips = tree.tips.filter(inCanopy);

    while (tips.length < want && depth < MAX_TREE_DEPTH) {
      depth += 1;
      tree = buildTree(depth);
      tips = tree.tips.filter(inCanopy);
    }

    treeDepth = depth;


    branchGroup.textContent = "";


    tree.paths.forEach((p, i) => {

      const el =
        document.createElementNS(SVG_NS, "path");

      el.setAttribute("d", p.d);

      el.setAttribute("stroke-width", p.w.toFixed(2));

      branchGroup.appendChild(el);


      /* กิ่งงอกทีละเส้น ไล่จากลำต้นออกไปปลายกิ่ง
         ความยาวต้องวัดจากเส้นจริง ไม่ใช่เดา ไม่งั้นบางเส้นจะเปิดไม่สุด
         (paths เรียงตามลำดับที่ grow() สร้าง = โคนก่อนปลาย) */
      let len = 0;

      try {
        len = el.getTotalLength();
      } catch (e) {
        len = 0;
      }

      if (len > 0) {
        el.style.setProperty("--len", Math.ceil(len));
        el.style.setProperty(
          "--grow-delay",
          Math.min(i * 12, 900) + "ms"
        );
        el.classList.add("is-growing");
      }

    });


    treeTips = tips;


    /* เรียงแบบสลับซ้าย-ขวา-กลาง เพื่อให้หัวใจกระจายทั่วพุ่ม
       ตั้งแต่ดวงแรก แทนที่จะกองอยู่ข้างเดียว */
    const rng = makeRng(777);

    treeTips.forEach((t) => { t.k = rng(); });

    treeTips.sort((a, b) => a.k - b.k);

  }


  /* ============================================================
     ตัดการซ้ำที่เกิดจากการอ่านข้อมูล ไม่ใช่ตัดคำอวยพรที่ซ้ำกันจริง

     สิ่งที่ตรวจพบ: API ส่งกลับ 581 แถว แต่แถวที่ 1 ถึง 580
     คือบล็อกเดียวกันขนาด 116 แถว ส่งซ้ำ 5 รอบ
     (สำเนาแต่ละชุดห่างกัน 116 ดัชนีเป๊ะ ๆ ทุกชุด)
     ส่วนแถวที่ 0 คือคำอวยพรใหม่ล่าสุดที่ถูกวางไว้หัวรายการ

     จึงหาคาบการซ้ำแล้วตัดให้เหลือรอบเดียว = ข้อมูลจริงในชีต 117 แถว

     สำคัญ: ไม่กรองคำอวยพรที่ข้อความเหมือนกัน
     ถ้าในชีตมีแถวซ้ำอยู่จริง (เช่นแถวทดสอบ 65 แถว) ต้องขึ้นครบทุกแถว
     เพราะเป็นข้อมูลที่มีอยู่จริง ไม่ใช่ของที่งอกจากการอ่าน
     ============================================================ */

  function rowKey(w) {
    return String(w && w.name || "") + "\u0000" +
           String(w && w.wish || "") + "\u0000" +
           String(w && w.timestamp || "");
  }

  function unrepeatWishes(list) {

    const items = list || [];
    const n = items.length;

    if (n < 4) return items;

    const keys = items.map(rowKey);

    /* offset เผื่อกรณีมีคำอวยพรใหม่แทรกอยู่หัวรายการก่อนบล็อกที่ซ้ำ */
    for (let offset = 0; offset <= 3 && offset < n; offset++) {

      const span = n - offset;

      for (let p = 1; p <= span / 2; p++) {

        if (span % p !== 0) continue;

        let same = true;

        for (let i = offset; i + p < n; i++) {
          if (keys[i] !== keys[i + p]) { same = false; break; }
        }

        if (same) return items.slice(0, offset + p);

      }

    }

    return items;
  }


  /* ============================================================
     RENDER — วางหัวใจตามจำนวนคำอวยพร
     ============================================================ */

  function renderWishPage() {

    const heartGroup =
      document.getElementById("treeHearts");

    if (!heartGroup) return;


    /* วาดใหม่เมื่อยังไม่เคยวาด หรือปลายกิ่งไม่พอกับจำนวนคำอวยพรตอนนี้
       (ไม่ต้องวาดใหม่ตอนคนน้อยลง ต้นไม้ที่โตแล้วไม่ควรหดกลับ) */
    if (!treeTips.length || treeTips.length < allWishes.length) {

      drawTree(allWishes.length);

    }


    heartGroup.textContent = "";

    tipPinned = false;

    hideWishTip(true);


    if (allWishes.length === 0) {

      showSpotlight(null);

      return;

    }


    const total =
      Math.min(allWishes.length, treeTips.length);


    /* อัปเดตตัวเลขหลังรู้จำนวนปลายกิ่งจริงของรอบนี้แล้ว
       ถ้าเรียกก่อนหน้านี้ จะไปอ่าน treeTips ของรอบก่อนซึ่งยังไม่ตรง */
    updateTree();


    for (let i = 0; i < total; i++) {

      const tip = treeTips[i];

      const wish = allWishes[i];


      const scale = 0.25 + (i % 3) * 0.032;

      const g =
        document.createElementNS(SVG_NS, "g");

      g.setAttribute("class", "wish-heart");

      /* ผลิทีละดวง ไล่ตามลำดับ หลังกิ่งงอกเสร็จ */
      g.style.setProperty(
        "--bloom-delay",
        (900 + Math.min(i * 26, 1600)) + "ms"
      );

      g.dataset.index = String(i);

      g.setAttribute(
        "transform",
        "translate(" + (tip.x - 50 * scale).toFixed(1) +
        " " + (tip.y - 45 * scale).toFixed(1) +
        ") scale(" + scale.toFixed(3) + ")"
      );

      /* ดวงเดิมไม่ต้องเด้งใหม่ทุกครั้งที่ดึงข้อมูล
         เด้งเฉพาะดวงที่เพิ่งเข้ามา ให้เห็นว่ามีคนส่งมาเพิ่ม */
      const fresh =
        firstLoadDone === false ||
        newQueue.some((w) => wishKey(w) === wishKey(wish));

      if (fresh) {

        g.classList.add("is-fresh");

        g.style.setProperty(
          "--pop-delay",
          (i * 26) + "ms"
        );

      }


      const path =
        document.createElementNS(SVG_NS, "path");

      path.setAttribute("d", HEART_PATH);

      path.setAttribute(
        "fill",
        HEART_COLORS[i % HEART_COLORS.length]
      );

      g.appendChild(path);


      /* เข้าถึงด้วยคีย์บอร์ดได้ */
      g.setAttribute("tabindex", "0");

      g.setAttribute("role", "button");

      g.setAttribute(
        "aria-label",
        "คำอวยพรจาก " + String(wish.name || "Guest")
      );


      /* ชี้ (เดสก์ท็อป) → โชว์ข้อความเต็ม */
      g.addEventListener("mouseenter", () => {

        if (tipPinned) return;

        showWishTip(g, wish);

      });

      g.addEventListener("mouseleave", () => {

        if (tipPinned) return;

        hideWishTip();

      });


      /* คีย์บอร์ด */
      g.addEventListener("focus", () => showWishTip(g, wish));

      g.addEventListener("blur", () => {

        if (!tipPinned) hideWishTip();

      });


      /* คลิก/แตะ → ปักหมุดกล่องไว้ + อัปเดตข้อความด้านล่างด้วย */
      g.addEventListener("click", (event) => {

        event.stopPropagation();

        tipPinned = true;

        showWishTip(g, wish);


        spotlightIndex = i;

        showSpotlight(wish);

        restartSpotlight();

      });


      heartGroup.appendChild(g);

    }


    renderFeed();

    startSpotlight();

  }


  /* ============================================================
     SPOTLIGHT — คำอวยพรที่กำลังฉาย
     ============================================================ */

  function showSpotlight(wish, isNew) {

    const textEl =
      document.getElementById("spotlightText");

    const nameEl =
      document.getElementById("spotlightName");

    if (!textEl || !nameEl) return;


    if (!wish) {

      textEl.textContent =
        "ยังไม่มีคำอวยพรที่อนุญาตให้แสดง";

      nameEl.textContent = "";

      nameEl.className = "wish-spotlight-name";

      return;

    }


    const box =
      document.getElementById("wishSpotlight");

    if (box) {

      box.classList.toggle("is-new", Boolean(isNew));

      box.classList.remove("is-in");

      /* บังคับให้เบราว์เซอร์เริ่มอนิเมชันใหม่ */
      void box.offsetWidth;

      box.classList.add("is-in");

    }


    textEl.textContent =
      "“" + String(wish.wish || "") + "”";


    /* ช่องรูปของการ์ด (ใช้จริงตอนเต็มจอ) */
    const faceEl =
      document.getElementById("spotlightAvatar");

    if (faceEl) {

      faceEl.textContent = "";

      faceEl.appendChild(
        buildAvatarEl(wish.avatar || "")
      );

    }


    highlightFeed(wish);

    highlightHeart(wish);


    nameEl.textContent = "";

    nameEl.className = "wish-spotlight-name wish-spotlight-who";

    nameEl.appendChild(
      buildAvatarEl(wish.avatar || "")
    );

    const whoSpot = document.createElement("span");

    whoSpot.textContent = String(wish.name || "Guest");

    nameEl.appendChild(whoSpot);

  }


  /* ============================================================
     WISH FEED — ลำดับคำอวยพรที่ส่งเข้ามา (โหมดเต็มจอ)

     เรียงจากใหม่ไปเก่า พร้อมเลขลำดับ
     รายการที่กำลังฉายอยู่จะถูกไฮไลต์และเลื่อนให้เห็นเอง
     ============================================================ */

  function renderFeed() {

    const list =
      document.getElementById("wishFeedList");

    const countEl =
      document.getElementById("wishFeedCount");

    if (!list) return;


    list.textContent = "";


    if (countEl) {

      countEl.textContent =
        allWishes.length > 0
          ? allWishes.length + " ข้อความ"
          : "";

    }


    /* allWishes เรียงใหม่→เก่าอยู่แล้ว ลำดับจึงนับถอยหลังจากทั้งหมด */
    allWishes.forEach((wish, index) => {

      const li = document.createElement("li");

      li.className = "wish-feed-item";

      li.dataset.index = String(index);


      const no = document.createElement("span");

      no.className = "wish-feed-no";

      no.textContent = String(allWishes.length - index);

      li.appendChild(no);


      li.appendChild(
        buildAvatarEl(wish.avatar || "")
      );


      const who = document.createElement("span");

      who.className = "wish-feed-who";


      const nm = document.createElement("span");

      nm.className = "wish-feed-name";

      nm.textContent = String(wish.name || "Guest");

      who.appendChild(nm);


      const tx = document.createElement("span");

      tx.className = "wish-feed-text";

      tx.textContent = String(wish.wish || "");

      who.appendChild(tx);


      li.appendChild(who);


      /* คลิกรายการเพื่อฉายคำอวยพรนั้น */
      li.addEventListener("click", () => {

        spotlightIndex = index;

        showSpotlight(wish);

        restartSpotlight();

      });


      list.appendChild(li);

    });

  }


  /* หัวใจบนต้นไม้ที่ตรงกับคำอวยพรที่กำลังฉาย จะเด่นขึ้นมา
     ทำให้เห็นว่าข้อความนี้มาจากหัวใจดวงไหน */
  function highlightHeart(wish) {

    const group =
      document.getElementById("treeHearts");

    if (!group) return;


    const index = allWishes.indexOf(wish);


    let activeHeart = null;

    Array.from(group.children).forEach((heart) => {

      const on = Number(heart.dataset.index) === index;

      heart.classList.toggle("is-active", on);

      if (on) activeHeart = heart;

    });


    /* ตอนฉายเต็มจอ ให้ข้อความโผล่ที่หัวใจดวงนั้นเองด้วย
       ผู้ชมจะเห็นว่าคำอวยพรนี้มาจากหัวใจดวงไหนบนต้นไม้ */
    const stage =
      document.getElementById("treeStage");

    const presenting =
      stage &&
      (
        isFullscreen() ||
        stage.classList.contains("is-pseudo-fullscreen")
      );


    if (presenting && activeHeart) {

      /* ไม่ให้ทับกับกล่องที่ผู้ใช้ปักหมุดไว้เอง */
      if (!tipPinned) {

        showWishTip(activeHeart, wish);

      }

    } else if (!tipPinned) {

      hideWishTip(true);

    }

  }


  function highlightFeed(wish) {

    const list =
      document.getElementById("wishFeedList");

    if (!list || !list.children.length) return;


    const index = allWishes.indexOf(wish);

    Array.from(list.children).forEach((li) => {

      const on =
        Number(li.dataset.index) === index;

      li.classList.toggle("is-active", on);


      if (on) {

        /* เลื่อนเฉพาะ "ในกล่องรายการ" เท่านั้น

           เดิมใช้ scrollIntoView ซึ่งเขียนไว้ตอนที่รายการนี้โผล่เฉพาะโหมดเต็มจอ
           (เป็นแถบขวามือที่เลื่อนในตัวเอง) พอย้ายมาแสดงในหน้าปกติด้วย
           รายการกลายเป็นบล็อกธรรมดาที่ไม่มีสกรอลล์ของตัวเอง
           scrollIntoView จึงไปเลื่อน "ทั้งหน้า" แทน — ทุก ๆ ห้าวินาที
           หน้าจะกระตุกไปหาคำอวยพรที่กำลังไฮไลต์ คนที่กำลังเลื่อนอ่านอยู่
           ก็โดนดีดไปอีกที่หนึ่ง

           แก้โดยขยับ scrollTop ของกล่องเอง และทำก็ต่อเมื่อกล่องนั้น
           เลื่อนได้จริง ๆ ตำแหน่งสกรอลล์ของหน้าจึงไม่ถูกแตะเลย */

        const canScroll =
          list.scrollHeight > list.clientHeight + 4;

        if (canScroll) {

          const liBox = li.getBoundingClientRect();
          const listBox = list.getBoundingClientRect();

          let delta = 0;

          if (liBox.top < listBox.top) {
            delta = liBox.top - listBox.top;
          } else if (liBox.bottom > listBox.bottom) {
            delta = liBox.bottom - listBox.bottom;
          }

          if (delta !== 0) {
            list.scrollTo({
              top: list.scrollTop + delta,
              behavior: "smooth"
            });
          }

        }

      }

    });

  }


  /* ============================================================
     ROTATION — สองเลน

     เลนหลัก  : วนคำอวยพรทั้งหมดตามลำดับ ดวงละ WISHES_INTERVAL
     เลนแทรก  : คำอวยพรที่เพิ่งส่งเข้ามา แทรกขึ้นทันที ค้างนานกว่าปกติ
                แล้วคืนเลนหลักที่ตำแหน่งเดิม (ไม่รีเซ็ตรอบ)

     กันจอค้าง: ถ้าคนส่งพร้อมกันหลายคน จะแทรกติดกันได้ไม่เกิน
                NEW_STREAK_MAX ครั้ง แล้วต้องคั่นด้วยของเก่า 1 อัน
     ============================================================ */

  const NEW_HOLD_MS = 7000;      /* คำอวยพรใหม่ค้างนานกว่า ให้ทันอ่าน */

  const NEW_STREAK_MAX = 3;      /* แทรกติดกันได้ไม่เกินกี่ครั้ง */

  const seenKeys = new Set();

  let newQueue = [];

  let newStreak = 0;

  let firstLoadDone = false;


  function wishKey(wish) {

    return String(wish.name || "") +
      "|" + String(wish.timestamp || "") +
      "|" + String(wish.wish || "").slice(0, 24);

  }


  function collectNewWishes() {

    const fresh = [];

    allWishes.forEach((wish) => {

      const key = wishKey(wish);

      if (!seenKeys.has(key)) {

        seenKeys.add(key);

        fresh.push(wish);

      }

    });


    /* โหลดครั้งแรกไม่ใช่ของใหม่ — ไม่งั้นจะประกาศรัวทั้ง 20 ข้อ */
    if (!firstLoadDone) {

      firstLoadDone = true;

      return;

    }


    if (fresh.length === 0) return;


    /* ของที่เพิ่งเข้ามาให้เรียงเก่า→ใหม่ คนที่ส่งก่อนได้ขึ้นก่อน */
    newQueue = newQueue.concat(fresh.slice().reverse());

  }


  /* เลือกว่ารอบถัดไปจะโชว์อะไร */
  function pickNext() {

    const canInterrupt =
      newQueue.length > 0 &&
      newStreak < NEW_STREAK_MAX;


    if (canInterrupt) {

      newStreak++;

      return { wish: newQueue.shift(), isNew: true };

    }


    newStreak = 0;


    if (allWishes.length === 0) return null;


    spotlightIndex =
      (spotlightIndex + 1) % allWishes.length;

    return { wish: allWishes[spotlightIndex], isNew: false };

  }


  function scheduleNext(delay) {

    stopSpotlight();

    spotlightTimer = setTimeout(() => {

      const next = pickNext();

      if (!next) return;

      showSpotlight(next.wish, next.isNew);

      scheduleNext(
        next.isNew ? NEW_HOLD_MS : WISHES_INTERVAL
      );

    }, delay);

  }


  function startSpotlight() {

    stopSpotlight();


    if (allWishes.length === 0) return;


    /* ถ้ามีของใหม่รออยู่ ให้ขึ้นทันทีเลย ไม่ต้องรอรอบ */
    if (newQueue.length > 0) {

      newStreak = 1;

      const first = newQueue.shift();

      showSpotlight(first, true);

      scheduleNext(NEW_HOLD_MS);

      return;

    }


    showSpotlight(
      allWishes[spotlightIndex % allWishes.length]
    );


    if (allWishes.length < 2) return;


    scheduleNext(WISHES_INTERVAL);

  }


  function stopSpotlight() {

    if (spotlightTimer) {

      clearTimeout(spotlightTimer);

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

  /* Apps Script ตอบ 503 ได้เมื่อมีคนเรียกพร้อมกันเยอะ (เช่นวันงาน)
     ถ้าโหลดรอบแรกไม่ผ่าน ให้ลองใหม่เองอัตโนมัติ ไม่ต้องรอแขกกดปุ่ม */
  const WISHES_MAX_RETRY = 3;

  const WISHES_RETRY_DELAYS = [2000, 5000, 11000];

  let wishesRetry = 0;


  async function loadWishes() {


    if (wishesLoading) {
      return;
    }

    wishesLoading = true;

    /* บอกด้วยภาพว่ากำลังโหลด — หยดน้ำร่วงลงพื้นที่ที่ต้นไม้จะขึ้น
       ของเดิมปล่อยว่างเปล่าจนดูเหมือนหน้าเสีย */
    if (treeStage && !treeTips.length) {
      treeStage.classList.add("is-watering");
    }


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

      /* ตัดบล็อกที่ถูกส่งซ้ำจากการอ่าน แต่เก็บแถวซ้ำที่มีอยู่จริงในชีตไว้ครบ
         (ดูเหตุผลและวิธีตรวจคาบที่ unrepeatWishes) */

      allWishes =
        unrepeatWishes(data.items || []);


      /* เริ่มจากชุดแรก = คำอวยพรล่าสุด */
      currentWishPage = 0;


      /* โหลดผ่านแล้ว รีเซ็ตตัวนับ retry */
      wishesRetry = 0;


      /* หาคำอวยพรที่เพิ่งเข้ามาใหม่ เพื่อเอาไปแทรกคิวโชว์ */
      collectNewWishes();


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



      /* ----------------------------------------------------------
         ลองใหม่อัตโนมัติ ก่อนจะยอมแพ้และขึ้นข้อความ error
         (ส่วนใหญ่เป็น 503 ชั่วคราวจาก Apps Script)
         ---------------------------------------------------------- */

      if (wishesRetry < WISHES_MAX_RETRY) {

        const delay =
          WISHES_RETRY_DELAYS[wishesRetry] || 11000;

        wishesRetry++;


        /* ระหว่างรอ ยังไม่ต้องขึ้นข้อความ error ให้แขกเห็น */
        setTimeout(() => {
          loadWishes();
        }, delay);


        return;

      }


      if (wishesGrid) {


        wishesGrid.innerHTML = `

          <div class="no-wishes">

            โหลดคำอวยพรไม่สำเร็จ

          </div>

        `;

      }


      const spotFail =
        document.getElementById("spotlightText");

      if (spotFail && !spotFail.textContent) {

        spotFail.textContent =
          "โหลดคำอวยพรไม่สำเร็จ — กดปุ่มด้านล่างเพื่อลองใหม่";

      }



    } finally {


      clearTimeout(abortTimer);

      wishesLoading = false;

      if (treeStage) {
        treeStage.classList.remove("is-watering");
      }


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

      () => {

        /* กดเองแล้วให้เริ่มนับ retry ใหม่ */
        wishesRetry = 0;

        loadWishes();

      }

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

