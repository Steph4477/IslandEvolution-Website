import { mokoAnimations } from './moko-manifest';

// Atlas Moko3D, SpriteFrames et AnimationPlayer de Player/player.tscn.
function clip(name: 'loot-skill' | 'shoot' | 'jump-shoot', count: number, durationMs: number, keys: readonly (readonly [number, number])[]) {
  return {
    fps: 5,
    loop: false,
    render: mokoAnimations.idle.render,
    frames: Array.from({ length: count }, (_, index) => ({
      path: `images/moko/${name}.png`,
      rect: [index * 320, 0, 320, 320],
      sheet: { width: count * 320, height: 320 },
      durationMs: 200
    } as const)),
    animationPlayer: { durationMs, loopMode: 0, keys }
  } as const;
}

export const skillsAnimations = {
  // loot_skill est défini uniquement dans SpriteFrames.
  loot_skill: clip('loot-skill', 7, 1400, [[0, 0], [200, 1], [400, 2], [600, 3], [800, 4], [1000, 5], [1200, 6]]),
  shoot: clip('shoot', 6, 600, [[0, 0], [100, 1], [200, 2], [300, 3], [400, 4], [500, 5]]),
  jump_shoot: clip('jump-shoot', 7, 1000, [[0, 2], [199.99996, 3], [399.99998, 4], [599.99996, 5], [800, 6]])
} as const;
