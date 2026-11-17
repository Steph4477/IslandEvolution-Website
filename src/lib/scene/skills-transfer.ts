export const skillsGround = { x: 350, y: 1938 } as const;

export function skillsGroundOffset(remaining: number, viewportWidth: number, decorScale: number) {
  // Recentrer le chemin à la fin du décor lorsque le tronc le masque à l’écran.
  const offset = Math.min(0, viewportWidth * .6 - skillsGround.x * decorScale);
  const t = Math.max(0, Math.min(1, (380 - remaining) / 270));
  return offset * t * t * (3 - 2 * t);
}

export function wantsSkillsGround(landingY: number, viewportHeight: number, alreadyHeadingToGround: boolean) {
  return landingY <= viewportHeight * (alreadyHeadingToGround ? .98 : .89);
}
