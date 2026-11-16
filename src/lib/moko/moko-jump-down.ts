import { mokoAnimations } from './moko-manifest';

const path = 'images/moko/jump-down.png';
const idle = mokoAnimations.idle.render;

// Atlas et cadence SpriteFrames de jump_down dans islandEvolution3D/Player/player.tscn.
export const jumpDown = {
  fps: 5,
  loop: false,
  render: {
    scale: idle.scale,
    x: idle.x - idle.scale * (159 - 154) / 320,
    y: idle.y - idle.scale / 320
  },
  frames: [0, 320].map((x) => ({
    path,
    rect: [x, 0, 320, 320],
    sheet: { width: 640, height: 320 },
    durationMs: 200
  } as const)),
  animationPlayer: { durationMs: 400, loopMode: 0, keys: [[0, 0], [200, 1]] }
} as const;
