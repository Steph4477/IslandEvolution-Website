export type VideoConsent = 'allowed' | 'refused';

export const videoConsentKey = 'island-evolution:youtube-consent';
export const videoConsentMaxAge = 180 * 24 * 60 * 60 * 1000;

export function readVideoConsent(raw: string | null, now = Date.now()): VideoConsent | null {
  if (!raw) return null;
  try {
    const { choice, expiresAt } = JSON.parse(raw) ?? {};
    if ((choice === 'allowed' || choice === 'refused')
      && Number.isFinite(expiresAt) && expiresAt > now && expiresAt <= now + videoConsentMaxAge) return choice;
  } catch {
    // An unavailable or invalid choice must not load the players.
  }
  return null;
}
