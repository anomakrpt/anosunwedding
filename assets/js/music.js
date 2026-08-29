/* ============================================================
   MUSIC — YouTube background player (ใช้เฉพาะ index.html)
   ค่า VIDEO_ID / START_SECONDS อยู่ใน config.js
============================================================ */

let player;
let playerReady = false;
let musicStarted = false;


/* ============================================================
   YOUTUBE MUSIC
   ============================================================ */
/* วันครบรอบ นน */
/* Right Here Waiting */
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

        updateSoundBtn();


        /* กลับมาหน้าแรกจากหน้าอื่น ถ้าเคยเปิดเสียงไว้ ให้เล่นต่อเอง
           (บางเบราว์เซอร์อาจบล็อกเพราะไม่มีการกดของผู้ใช้
            กรณีนั้นปุ่มจะขึ้นสถานะปิด แตะครั้งเดียวก็ติด) */
        if (soundWanted()) {

          resumeMusic();

        }

      },


      onStateChange: (event) => {

        /* เพลงจบ → วนกลับไปเริ่มที่เดิม
           ไม่งั้นคลิปจะเงียบไปเลยหลังเล่นจบรอบเดียว */
        if (event.data === YT.PlayerState.ENDED) {

          player.seekTo(START_SECONDS, true);

          player.playVideo();

        }

        updateSoundBtn();

      }

    }

  });

};


/* ============================================================
   SOUND TOGGLE — ปุ่มเปิด/ปิดเสียงมุมบนขวา

   จำค่าที่ผู้ใช้เลือกไว้ใน localStorage
   เปลี่ยนหน้าไป-กลับก็ยังคงสถานะเดิม
   ============================================================ */

const SOUND_KEY = "wedding-sound";

const MUSIC_VOLUME = 30;


function soundWanted() {

  try {

    return localStorage.getItem(SOUND_KEY) !== "off";

  } catch (err) {

    return true;

  }

}


function setSoundWanted(on) {

  try {

    localStorage.setItem(SOUND_KEY, on ? "on" : "off");

  } catch (err) {

    /* private mode — ข้ามได้ */

  }

}


function isMusicPlaying() {

  return Boolean(
    playerReady &&
    player &&
    player.getPlayerState &&
    player.getPlayerState() === 1
  );

}


function resumeMusic() {

  if (!playerReady || !player) return;


  /* ถ้ายังไม่เคยเริ่ม ให้ไปเริ่มที่ท่อนที่กำหนดไว้ */
  if (!musicStarted) {

    player.seekTo(START_SECONDS, true);

    musicStarted = true;

  }


  player.setVolume(MUSIC_VOLUME);

  player.playVideo();

  updateSoundBtn();

}


function updateSoundBtn() {

  const btn =
    document.getElementById("soundBtn");

  if (!btn) return;


  const on = isMusicPlaying();

  btn.classList.toggle("is-on", on);

  btn.setAttribute("aria-pressed", on ? "true" : "false");

  btn.setAttribute(
    "aria-label",
    on ? "ปิดเสียงเพลง" : "เปิดเสียงเพลง"
  );

}


document.addEventListener("DOMContentLoaded", () => {

  const btn =
    document.getElementById("soundBtn");

  if (!btn) return;


  btn.addEventListener("click", () => {

    if (!playerReady || !player) return;


    if (isMusicPlaying()) {

      player.pauseVideo();

      setSoundWanted(false);

    } else {

      setSoundWanted(true);

      resumeMusic();

    }


    /* สถานะจริงจาก YouTube มาช้ากว่าคลิกเล็กน้อย */
    setTimeout(updateSoundBtn, 400);

  });


  updateSoundBtn();

});


/* ============================================================
   INDEX.HTML
   INTRO + MUSIC + MENU + COUNTDOWN
   ============================================================ */

