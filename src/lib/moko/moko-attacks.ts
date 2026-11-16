import { mokoAnimations } from './moko-manifest';

export type MokoAttack = 'kick' | 'clac';

function attackFrames(name: MokoAttack) {
  const path = `images/moko/${name}.png` as const;
  return [0, 320, 640, 960].map((x) => ({
    path,
    rect: [x, 0, 320, 320],
    sheet: { width: 1280, height: 320 },
    durationMs: 200
  } as const));
}

// Découpes SpriteFrames et clés AnimationPlayer de Player/player.tscn.
export const mokoAttacks = {
  kick: {
    render: mokoAnimations.idle.render,
    frames: attackFrames('kick'),
    animationPlayer: { durationMs: 650, loopMode: 0, keys: [[0, 0], [220, 1], [350, 2], [520, 3]] }
  },
  clac: {
    render: mokoAnimations.idle.render,
    frames: attackFrames('clac'),
    animationPlayer: { durationMs: 500, loopMode: 0, keys: [[0, 0], [100, 2], [233.33333, 3], [300, 2], [400, 1]] }
  }
} as const;
