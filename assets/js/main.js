(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const body = document.body;
  let paused = reduce.matches;
  const motionButton = document.querySelector('#motion-toggle');
  const hero = document.querySelector('.hero');
  const story = document.querySelector('.story');
  const tabs = [...document.querySelectorAll('.story-tab')];
  const scenes = [
    { title: 'Your life.<br><span>In your own words.</span>', description: 'Write it. Record it. Add the photo, the place, the song. Keep the whole feeling, not just the headline.', image: 'demos/Moody_JournalTab.png', alt: 'Your journal in Moody, with photos, music and locations', note: 'Every detail. Every feeling.', color: '#49375b' },
    { title: 'A little distance.<br><span>A clearer picture.</span>', description: 'Your check-ins become a story over time. Explore your mood trends and see how your days connect.', image: 'demos/Moody_MoodTab.png', alt: 'Mood charts and insights in Moody', note: 'Check in. Look back. Understand.', color: '#364b48' },
    { title: 'Small moments.<br><span>Real achievements.</span>', description: 'Your words hold more than memories. On-device Apple Intelligence helps uncover the small wins you might have missed.', image: 'demos/Moody_EmptyJournal.png', alt: 'A new journal ready for your next story', note: 'Your next discovery starts with a word.', color: '#665338' }
  ];
  let current = -1;
  let manualScene = false;
  function setScene(index) {
    if (index === current) return;
    current = index;
    const scene = scenes[index];
    document.querySelector('.story-heading h2').innerHTML = scene.title;
    document.querySelector('#story-description').textContent = scene.description;
    const screen = document.querySelector('#story-screen');
    screen.src = scene.image;
    screen.alt = scene.alt;
    document.querySelector('#visual-note').textContent = scene.note;
    document.querySelector('.story-disc').style.background = scene.color;
    story.style.setProperty('--scene', index);
    tabs.forEach((tab, i) => { tab.classList.toggle('active', i === index); tab.setAttribute('aria-pressed', String(i === index)); });
  }
  tabs.forEach(tab => tab.addEventListener('click', () => { manualScene = true; setScene(Number(tab.dataset.scene)); }));
  let scheduled = false;
  function updateScroll() {
    scheduled = false;
    if (!paused) {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty('--hero-progress', Math.max(0, Math.min(1, -rect.top / rect.height)).toFixed(3));
    }
    if (!manualScene && !paused && window.innerWidth > 600) {
      const rect = story.getBoundingClientRect();
      const progress = Math.max(0, Math.min(.999, -rect.top / (rect.height - window.innerHeight)));
      setScene(Math.floor(progress * 3));
    }
  }
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  window.addEventListener('resize', updateScroll);
  function syncMotion() {
    body.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? 'Enable animations' : 'Pause animations';
    updateScroll();
  }
  motionButton.addEventListener('click', () => { paused = !paused; syncMotion(); });
  reduce.addEventListener('change', () => { paused = reduce.matches; syncMotion(); });
  setScene(0); syncMotion();
  const range = document.querySelector('#mood-range');
  const moods = ['Very unpleasant', 'Unpleasant', 'Slightly unpleasant', 'Neutral', 'Slightly pleasant', 'Pleasant', 'Very pleasant'];
  const colors = [['#dbd1eb','#bba5d4','#9473b7'],['#cbd9ed','#9eb9da','#7095c2'],['#cedfe6','#a4c5d2','#7ba4b8'],['#d2e4e0','#a8cdc6','#7fada6'],['#e1eac4','#c8dc91','#a5c363'],['#e6edb8','#cedb83','#afc253'],['#f4d8bf','#eab688','#d88d54']];
  const layers = [...document.querySelectorAll('.mood-layer')];
  function drawMood() {
    const index = Number(range.value);
    document.querySelector('#mood-value').textContent = moods[index];
    range.setAttribute('aria-valuetext', moods[index]);
    layers.forEach((layer, n) => {
      const radius = 145 - n * 30;
      const amplitude = index === 3 ? .025 : .09 + Math.abs(index - 3) * .025;
      const petals = index < 3 ? 8 : 5;
      const points = Array.from({ length: 241 }, (_, i) => {
        const angle = i / 240 * Math.PI * 2;
        const r = radius * (1 + amplitude * Math.cos(petals * angle + .3));
        return `${i ? 'L' : 'M'}${(200 + Math.cos(angle) * r).toFixed(2)},${(200 + Math.sin(angle) * r).toFixed(2)}`;
      });
      layer.setAttribute('d', points.join(' ') + 'Z');
      layer.style.fill = colors[index][n];
    });
  }
  range.addEventListener('input', drawMood); drawMood();
  document.querySelectorAll('.demo-details').forEach(details => details.addEventListener('toggle', () => { if (!details.open) details.querySelector('video').pause(); }));
})();
