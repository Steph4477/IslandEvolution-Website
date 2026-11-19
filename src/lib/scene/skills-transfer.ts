export const skillsGround = { x: 322, y: 1959 } as const;

// Point de cadrage du décor, indépendant du point de contact de Moko.
const clearingX = 350;

export function skillsGroundOffset(remaining: number, viewportWidth: number, decorScale: number) {
  // Recentrer le chemin à la fin du décor lorsque le tronc le masque à l’écran.
  const offset = Math.min(0, viewportWidth * 0.6 - clearingX * decorScale);
  const t = Math.max(0, Math.min(1, (380 - remaining) / 270));
  return offset * t * t * (3 - 2 * t);
}

export function wantsSkillsGround(
  landingY: number,
  viewportHeight: number,
  alreadyHeadingToGround: boolean
) {
  return landingY <= viewportHeight * (alreadyHeadingToGround ? 0.98 : 0.89);
}
