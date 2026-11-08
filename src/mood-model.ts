export const MOODS = ['Very unpleasant', 'Unpleasant', 'Slightly unpleasant', 'Neutral', 'Slightly pleasant', 'Pleasant', 'Very pleasant'];
const PALETTES = [
  ['#d6c3ec', '#b193d7', '#8c68b4'],
  ['#c2d5ee', '#97b6df', '#698fc4'],
  ['#c8dfe8', '#98c1d0', '#729eaf'],
  ['#cce6df', '#9ecbc0', '#73ab9b'],
  ['#d4e7ad', '#b6d47f', '#96bd5a'],
  ['#e9eaa4', '#d2d978', '#b7c450'],
  ['#f6d0ad', '#eeb183', '#e18c57'],
];
export const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
export const moodLabel = (value: number) => MOODS[Math.round(clamp(value) / 100 * 6)];
function mixHex(a: string, b: string, t: number) {
  return '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
}
function radial(index: number, angle: number) {
  const shapes = [
    1 + .15 * Math.cos(8 * angle) + .025 * Math.cos(16 * angle),
    1 + .12 * Math.cos(8 * angle + .2),
    1 + .08 * Math.cos(7 * angle + .2),
    1 + .018 * Math.cos(5 * angle),
    1 + .085 * Math.cos(5 * angle + .3),
    1 + .16 * Math.cos(5 * angle + .3),
    1 + .2 * Math.cos(5 * angle + .3),
  ];
  return shapes[index];
}
export function moodGeometry(value: number) {
  const position = clamp(value) / 100 * 6;
  const lo = Math.min(5, Math.floor(position));
  const t = position - lo;
  const smooth = t * t * (3 - 2 * t);
  return [0, 1, 2].map(layer => {
    const radius = 163 - layer * 32;
    const path = Array.from({ length: 241 }, (_, i) => {
      const a = i / 240 * Math.PI * 2;
      const r = radius * (radial(lo, a) * (1 - smooth) + radial(lo + 1, a) * smooth);
      return `${i ? 'L' : 'M'}${(220 + Math.cos(a) * r).toFixed(3)},${(220 + Math.sin(a) * r).toFixed(3)}`;
    }).join(' ') + 'Z';
    return { path, fill: mixHex(PALETTES[lo][layer], PALETTES[lo + 1][layer], smooth) };
  });
}
export function rubberBand(value: number, min: number, max: number, length = 90) {
  if (value >= min && value <= max) return value;
  const edge = value < min ? min : max;
  const distance = value - edge;
  return edge + Math.sign(distance) * length * (1 - 1 / (Math.abs(distance) / length + 1));
}
export function projectedSlide(position: number, velocity: number, spacing: number, count: number) {
  // Integral of v(t) = v0 * exp(-8t), followed by a bounded snap.
  const resting = position + velocity / 8;
  return clamp(Math.round(-resting / spacing), 0, count - 1);
}
