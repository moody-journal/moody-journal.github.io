// Reading pages stay fully usable without JavaScript.
(() => {
  const links = [...document.querySelectorAll('[data-policy-toc] a')];
  const sections = [...document.querySelectorAll('.policy-block[id]')];
  if (links.length && sections.length) {
    let scheduled = false;
    function update() {
      scheduled = false;
      let current = sections[0];
      const probe = Math.max(140, innerHeight * .3);
      for (const section of sections) { if (section.getBoundingClientRect().top <= probe) current = section; }
      for (const link of links) {
        if (link.getAttribute('href') === '#' + current.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
    addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
    document.querySelectorAll('.mobile-toc a').forEach(link => link.addEventListener('click', () => {
      link.closest('details').open = false;
      const target = document.querySelector(link.getAttribute('href'));
      target?.setAttribute('tabindex', '-1');
      target?.focus({ preventScroll: true });
    }));
  }
  document.querySelectorAll('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
    const feedback = document.querySelector('.copy-feedback');
    try {
      await navigator.clipboard.writeText(button.dataset.copyEmail);
      feedback.textContent = 'Email address copied';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(document.querySelector('.support-email'));
      const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
      feedback.textContent = 'Address selected. Copy it with your keyboard.';
    }
  }));
})();
