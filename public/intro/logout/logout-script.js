let progress = 0;
const progressBar = document.querySelector('.progress-bar');
const loadingPercentage = document.getElementById('loading-percentage');

localStorage.clear();

history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.go(1);
};

document.addEventListener('DOMContentLoaded', function() {
    if ('caches' in window) {
        caches.keys().then(function(cacheNames) {
            cacheNames.forEach(function(cacheName) {
                caches.delete(cacheName);
            });
        });
    }
    history.pushState(null, null, window.location.href);
    window.onpopstate = function() {
        history.go(1);
    };
});

const interval = setInterval(() => {
    progress += 1;
    progressBar.style.width = `${progress}%`;
    loadingPercentage.textContent = `${progress}%`;
    if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
            window.location.href = "../index.html";
        }, 900);
    }
}, 20);

document.body.style.pointerEvents = 'none';
