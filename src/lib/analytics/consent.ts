export type AnalyticsChoice = 'allowed' | 'refused';

type AnalyticsConsent = {
  choice: AnalyticsChoice;
  expiresAt: number;
  generation: string;
};

export const analyticsConsentKey = 'island-evolution:umami-consent:v1';
export const analyticsConsentMaxAge = 180 * 24 * 60 * 60 * 1000;

export function parseAnalyticsConsent(
  raw: string | null,
  now = Date.now()
): AnalyticsConsent | null {
  if (!raw) return null;

  try {
    const {
      choice,
      expiresAt,
      generation
    }: {
      choice?: unknown;
      expiresAt?: unknown;
      generation?: unknown;
    } = JSON.parse(raw) ?? {};
    if (
      (choice === 'allowed' || choice === 'refused') &&
      typeof expiresAt === 'number' &&
      Number.isFinite(expiresAt) &&
      expiresAt > now &&
      expiresAt <= now + analyticsConsentMaxAge &&
      (generation === undefined || (typeof generation === 'string' && generation.length > 0))
    ) {
      return { choice, expiresAt, generation: generation ?? `legacy:${expiresAt}` };
    }
  } catch {
    // Une préférence illisible ne vaut pas accord.
  }
  return null;
}

export function parseAnalyticsChoice(raw: string | null, now = Date.now()): AnalyticsChoice | null {
  return parseAnalyticsConsent(raw, now)?.choice ?? null;
}

export function readAnalyticsConsent() {
  try {
    return parseAnalyticsConsent(localStorage.getItem(analyticsConsentKey));
  } catch {
    return null;
  }
}

export function readAnalyticsChoice(): AnalyticsChoice | null {
  return readAnalyticsConsent()?.choice ?? null;
}

export function saveAnalyticsChoice(choice: AnalyticsChoice): boolean {
  try {
    localStorage.setItem(
      analyticsConsentKey,
      JSON.stringify({
        choice,
        expiresAt: Date.now() + analyticsConsentMaxAge,
        ...(choice === 'allowed' && { generation: crypto.randomUUID() })
      })
    );
    return true;
  } catch {
    if (choice === 'refused') {
      try {
        localStorage.removeItem(analyticsConsentKey);
      } catch {
        // Le retrait reste appliqué dans l’onglet courant.
      }
    }
    return false;
  }
}
