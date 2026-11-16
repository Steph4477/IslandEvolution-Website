import { mokoAnimations as exportedAnimations } from './moko-manifest';
import { climbLianaCycle } from './moko-liana-cycle';
import { jumpDown } from './moko-jump-down';
import { jumpUp } from './moko-jump-up';
import { mokoAttacks } from './moko-attacks';
import { mokoWalk } from './moko-walk';

export const mokoAnimations = {
  ...exportedAnimations,
  ...mokoAttacks,
  walk: mokoWalk,
  climb_liana_cycle: climbLianaCycle,
  jump_down: jumpDown,
  jump_up: jumpUp
};

export type MokoClip = keyof typeof mokoAnimations;

export function mokoFrame(name: MokoClip, elapsedMs: number) {
  const { frames, animationPlayer } = mokoAnimations[name];
  const time = animationPlayer.loopMode === 1
    ? elapsedMs % animationPlayer.durationMs
    : elapsedMs;
  const index = animationPlayer.keys.findLast(([at]) => at <= time)?.[1] ?? 0;
  return frames[index] ?? frames[0];
}
