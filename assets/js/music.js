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

      }

    }

  });

};


/* ============================================================
   INDEX.HTML
   INTRO + MUSIC + MENU + COUNTDOWN
   ============================================================ */

