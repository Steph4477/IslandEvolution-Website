export const introTiming = {
  entry: 750,
  landing: 3850,
  pullback: 4550,
  rejoin: 5900,
  end: 6850
};

export function introProgress(time: number, start: number, end: number) {
  return Math.max(0, Math.min(1, (time - start) / (end - start)));
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const openingScale = 0.45;
const landingScale = 1.16;

export function introCamera(time: number) {
  const { entry, landing, pullback, rejoin, end } = introTiming;
  const approach = smooth(introProgress(time, entry, landing));
  const withdrawal = smooth(introProgress(time, pullback, rejoin));
  return {
    scale:
      openingScale + (landingScale - openingScale) * approach - (landingScale - 1) * withdrawal,
    blur: 30 * approach * (1 - withdrawal),
    pan: approach * (1 - smooth(introProgress(time, rejoin, end)))
  };
}
