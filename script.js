let player;
let playerReady = false;

const VIDEO_ID = "lqWP-nJF0kA"; // song
const START_SECONDS = 28;

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

document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro");
  const introVideo = document.getElementById("introVideo");
  const main = document.getElementById("main");
  const skipBtn = document.getElementById("skipBtn");

  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const mapBtn = document.querySelector(".map-btn");

  if (introVideo) {
    introVideo.muted = true;
    introVideo.playsInline = true;
    introVideo.load();
  }

  function startMusic() {
    if (!playerReady || !player) {
      setTimeout(startMusic, 300);
      return;
    }

    player.seekTo(START_SECONDS, true);
    player.setVolume(0);
    player.playVideo();

    let vol = 0;
    const fade = setInterval(() => {
      if (vol < 30) {
        vol += 2;
        player.setVolume(vol);
      } else {
        clearInterval(fade);
      }
    }, 200);
  }

  function showMainContent() {
    if (intro) {
      intro.style.opacity = "0";

      setTimeout(() => {
        intro.style.display = "none";
      }, 800);
    }

    if (main) {
      main.style.display = "block";
    }
  }

  if (skipBtn && introVideo) {
    skipBtn.addEventListener("click", async () => {
      skipBtn.classList.add("is-hidden");

      startMusic();

      try {
        introVideo.currentTime = 0;
        await introVideo.play();
      } catch (err) {
        console.log("Video play failed:", err);
        showMainContent();
      }
    });
  }

  if (introVideo) {
    introVideo.addEventListener("ended", showMainContent);
  } else {
    showMainContent();
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
        alert("ใส่ลิงก์ Google Maps ในปุ่ม View Map ก่อน");
      }
    });
  }

  const targetDate = new Date("2027-01-17T10:00:00").getTime();

  function updateCountdown() {
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    daysEl.textContent = days;
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
});
