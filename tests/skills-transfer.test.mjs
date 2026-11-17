import assert from 'node:assert/strict';
import test from 'node:test';
import { skillsGround, skillsGroundOffset, wantsSkillsGround } from '../src/lib/scene/skills-transfer.ts';

test('Skills uses a wider exit threshold than entry', () => {
  for (const height of [780, 1024, 820]) {
    assert.equal(wantsSkillsGround(height * .93, height, false), false);
    assert.equal(wantsSkillsGround(height * .88, height, false), true);
    assert.equal(wantsSkillsGround(height * .93, height, true), true);
    assert.equal(wantsSkillsGround(height * .99, height, true), false);
  }
});

test('the end of the scene exposes the same clearing on narrow screens', () => {
  assert.equal(skillsGroundOffset(400, 360, 2), -0);
  assert.equal(skillsGroundOffset(0, 1280, 2), 0);
  for (const width of [360, 768]) {
    const scale = 2;
    assert.equal(skillsGround.x * scale + skillsGroundOffset(0, width, scale), width * .6);
  }
});
