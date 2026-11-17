export type Skill = 'jump' | 'shoot';
export type SkillsState = 'unavailable' | 'loot' | 'idle' | 'jump' | 'shoot' | 'jump_shoot';

export const jumpDuration = 820;
export function acceptsSkill(state: SkillsState, skill: Skill) {
  return state === 'idle' || (state === 'jump' && skill === 'shoot');
}

export function skillsJumpLift(progress: number) {
  return 4 * progress * (1 - progress);
}

export function skillsJumpPeak(spriteSize: number, clearance: number) {
  const previousPeak = Math.min(132, spriteSize * .54) * .62;
  return Math.max(0, Math.min(previousPeak * 1.5, clearance));
}

export function cocoShotTiming(now: number, jumpStart?: number) {
  if (jumpStart === undefined) return { animationStart: now, releaseAt: now + 500 };
  // Aligner la sortie de la Coco sur la main tendue, même pour un tir tardif.
  const releaseAt = Math.max(now, Math.min(now + 400, jumpStart + jumpDuration - 20));
  return { animationStart: releaseAt - 400, releaseAt };
}
