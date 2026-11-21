export type VideoConsent = 'allowed' | 'refused';
export const videoConsentKey = 'island-evolution:youtube-consent';
export const videoConsentMaxAge = 180 * 24 * 60 * 60 * 1000;

export function parseVideoConsent(
  raw: string | null,
  now = Date.now()
): { choice: VideoConsent; expiresAt: number } | null {
  if (!raw) return null;
  try {
    const { choice, expiresAt } = JSON.parse(raw) ?? {};
    if (
      (choice === 'allowed' || choice === 'refused') &&
      Number.isFinite(expiresAt) &&
      expiresAt > now &&
      expiresAt <= now + videoConsentMaxAge
    )
      return { choice, expiresAt };
  } catch {
    // Une préférence illisible ne vaut pas accord.
  }
  return null;
}

export function readVideoConsent(raw: string | null, now = Date.now()) {
  return parseVideoConsent(raw, now)?.choice ?? null;
}
export function saveVideoChoice(choice: VideoConsent) {
  try {
    localStorage.setItem(
      videoConsentKey,
      JSON.stringify({ choice, expiresAt: Date.now() + videoConsentMaxAge })
    );
    return true;
  } catch {
    if (choice === 'refused') {
      try {
        localStorage.removeItem(videoConsentKey);
      } catch {
        /* Le blocage local reste actif. */
      }
    }
    return false;
  }
}
