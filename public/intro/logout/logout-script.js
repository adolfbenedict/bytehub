let progress = 0;
const progressBar = document.querySelector('.progress-bar');
const loadingPercentage = document.getElementById('loading-percentage');

// Clear session data
localStorage.clear();

// Disable browser back button
history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.go(1);
};

// Prevent Caching -  Improved to be more robust.
document.addEventListener('DOMContentLoaded', function() {
    // Delete the cache storage
    if ('caches' in window) {
        caches.keys().then(function(cacheNames) {
            cacheNames.forEach(function(cacheName) {
                caches.delete(cacheName);
            });
        });
    }
    // Clear history and replace current state to prevent back button
    history.pushState(null, null, window.location.href);
    window.onpopstate = function() {
        history.go(1); // Go forward, effectively disabling back
    };
});

const interval = setInterval(() => {
    progress += 1;
    progressBar.style.width = `${progress}%`;
    loadingPercentage.textContent = `${progress}%`;
    if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
            // Redirect to the intro page
            window.location.href = "/HTML/Byte Hub/public/intro/index.html";
        }, 900);
    }
}, 20);

// Block all input and interaction.  This makes the page effectively frozen.
document.body.style.pointerEvents = 'none';

