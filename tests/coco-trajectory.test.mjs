import assert from 'node:assert/strict';
import test from 'node:test';
import { cocoTrajectory } from '../src/lib/scene/coco-trajectory.ts';

test('Coco starts horizontal and follows Godot 2D gravity and damping', () => {
  const frames = cocoTrajectory(1, 600, 2000);
  assert.deepEqual(frames[0], { time: 0, x: 0, y: 0 });
  assert(Math.abs(frames[1].x - 1000 * (1 - .1 / 60) / 60) < .00001);
  assert(Math.abs(frames[1].y - 980 / 60 ** 2) < .00001);
  assert(frames[2].x - frames[1].x < frames[1].x);
  assert(frames[2].y - frames[1].y > frames[1].y);
  assert(Math.abs(frames.at(-1).x - 600) < .00001);
});

test('Coco is clipped at the first viewport edge or at the Godot lifetime', () => {
  assert(Math.abs(cocoTrajectory(.75, 900, 42).at(-1).y - 42) < .00001);
  assert.equal(cocoTrajectory(1, 10000, 10000).at(-1).time, 3000);
});
