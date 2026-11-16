import { mokoAnimations } from './moko-manifest';

const pose = mokoAnimations.climb_liana.render;
// Le cycle a des marges différentes. Aligne sa main sur celle de la pose fixe.
const scale = pose.scale * 176 / 163;
const frameSize = 320;
const path = 'images/moko/climb-liana-cycle.png';

// islandEvolution3D/Player/player.tscn : AtlasTexture_moko3d_climb_liana_0..3
// et Animation_pisgm (climb_liana).
export const climbLianaCycle = {
  fps: 5,
  loop: true,
  render: {
    scale,
    x: pose.x + (pose.scale * 200 - scale * 205) / frameSize,
    y: pose.y + (pose.scale * 165 - scale * 141) / frameSize
  },
  frames: [0, 320, 640, 960].map((x) => ({
    path,
    rect: [x, 0, frameSize, frameSize],
    sheet: { width: 1280, height: 320 },
    durationMs: 200
  } as const)),
  animationPlayer: { durationMs: 800, loopMode: 1, keys: [[0, 0], [200, 1], [400, 2], [600, 3]] }
} as const;
