import test from 'node:test';
import assert from 'node:assert/strict';
import { moodGeometry, moodLabel, rubberBand, projectedSlide } from '../src/mood-model.ts';

test('mood geometry and colors stay continuous across all six anchor boundaries', () => {
  for (let i = 1; i < 6; i++) {
    const boundary = i * 100 / 6;
    const before = moodGeometry(boundary - .001);
    const after = moodGeometry(boundary + .001);
    before.forEach((layer, n) => {
      const a = layer.path.match(/-?\d+(?:\.\d+)?/g).map(Number);
      const b = after[n].path.match(/-?\d+(?:\.\d+)?/g).map(Number);
      assert.equal(a.length, b.length);
      assert.ok(a.every((v, j) => Math.abs(v - b[j]) < .01));
      assert.equal(layer.fill, after[n].fill);
    });
  }
});
test('fractional input changes geometry without snapping to a whole mood', () => {
  assert.notEqual(moodGeometry(42.5)[0].path, moodGeometry(42.6)[0].path);
  assert.notEqual(moodGeometry(42.5)[0].fill, moodGeometry(43.5)[0].fill);
  assert.equal(moodLabel(-10), 'Very unpleasant');
  assert.equal(moodLabel(110), 'Very pleasant');
});
test('release momentum changes the selected target in the direction of travel', () => {
  assert.equal(projectedSlide(-130, 0, 390, 3), 0);
  assert.equal(projectedSlide(-130, -1000, 390, 3), 1);
  assert.equal(projectedSlide(-590, 0, 390, 3), 2);
  assert.equal(projectedSlide(-590, 1000, 390, 3), 1);
  assert.equal(projectedSlide(100, 2000, 390, 3), 0);
  assert.equal(projectedSlide(-900, -2000, 390, 3), 2);
});
test('edge resistance is continuous, monotone, and bounded instead of a hard stop', () => {
  assert.equal(rubberBand(-390, -780, 0), -390);
  assert.ok(rubberBand(1, -780, 0) > 0);
  assert.ok(rubberBand(100, -780, 0) > rubberBand(50, -780, 0));
  assert.ok(rubberBand(10000, -780, 0) < 90);
  assert.ok(rubberBand(-10000, -780, 0) > -870);
  assert.equal(rubberBand(0, -780, 0), 0);
});

import { BreathOrb, breathPhaseAt, breathEnvelope } from '../src/breath-orb.ts';
test('native breathing phases use the supplied 4–4–6–2 rhythm and wrap cleanly', () => {
  const expected = [[0, 'inhale'], [3.99, 'inhale'], [4, 'holdIn'], [7.99, 'holdIn'], [8, 'exhale'], [13.99, 'exhale'], [14, 'holdOut'], [15.99, 'holdOut'], [16, 'inhale'], [20, 'holdIn']];
  for (const [time, phase] of expected) assert.equal(breathPhaseAt(time).name, phase);
  assert.equal(breathPhaseAt(16).progress, 0);
});
test('orb expands and contracts using the native double-sine envelope', () => {
  assert.equal(breathEnvelope(0, 100).radius, 22);
  assert.ok(Math.abs(breathEnvelope(2, 100).radius - 61) < .0001);
  assert.equal(breathEnvelope(8, 100).radius, 100);
  assert.ok(Math.abs(breathEnvelope(11, 100).radius - 61) < .0001);
  assert.ok(breathEnvelope(13.999, 100).radius < 22.001);
});
test('BreathOrb preserves 120 native particles and their initialized ranges', () => {
  const orb = new BreathOrb(() => .5);
  assert.equal(orb.particles.length, 120);
  assert.equal(BreathOrb.maxTrailLength, 8);
  for (const particle of orb.particles) {
    assert.ok(particle.size >= 2.5 && particle.size < 5);
    assert.ok(particle.opacityBase >= .35 && particle.opacityBase < .9);
    assert.ok(particle.chaosRadius >= 20 && particle.chaosRadius < 90);
  }
});

test('expanded galleries project within their own item counts', () => {
  assert.equal(projectedSlide(-9999, -1000, 390, 5), 4);
  assert.equal(projectedSlide(-9999, -1000, 390, 2), 1);
});
