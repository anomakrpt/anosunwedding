let player;
let playerReady = false;

const VIDEO_ID = "8ImQ5XFwldg"; // BILLKIN - นับหนึ่ง
const START_SECONDS = 28;

// YouTube API
function onYouTubeIframeAPIReady() {
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
}

document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro");
  const introVideo = document.getElementById("introVideo");
  const main = document.getElementById("main");
  const skipBtn = document.getElementById("skipBtn");

  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const mapBtn = document.querySelector(".map-btn");

  function startMusic() {
    if (!playerReady) {
      setTimeout(startMusic, 300);
      return;
    }

    player.seekTo(START_SECONDS, true);
    player.setVolume(0);
    player.playVideo();

    let vol = 0;
    const fade = setInterval(() => {
      if (vol < 35) {
        vol += 3;
        player.setVolume(vol);
      } else {
        clearInterval(fade);
      }
    }, 200);
  }

  function showMainContent() {
    if (intro) {
      intro.style.opacity = "0";
      intro.style.transition = "opacity 0.8s ease";

      setTimeout(() => {
        intro.style.display = "none";
      }, 800);
    }

    if (main) {
      main.style.display = "block";
    }
  }

  // กดปุ่ม Open Invitation = เล่นวิดีโอ + เพลง
  if (skipBtn && introVideo) {
    skipBtn.addEventListener("click", () => {
      skipBtn.style.opacity = "0";
      skipBtn.style.pointerEvents = "none";

      introVideo.play();
      startMusic();
    });
  }

  // วิดีโอจบแล้วค่อยเข้าเว็บ
  if (introVideo) {
    introVideo.addEventListener("ended", showMainContent);
  } else {
    showMainContent();
  }

  // Menu
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("show");
    });
  }

  const menuLinks = document.querySelectorAll(".mobile-menu a");
  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("show");
    });
  });

  // Map button
  if (mapBtn) {
    mapBtn.addEventListener("click", (e) => {
      const href = mapBtn.getAttribute("href");
      if (!href || href === "#") {
        e.preventDefault();
        alert("ใส่ลิงก์ Google Maps ในปุ่ม Open Map ก่อน");
      }
    });
  }

  // Countdown
  const targetDate = new Date("2027-01-17T10:00:00").getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      document.getElementById("days").textContent = "00";
      document.getElementById("hours").textContent = "00";
      document.getElementById("minutes").textContent = "00";
      document.getElementById("seconds").textContent = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    document.getElementById("days").textContent = days;
    document.getElementById("hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
});  if (skipBtn) {
    skipBtn.addEventListener("click", showMainContent);
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("show");
    });
  }

  const menuLinks = document.querySelectorAll(".mobile-menu a");
  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("show");
    });
  });

  if (mapBtn) {
    mapBtn.addEventListener("click", (e) => {
      const href = mapBtn.getAttribute("href");
      if (!href || href === "#") {
        e.preventDefault();
        alert("ใส่ลิงก์ Google Maps ในปุ่ม Open Map ก่อน");
      }
    });
  }
});


/* start Date Countdown*/

const targetDate = new Date("2027-01-17T10:00:00").getTime(); // ใส่เวลา 10:00 ไปเลย

function updateCountdown() {
  const now = new Date().getTime();
  const distance = targetDate - now;

  if (distance <= 0) return;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000); 

/* end Date Countdown*/

