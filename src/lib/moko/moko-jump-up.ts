import { mokoAnimations } from './moko-manifest';

const path = 'images/moko/jump-up.png';

// Découpes SpriteFrames et clés AnimationPlayer de jump_up dans Player/player.tscn.
export const jumpUp = {
  fps: 5,
  loop: false,
  render: mokoAnimations.idle.render,
  frames: [0, 320].map(
    (x) =>
      ({
        path,
        rect: [x, 0, 320, 320],
        sheet: { width: 640, height: 320 },
        durationMs: 200
      }) as const
  ),
  animationPlayer: {
    durationMs: 800,
    loopMode: 0,
    keys: [
      [0, 0],
      [233.33333, 1]
    ]
  }
} as const;
