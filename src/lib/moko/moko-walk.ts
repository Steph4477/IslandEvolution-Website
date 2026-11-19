import { mokoAnimations } from './moko-manifest';

// SpriteFrames à 5 FPS et clés de marche de Player/player.tscn.
export const mokoWalk = {
  fps: 5,
  loop: true,
  render: mokoAnimations.idle.render,
  frames: Array.from(
    { length: 5 },
    (_, frame) =>
      ({
        path: 'images/moko/walk.png',
        rect: [frame * 320, 0, 320, 320],
        sheet: { width: 1600, height: 320 },
        durationMs: 200
      }) as const
  ),
  animationPlayer: {
    durationMs: 1500,
    loopMode: 1,
    keys: [
      [0, 0],
      [300, 1],
      [600, 2],
      [900, 3],
      [1200, 4]
    ]
  }
} as const;
