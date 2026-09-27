/**
 * main.js
 * Page interactions for index.html:
 *   - Feature row fade-in on scroll
 *   - Autoplay videos on viewport entry
 *   - Replay button handler
 */

// ── Feature rows: fade-in on scroll ──────────────────────────────────────────
(function() {
    const rows = document.querySelectorAll('.feature-row');
    if (!('IntersectionObserver' in window)) { rows.forEach(r => r.classList.add('visible')); return; }
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    rows.forEach(r => obs.observe(r));
})();

// ── Autoplay videos when they enter the viewport ──────────────────────────
(function() {
    const videos = document.querySelectorAll('video.autoplay-video');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            const vid = e.target;
            if (e.isIntersecting) {
                vid.currentTime = 0;
                vid.play().catch(() => {});
            } else {
                vid.pause();
            }
        });
    }, { threshold: 0.4 });
    videos.forEach(v => obs.observe(v));
})();

// ── Replay button handler ─────────────────────────────────────────────────
function replayVideo(btn) {
    const container = btn.closest('.scroll-video-phone, .feature-media');
    const vid = container && container.querySelector('video');
    if (vid) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
    }
}
