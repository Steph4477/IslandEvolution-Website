import type { Language } from './i18n';

const languageKey = 'island-evolution:language';

export function readPageLanguage(
  requested: string | null,
  readStored = () => localStorage.getItem(languageKey)
): Language {
  if (requested !== null) return requested === 'en' ? 'en' : 'fr';

  try {
    return readStored() === 'en' ? 'en' : 'fr';
  } catch {
    // Le stockage peut être indisponible, notamment en navigation privée.
    return 'fr';
  }
}

export function rememberPageLanguage(language: Language) {
  try {
    localStorage.setItem(languageKey, language);
  } catch {
    // Le changement de langue est déjà appliqué à la page en cours.
  }
}
