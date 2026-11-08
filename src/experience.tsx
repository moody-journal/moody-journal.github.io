import { createContext, useContext, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { SoapBubbleMaterial, SoapBubbleSlider } from './components/soap-bubble';
import { DARK_GLASS } from './material';
import { BreathOrb, breathPhaseAt } from './breath-orb';
import { clamp, moodGeometry, moodLabel, projectedSlide, rubberBand } from './mood-model';
import './styles.css';

const MOVE = { type: 'spring' as const, stiffness: 247, damping: 31.43, mass: 1 };
const MotionContext = createContext(false);

function MotionProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const [userPaused, setPaused] = useState(false);
  const still = !!reduced || userPaused;
  useEffect(() => {
    const button = document.querySelector<HTMLButtonElement>('#motion-toggle');
    const toggle = () => setPaused(p => !p);
    button?.addEventListener('click', toggle);
    return () => button?.removeEventListener('click', toggle);
  }, []);
  useEffect(() => {
    document.body.classList.toggle('motion-paused', still);
    const button = document.querySelector<HTMLButtonElement>('#motion-toggle');
    if (button) {
      button.textContent = reduced ? 'Reduced motion is on' : userPaused ? 'Enable animations' : 'Pause animations';
      button.setAttribute('aria-pressed', String(still));
      button.disabled = !!reduced;
    }
    document.dispatchEvent(new CustomEvent('moody-motion', { detail: still }));
  }, [still, reduced, userPaused]);
  return <MotionContext.Provider value={still}>{children}</MotionContext.Provider>;
}

function Phone({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  return <div className="device-frame">
    <img className="device-display" src={src} alt={alt} width="1206" height="2622" loading={eager ? 'eager' : 'lazy'} draggable={false} />
    <img className="device-bezel" src="img/iphone-17-pro-silver.webp" alt="" width="1332" height="2748" draggable={false} />
  </div>;
}

function HeroDevice() {
  const still = useContext(MotionContext);
  const heroRef = useRef(document.querySelector<HTMLElement>('.hero'));
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const progress = useSpring(scrollYProgress, MOVE);
  const y = useTransform(progress, [0, 1], [0, -65]);
  return <motion.div className="hero-real-phone" style={{ y: still ? 0 : y }}>
    <Phone src="assets/media/journal.jpg" alt="Moody journal with a mood check-in, photos, places and music" eager />
  </motion.div>;
}

const FEATURES = [
  { name: 'Journal', title: 'Keep the whole feeling.', description: 'The words. The photo. The place. The song. Save the details that make a day yours, with text, audio, images, locations, and music.', src: 'assets/media/journal.jpg', alt: 'A Moody journal entry with photos, music, location and audio', color: '#d5b9e8' },
  { name: 'Mood insights', title: 'See your days differently.', description: 'A quick check-in becomes a clearer picture. Look back at your mood trends and notice the patterns in your everyday life.', src: 'assets/media/mood-insights.jpg', alt: 'Mood check-ins and a seven-day mood trend chart in Moody', color: '#aacfc3' },
  { name: 'A fresh start', title: 'Every story starts somewhere.', description: 'No pressure to write something profound. A few honest words are enough. Start with where you are, and make a little room for what comes next.', src: 'assets/media/fresh-start.jpg', alt: 'The empty Moody journal, ready for your first entry', color: '#dcc69e' },
];

function FeaturePhone({ index, x, spacing, active }: { index: number; x: ReturnType<typeof useMotionValue<number>>; spacing: number; active: boolean }) {
  const distance = useTransform(x, value => Math.min(1, Math.abs(value + index * spacing) / spacing));
  const scale = useTransform(distance, [0, 1], [1, .82]);
  const opacity = useTransform(distance, [0, 1], [1, .45]);
  const rotate = useTransform(x, value => clamp((value + index * spacing) / spacing * 8, -8, 8));
  const still = useContext(MotionContext);
  return <motion.div className="feature-phone" style={{ left: `calc(50% + ${index * spacing}px)`, scale: still ? 1 : scale, opacity, rotate: still ? 0 : rotate }} aria-hidden={!active}>
    <Phone src={FEATURES[index].src} alt={FEATURES[index].alt} />
  </motion.div>;
}

function FeatureShowcase() {
  const still = useContext(MotionContext);
  const viewport = useRef<HTMLDivElement>(null);
  const [spacing, setSpacing] = useState(390);
  const [selected, setSelected] = useState(0);
  const selectedRef = useRef(0);
  const x = useMotionValue(0);
  const control = useRef<ReturnType<typeof animate> | null>(null);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ pointer: number; startX: number; startY: number; origin: number; lastX: number; lastTime: number; velocity: number; recognized: boolean } | null>(null);
  useEffect(() => {
    const element = viewport.current!;
    const observer = new ResizeObserver(() => {
      const next = element.clientWidth < 600 ? 274 : 390;
      if (next !== spacing) {
        control.current?.stop();
        gesture.current = null;
        setDragging(false);
        setSpacing(next);
        x.set(-selectedRef.current * next);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [spacing, x]);
  useEffect(() => () => control.current?.stop(), []);
  function settle(index: number, velocity?: number) {
    const liveVelocity = velocity ?? x.getVelocity();
    control.current?.stop();
    selectedRef.current = index;
    setSelected(index);
    if (still) x.set(-index * spacing);
    else control.current = animate(x, -index * spacing, { ...MOVE, damping: velocity !== undefined && Math.abs(velocity) > 500 ? 27.7 : MOVE.damping, velocity: liveVelocity });
  }
  useEffect(() => {
    if (still) {
      control.current?.stop();
      x.set(-selectedRef.current * spacing);
    }
  }, [still, spacing, x]);
  function down(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || gesture.current) return;
    control.current?.stop();
    const now = performance.now();
    gesture.current = { pointer: event.pointerId, startX: event.clientX, startY: event.clientY, origin: x.get(), lastX: event.clientX, lastTime: now, velocity: 0, recognized: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event: ReactPointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || g.pointer !== event.pointerId) return;
    const dx = event.clientX - g.startX, dy = event.clientY - g.startY;
    if (!g.recognized) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        gesture.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
        settle(selectedRef.current);
        return;
      }
      if (Math.abs(dx) < 10) return;
      g.recognized = true;
      setDragging(true);
    }
    const now = performance.now(), dt = Math.max(1, now - g.lastTime);
    const instantaneous = (event.clientX - g.lastX) / dt * 1000;
    g.velocity = .65 * instantaneous + .35 * g.velocity;
    g.lastX = event.clientX; g.lastTime = now;
    x.set(rubberBand(g.origin + dx, -2 * spacing, 0));
  }
  function release(event: ReactPointerEvent<HTMLDivElement>, cancelled = false) {
    const g = gesture.current;
    if (!g || g.pointer !== event.pointerId) return;
    gesture.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const velocity = !cancelled && g.recognized && performance.now() - g.lastTime < 80 ? clamp(g.velocity, -2400, 2400) : 0;
    const index = cancelled || !g.recognized ? selectedRef.current : projectedSlide(x.get(), velocity, spacing, FEATURES.length);
    settle(index, velocity);
  }
  return <div className="feature-experience">
    <div className="feature-copy" aria-live="polite" aria-atomic="true"><h3>{FEATURES[selected].title}</h3><p>{FEATURES[selected].description}</p></div>
    <div className={`device-carousel ${dragging ? 'is-dragging' : ''}`} ref={viewport} tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Explore app screenshots. Swipe, or use left and right arrow keys." onKeyDown={e => {
      let index = selected;
      if (e.key === 'ArrowRight') index = Math.min(2, selected + 1);
      else if (e.key === 'ArrowLeft') index = Math.max(0, selected - 1);
      else if (e.key === 'Home') index = 0;
      else if (e.key === 'End') index = 2;
      else return;
      e.preventDefault(); settle(index);
    }} onPointerDown={down} onPointerMove={move} onPointerUp={e => release(e)} onPointerCancel={e => release(e, true)} onLostPointerCapture={e => { if (gesture.current) release(e, true); }}>
      <div className="carousel-ground" />
      <motion.div className="device-rail" style={{ x }}>
        {FEATURES.map((feature, index) => <FeaturePhone key={feature.name} index={index} x={x} spacing={spacing} active={selected === index} />)}
      </motion.div>
    </div>
    <div className="feature-navigator" role="group" aria-label="Choose an app feature">
      {FEATURES.map((feature, index) => <motion.button key={feature.name} type="button" aria-pressed={selected === index} onClick={() => settle(index)} whileTap={still ? undefined : { scale: .95 }} transition={MOVE}>
        {selected === index && <motion.span className="feature-selection" layoutId="feature-selection" transition={still ? { duration: 0 } : MOVE} />}
        <span>{feature.name}</span>
      </motion.button>)}
    </div>
    <p className="gesture-hint">Swipe to explore. A little curiosity looks good on you.</p>
  </div>;
}

function MoodPlayground() {
  const still = useContext(MotionContext);
  const backdrop = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(79);
  const target = useMotionValue(79);
  const presentation = useSpring(target, { stiffness: 900, damping: 60, mass: 1 });
  const svgRef = useRef<SVGSVGElement>(null);
  const output = useRef<HTMLOutputElement>(null);
  const press = useMotionValue(1);
  const label = moodLabel(value);
  const visible = useInView(backdrop, { margin: '100px' });
  useMotionValueEvent(press, 'change', value => slider.current?.style.setProperty('--mood-press-scale', String(value)));
  useEffect(() => {
    const element = slider.current;
    if (!element) return;
    let spring: ReturnType<typeof animate> | undefined;
    function to(value: number) {
      spring?.stop();
      if (still) press.jump(1);
      else spring = animate(press, value, MOVE);
    }
    const down = (event: PointerEvent) => { if (event.button === 0) to(1.45); };
    const release = () => to(1);
    element.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    element.addEventListener('focusout', release);
    return () => {
      spring?.stop();
      element.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      element.removeEventListener('focusout', release);
    };
  }, [still, press]);
  // Imperative SVG updates keep the WebGL provider stable during the shape spring.
  function paint(v: number) {
    const paths = svgRef.current?.querySelectorAll('path');
    moodGeometry(v).forEach((shape, index) => {
      paths?.[index]?.setAttribute('d', shape.path);
      paths?.[index]?.setAttribute('fill', shape.fill);
    });
  }
  useMotionValueEvent(presentation, 'change', paint);
  useEffect(() => {
    target.set(value);
    if (still) { presentation.jump(value); paint(value); }
    slider.current?.style.setProperty('--mood-fill', `${value}%`);
    const input = slider.current?.querySelector('input');
    input?.setAttribute('aria-valuetext', label);
    input?.setAttribute('id', 'mood-range');
  }, [value, label, still, target, presentation]);
  useEffect(() => {
    const element = slider.current;
    function key(event: KeyboardEvent) {
      const amount = event.shiftKey ? 10 : 1;
      const delta: Record<string, number> = { ArrowRight: amount, ArrowUp: amount, ArrowLeft: -amount, ArrowDown: -amount, PageUp: 10, PageDown: -10 };
      if (!(event.key in delta) && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      setValue(v => event.key === 'Home' ? 0 : event.key === 'End' ? 100 : clamp(v + delta[event.key]));
    }
    element?.addEventListener('keydown', key);
    return () => element?.removeEventListener('keydown', key);
  }, []);
  // A native range retains grab offset, pointer tracking, keyboard and platform cancellation.
  return <div className="mood-playground" ref={backdrop} data-theme="dark">
    <div className="mood-art-wrap"><svg className="mood-art" viewBox="0 0 440 440" aria-hidden="true" ref={svgRef}>{moodGeometry(79).map((shape, i) => <path key={i} d={shape.path} fill={shape.fill} />)}</svg><div className="mood-reflection" /></div>
    <output ref={output} className="mood-value" htmlFor="mood-range">{label}</output>
    <SoapBubbleMaterial {...DARK_GLASS} backdrop={backdrop} paused={still || !visible}>
      <SoapBubbleSlider ref={slider} min={0} max={100} step={0.01} value={value} onValueChange={setValue} label="How are you feeling?" from="#a797cf" to="#ccb893" scale={1.65} className="mood-glass-slider" />
    </SoapBubbleMaterial>
    <div className="range-labels"><span>Very unpleasant</span><span>Very pleasant</span></div>
  </div>;
}

function BreathingMoment() {
  const ref = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const orb = useRef<BreathOrb | null>(null);
  const clock = useRef(0);
  const label = useRef<HTMLSpanElement>(null);
  const subLabel = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: .2 });
  const still = useContext(MotionContext);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const context = element.getContext('2d');
    if (!context) return;
    if (!orb.current) orb.current = new BreathOrb();
    if (still && clock.current === 0) clock.current = 5;
    let frame = 0, previous = 0, width = 0, height = 0;
    const paint = (dt = 0) => {
      if (!width || !height) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const pixelWidth = Math.round(width * dpr), pixelHeight = Math.round(height * dpr);
      if (element.width !== pixelWidth || element.height !== pixelHeight) {
        element.width = pixelWidth; element.height = pixelHeight;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      orb.current!.draw(context, width, height, clock.current, dt);
      const phase = breathPhaseAt(clock.current);
      element.dataset.phase = phase.name;
      const nextLabel = still ? 'A moment for you' : phase.label;
      const nextSubLabel = still ? '' : phase.subLabel;
      if (label.current && label.current.textContent !== nextLabel) label.current.textContent = nextLabel;
      if (subLabel.current && subLabel.current.textContent !== nextSubLabel) subLabel.current.textContent = nextSubLabel;
    };
    const tick = (now: number) => {
      const dt = previous ? Math.min((now - previous) / 1000, .05) : 0;
      previous = now; clock.current += dt; paint(dt);
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame); previous = 0;
      paint();
      if (inView && !still && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const measure = () => {
      const box = element.getBoundingClientRect(); width = box.width; height = box.height; paint();
    };
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    window.addEventListener('resize', measure);
    document.addEventListener('visibilitychange', sync);
    measure(); sync();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); window.removeEventListener('resize', measure); document.removeEventListener('visibilitychange', sync); };
  }, [inView, still]);
  return <div className="breathing-visual" ref={ref}>
    <canvas ref={canvas} className="breath-orb-canvas" aria-hidden="true" />
    <div className="breath-caption"><span ref={label}>Breathe in</span><span ref={subLabel}>expand with the circle</span></div>
  </div>;
}

function Experience() {
  // Separate mount points keep product copy visible even if the enhancement fails.
  return <MotionProvider><PortalMount /></MotionProvider>;
}
import { createPortal } from 'react-dom';
function PortalMount() {
  return <>
    {createPortal(<HeroDevice />, document.querySelector('#hero-device')!)}
    {createPortal(<FeatureShowcase />, document.querySelector('#feature-showcase')!)}
    {createPortal(<MoodPlayground />, document.querySelector('#mood-playground')!)}
    {createPortal(<BreathingMoment />, document.querySelector('#breathing-moment')!)}
  </>;
}

// Clear only static preview substitutes, leaving product copy in the HTML.
['hero-device', 'feature-showcase', 'mood-playground', 'breathing-moment'].forEach(id => document.getElementById(id)?.replaceChildren());
createRoot(document.getElementById('experience-root')!).render(<Experience />);

function pressFeedback() {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll<HTMLElement>('.button, .motion-button').forEach(element => {
    const scale = independentScale(element);
    const pressed = (event: PointerEvent) => { if (event.button === 0) scale.to(.965); };
    const released = () => scale.to(1);
    element.addEventListener('pointerdown', pressed);
    element.addEventListener('pointerup', released);
    element.addEventListener('pointercancel', released);
    element.addEventListener('pointerleave', released);
    element.addEventListener('blur', released);
    element.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') scale.to(.965); });
    element.addEventListener('keyup', released);
    function independentScale(el: HTMLElement) {
      let current = 1, velocity = 0, lastTime = performance.now();
      let animation: ReturnType<typeof animate> | undefined;
      return { to(value: number) {
        animation?.stop();
        if (media.matches || document.body.classList.contains('motion-paused')) { el.style.transform = ''; current = 1; return; }
        const now = performance.now();
        if (now - lastTime > 80) velocity = 0;
        animation = animate(current, value, { ...MOVE, velocity, onUpdate(v) {
          const now = performance.now(); velocity = (v - current) / Math.max(.001, (now - lastTime) / 1000); lastTime = now; current = v;
          el.style.transform = `scale(${v})`;
        } });
      } };
    }
  });
}
pressFeedback();
document.querySelectorAll<HTMLDetailsElement>('.demo-details').forEach(details => details.addEventListener('toggle', () => { if (!details.open) details.querySelector('video')?.pause(); }));
