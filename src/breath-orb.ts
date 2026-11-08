// Port of the supplied Swift BreathOrb / BreathParticle / OrbCanvasView.
// Keep the native 4–4–6–2 phase timing and double-sine interpolation.
export const BREATH_PHASES = [
  { name: 'inhale', duration: 4, label: 'Breathe in', subLabel: 'expand with the circle', hue: 185 },
  { name: 'holdIn', duration: 4, label: 'Hold', subLabel: 'stay still', hue: 200 },
  { name: 'exhale', duration: 6, label: 'Breathe out', subLabel: 'release with the circle', hue: 270 },
  { name: 'holdOut', duration: 2, label: 'Hold', subLabel: 'stay still', hue: 240 },
] as const;
export function breathPhaseAt(elapsed: number) {
  let time = ((elapsed % 16) + 16) % 16;
  for (const phase of BREATH_PHASES) {
    if (time < phase.duration) return { ...phase, progress: time / phase.duration };
    time -= phase.duration;
  }
  return { ...BREATH_PHASES[0], progress: 0 };
}
export const eSin = (t: number) => .5 - .5 * Math.cos(Math.PI * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export function breathEnvelope(elapsed: number, maxR: number) {
  const phase = breathPhaseAt(elapsed);
  const minR = maxR * .22;
  const smooth = eSin(eSin(phase.progress));
  switch (phase.name) {
    case 'inhale': return { blend: smooth, radius: lerp(minR, maxR, smooth) };
    case 'holdIn': return { blend: 1, radius: maxR + Math.sin(elapsed * 1.8) * maxR * .015 };
    case 'exhale': return { blend: 1 - smooth, radius: lerp(maxR, minR, smooth) };
    case 'holdOut': return { blend: 0, radius: minR + Math.sin(elapsed * 1.6) * minR * .07 };
  }
}
type Point = { x: number; y: number };
export class BreathParticle {
  baseAngle: number;
  chaosAngle: number;
  chaosRadius: number;
  chaosSpeed: number;
  chaosWobbleAmp: number;
  chaosWobblePhase: number;
  size: number;
  opacityBase: number;
  trail: Point[] = [];
  constructor(index: number, total: number, random = Math.random) {
    this.baseAngle = index / total * Math.PI * 2;
    this.chaosAngle = random() * Math.PI * 2;
    this.chaosRadius = 20 + random() * 70;
    this.chaosSpeed = -.018 + random() * .036;
    this.chaosWobbleAmp = random() * .8;
    this.chaosWobblePhase = random() * Math.PI * 2;
    this.size = 2.5 + random() * 2.5;
    this.opacityBase = .35 + random() * .55;
  }
}
export class BreathOrb {
  static particleCount = 120;
  static maxTrailLength = 8;
  particles: BreathParticle[];
  constructor(random = Math.random) {
    this.particles = Array.from({ length: BreathOrb.particleCount }, (_, i) => new BreathParticle(i, BreathOrb.particleCount, random));
  }
  draw(ctx: CanvasRenderingContext2D, width: number, height: number, elapsed: number, dt: number) {
    const cx = width / 2, cy = height / 2;
    const maxR = Math.min(cx, cy) * .62, minR = maxR * .22;
    const { blend, radius } = breathEnvelope(elapsed, maxR);
    const { hue } = breathPhaseAt(elapsed);
    const color = (h: number, saturation: number, lightness: number, alpha: number) => `hsla(${h}, ${saturation * 100}%, ${lightness * 100}%, ${alpha})`;
    ctx.clearRect(0, 0, width, height);
    if (blend > .05) {
      const glowR = radius * 1.3;
      const gradient = ctx.createRadialGradient(cx, cy, radius * .3, cx, cy, glowR);
      gradient.addColorStop(0, color(hue, .7, .55, blend * .2));
      gradient.addColorStop(1, color(hue, .7, .55, 0));
      ctx.fillStyle = gradient;
      ctx.beginPath(); ctx.arc(cx, cy, glowR, 0, Math.PI * 2); ctx.fill();
    }
    if (blend > .7) {
      const pulse = .5 + .5 * Math.sin(elapsed * 2.5);
      ctx.strokeStyle = color(hue, .65, .6, (blend - .7) / .3 * .25 + pulse * .08);
      ctx.lineWidth = 1.5 + blend * 2;
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
    }
    const rotation = elapsed * .08;
    const trailLen = Math.max(1, Math.trunc(blend * 6 + (1 - blend) * 2));
    const b3 = Math.pow(blend, .6);
    this.particles.forEach((p, i) => {
      // Swift advances per animation frame; normalize its 60Hz motion to elapsed time.
      p.chaosAngle += p.chaosSpeed * dt * 60;
      const scaledR = minR * .3 + p.chaosRadius / 90 * minR * 1.6;
      const wobble = Math.sin(elapsed * 1.3 + p.chaosWobblePhase) * p.chaosWobbleAmp * minR * .35 * (1 - blend);
      const chaosX = cx + Math.cos(p.chaosAngle) * (scaledR + wobble);
      const chaosY = cy + Math.sin(p.chaosAngle) * (scaledR + wobble);
      const angle = p.baseAngle + rotation;
      const x = lerp(chaosX, cx + Math.cos(angle) * radius, b3);
      const y = lerp(chaosY, cy + Math.sin(angle) * radius, b3);
      if (dt > 0 || !p.trail.length) {
        p.trail.push({ x, y });
        if (p.trail.length > BreathOrb.maxTrailLength) p.trail.shift();
      }
      if (blend > .05) {
        const start = Math.max(0, p.trail.length - trailLen);
        for (let t = start; t < p.trail.length - 1; t++) {
          const fraction = (t - start) / trailLen;
          const alpha = p.opacityBase * fraction * blend * .3;
          if (alpha <= .005) continue;
          ctx.lineCap = 'round'; ctx.lineWidth = p.size * fraction * .7;
          ctx.strokeStyle = color(hue, .65, .65, alpha);
          ctx.beginPath(); ctx.moveTo(p.trail[t].x, p.trail[t].y); ctx.lineTo(p.trail[t + 1].x, p.trail[t + 1].y); ctx.stroke();
        }
      }
      const size = p.size * (.7 + blend * .3);
      ctx.fillStyle = color(hue + i / BreathOrb.particleCount * 30 - 15, .65, .55 + blend * .1, p.opacityBase * .85);
      ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
    });
  }
}
