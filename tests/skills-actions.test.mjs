import assert from 'node:assert/strict';
import test from 'node:test';
import { acceptsSkill, cocoShotTiming, jumpDuration, skillsJumpLift, skillsJumpPeak } from '../src/lib/scene/skills-actions.ts';

test('only Coco Shot can be added to a jump in progress', () => {
  assert(acceptsSkill('idle', 'jump'));
  assert(acceptsSkill('idle', 'shoot'));
  assert(acceptsSkill('jump', 'shoot'));
  assert(!acceptsSkill('jump', 'jump'));
  for (const state of ['unavailable', 'loot', 'shoot', 'jump_shoot']) {
    assert(!acceptsSkill(state, 'jump'), state);
    assert(!acceptsSkill(state, 'shoot'), state);
  }
});

test('one impulse returns to the original ground point', () => {
  assert.equal(skillsJumpLift(0), 0);
  assert.equal(skillsJumpLift(1), 0);
  assert(skillsJumpLift(.5) > skillsJumpLift(.25));
  assert.equal(skillsJumpLift(.25), skillsJumpLift(.75));
});
test('the Coco follows the release pose at ground level and in the air', () => {
  assert.deepEqual(cocoShotTiming(1000), { animationStart: 1000, releaseAt: 1500 });
  const jumpStart = 1000;
  assert.deepEqual(cocoShotTiming(1100, jumpStart), { animationStart: 1100, releaseAt: 1500 });
  const lateClick = jumpStart + jumpDuration - 70;
  const late = cocoShotTiming(lateClick, jumpStart);
  assert(late.releaseAt >= lateClick);
  assert(late.releaseAt < jumpStart + jumpDuration);
  assert.equal(late.releaseAt - late.animationStart, 400);
});

test('Skills gains 50% height in the viewport and still respects the upper edge', () => {
  for (const size of [172, 304, 228]) {
    assert.equal(skillsJumpPeak(size, 240), Math.min(132, size * .54) * .62 * 1.5);
  }
  assert.equal(skillsJumpPeak(228, 45), 45);
  assert.equal(skillsJumpPeak(228, -10), 0);
});
