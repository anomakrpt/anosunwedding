document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro");
  const introVideo = document.getElementById("introVideo");
  const main = document.getElementById("main");
  const skipBtn = document.getElementById("skipBtn");

  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const mapBtn = document.querySelector(".map-btn");

  function showMainContent() {
    if (intro) {
      intro.style.opacity = "0";
      intro.style.transition = "opacity 0.6s ease";
      setTimeout(() => {
        intro.style.display = "none";
      }, 600);
    }

    if (main) {
      main.style.display = "block";
    }
  }

  if (introVideo) {
    introVideo.addEventListener("ended", showMainContent);

    setTimeout(() => {
      if (main.style.display !== "block") {
        showMainContent();
      }
    }, 15000);
  } else {
    showMainContent();
  }

  if (skipBtn) {
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

