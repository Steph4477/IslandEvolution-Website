// Ouverture autorisée pour la prochaine publication, après la recette finale.
export const betaApplicationsOpen = true;
export const betaEmailMaxLength = 254;
export const betaNicknameMaxLength = 64;

type Application = { nickname: string; email: string; androidConfirmed: boolean; policyRead: boolean };

export const androidConfirmation = {
  fr: "Je confirme disposer d'un appareil Android avec accès à Google Play.",
  en: 'I confirm that I have an Android device with access to Google Play.'
};

// HTML email syntax with at least two domain labels.
const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export function trimBetaEmail(email: string) {
  // Trim space separators, keeping control characters and line breaks available for validation.
  return email.replace(/^\p{Zs}+|\p{Zs}+$/gu, '');
}

export function hasInvalidBetaCharacters(value: string) {
  // With the Unicode flag, a valid surrogate pair is read as one code point.
  return /[\p{Cc}\u2028\u2029\uD800-\uDFFF]/u.test(value);
}

export function validateBetaApplication({ nickname, email, androidConfirmed, policyRead }: Application) {
  const trimmedEmail = trimBetaEmail(email);
  return {
    email: !trimmedEmail ? 'missing'
      : trimmedEmail.length > betaEmailMaxLength ? 'tooLong'
      : hasInvalidBetaCharacters(trimmedEmail) || !emailPattern.test(trimmedEmail) ? 'invalid'
      : undefined,
    nickname: nickname.length > betaNicknameMaxLength ? 'tooLong'
      : hasInvalidBetaCharacters(nickname) ? 'invalid'
      : undefined,
    androidConfirmed: androidConfirmed !== true,
    policyRead: policyRead !== true
  } as const;
}

export function buildBetaMailto(language: 'fr' | 'en', application: Application) {
  const errors = validateBetaApplication(application);
  if (errors.email || errors.nickname || errors.androidConfirmed || errors.policyRead) return undefined;
  const { nickname } = application;
  const email = trimBetaEmail(application.email);
  const subject = language === 'fr'
    ? 'Candidature bêta Android — MOKO Island Evolution'
    : 'Android Beta Application — MOKO Island Evolution';
  const lines = language === 'fr' ? [
    'Bonjour,', '',
    'Je souhaite participer à la bêta Android de MOKO – Island Evolution.', '',
    `Pseudo : ${nickname || 'Non renseigné'}`,
    `Adresse Google Play : ${email}`, '',
    androidConfirmation.fr,
    "J'ai pris connaissance de la politique de confidentialité."
  ] : [
    'Hello,', '',
    'I would like to participate in the Android beta of MOKO – Island Evolution.', '',
    `Nickname: ${nickname || 'Not provided'}`,
    `Google Play email: ${email}`, '',
    androidConfirmation.en,
    'I have read the Privacy Policy.'
  ];
  return `mailto:moko.islandevolution@outlook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\r\n'))}`;
}

export function betaApplicationDestination(language: 'fr' | 'en', application: Application) {
  if (!betaApplicationsOpen) return undefined;
  return buildBetaMailto(language, application);
}
