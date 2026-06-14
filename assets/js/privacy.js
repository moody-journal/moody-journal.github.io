/**
 * privacy.js
 * Page interactions for privacy.html:
 *   - Policy block fade-in on scroll
 *   - Mobile nav toggle
 *   - Sidebar scrollspy for TOC links
 */

// ── Fade-in policy blocks on scroll ──────────────────────────────────────────
(function() {
    const blocks = document.querySelectorAll('.policy-block');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    blocks.forEach(b => obs.observe(b));
})();

// ── Mobile nav toggle ─────────────────────────────────────────────────────────
(function () {
    const toggle = document.getElementById('navToggle');
    const panel = document.getElementById('navMobilePanel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', () => {
        const open = panel.classList.toggle('open');
        toggle.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
    });
    panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        panel.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }));
})();

// ── Scrollspy for sidebar "On this page" links ────────────────────────────────
(function () {
    const links = document.querySelectorAll('#tocLinks a');
    if (!links.length) return;
    const sections = Array.from(links).map(a => document.querySelector(a.getAttribute('href')));
    const setActive = () => {
        let current = sections[0];
        const probe = window.innerHeight * 0.3;
        sections.forEach(sec => {
            if (sec && sec.getBoundingClientRect().top <= probe) current = sec;
        });
        links.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + current.id);
        });
    };
    document.addEventListener('scroll', setActive, { passive: true });
    setActive();
})();
