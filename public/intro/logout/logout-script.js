let progress = 0;
const progressBar = document.querySelector(".progress-bar");
const loadingPercentage = document.getElementById("loading-percentage");

const logoutAndRedirect = async () => {
  try {
    await fetch("https://bytehubonline.vercel.app/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("Error during server-side logout:", error);
  } finally {
    localStorage.clear();

    const interval = setInterval(() => {
      progress += 1;
      progressBar.style.width = `${progress}%`;
      loadingPercentage.textContent = `${progress}%`;
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          window.location.replace("../index?reload=true");
        }, 900);
      }
    }, 20);
  }
};

history.pushState(null, null, location.href);
window.onpopstate = function () {
  history.go(1);
};

document.addEventListener("DOMContentLoaded", function () {
  if ("caches" in window) {
    caches.keys().then(function (cacheNames) {
      cacheNames.forEach(function (cacheName) {
        caches.delete(cacheName);
      });
    });
  }
  history.pushState(null, null, window.location.href);
  window.onpopstate = function () {
    history.go(1);
  };
  document.body.style.pointerEvents = "none";
  logoutAndRedirect();
});