import type { Language } from './i18n';
import { parsePublicSiteUrl } from './site-url';

export const siteName = 'MOKO - Island Evolution';
export const titles = {
  fr: `${siteName} | Jeu de plateforme Android`,
  en: `${siteName} | 2D Android Platformer`
};
export const descriptions = {
  fr: "Découvrez MOKO - Island Evolution, un jeu d'aventure et de plateforme 2D pour Android. Explorez une île mystérieuse, affrontez des ennemis évolutifs et relevez des défis progressifs.",
  en: 'Discover MOKO - Island Evolution, a 2D adventure platformer for Android. Explore a mysterious island, face evolving enemies and overcome increasingly challenging trials.'
};
export const siteUrl = parsePublicSiteUrl(import.meta.env.VITE_SITE_URL);
export const socialImage = siteUrl && new URL('social/island-evolution.jpg', siteUrl).href;
export const socialImageAlts = {
  fr: 'Moko bondit avec une noix de coco enflammée face à un serpent devant un temple de jungle.',
  en: 'Moko leaps with a flaming coconut as he faces a snake outside a jungle temple.'
};

const gameId = siteUrl && new URL('#jeu', siteUrl).href;
const genres = {
  fr: "Jeu d'aventure et de plateforme 2D",
  en: '2D adventure platformer'
};

export function structuredData(language: Language) {
  const description = descriptions[language];
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: siteName,
        description,
        inLanguage: ['fr', 'en'],
        ...(siteUrl && { url: siteUrl.href, about: { '@id': gameId } })
      },
      {
        '@type': 'VideoGame',
        name: siteName,
        description,
        genre: genres[language],
        gamePlatform: 'Android',
        ...(gameId && { '@id': gameId, url: siteUrl?.href, image: socialImage })
      }
    ]
  };

  return (
    '<script type="application/ld+json">' +
    JSON.stringify(data).replace(/</g, '\\u003c') +
    '</script>'
  );
}
