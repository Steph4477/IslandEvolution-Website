// Shoot/Player/Coconut/coconut.gd et réglages par défaut GodotPhysics2D.
const step = 1 / 60;
const gravity = 980;
const damping = 1 - 0.1 * step;
const lifetime = 3;

export function cocoTrajectory(unitsToCss: number, right: number, bottom: number) {
  const frames = [{ time: 0, x: 0, y: 0 }];
  let horizontal = 1000 * unitsToCss;
  let vertical = 0;
  let x = 0;
  let y = 0;

  for (let tick = 1; tick <= lifetime / step; tick++) {
    horizontal *= damping;
    vertical = vertical * damping + gravity * unitsToCss * step;
    const dx = horizontal * step;
    const dy = vertical * step;
    const fraction = Math.max(0, Math.min(1, (right - x) / dx, (bottom - y) / dy));
    x += dx * fraction;
    y += dy * fraction;
    frames.push({ time: (tick - 1 + fraction) * step * 1000, x, y });
    if (fraction < 1) break;
  }
  return frames;
}
