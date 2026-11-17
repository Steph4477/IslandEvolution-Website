import { parsePublicSiteUrl } from './site-url';

export const siteName = 'Island Evolution';
export const title = `Moko - ${siteName}`;
export const descriptions = {
  fr: 'Découvrez Moko dans Island Evolution, un jeu de plateforme 2D développé sous Godot. Explorez une jungle mystérieuse et affrontez des ennemis qui évoluent.',
  en: 'Meet Moko in Island Evolution, a 2D platformer made with Godot. Explore a mysterious jungle and face enemies that evolve.'
};
export const siteUrl = parsePublicSiteUrl(import.meta.env.VITE_SITE_URL);
export const socialImage = siteUrl && new URL('social/island-evolution.jpg', siteUrl).href;
export const socialImageAlts = {
  fr: 'Moko bondit avec une noix de coco enflammée face à un serpent devant un temple de jungle.',
  en: 'Moko leaps with a flaming coconut as he faces a snake outside a jungle temple.'
};

const gameId = siteUrl && new URL('#jeu', siteUrl).href;
const data = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: siteName,
      description: descriptions.fr,
      inLanguage: ['fr', 'en'],
      ...(siteUrl && { url: siteUrl.href, about: { '@id': gameId } })
    },
    {
      '@type': 'VideoGame',
      name: siteName,
      description: descriptions.fr,
      genre: 'Jeu de plateforme 2D',
      ...(gameId && { '@id': gameId, url: siteUrl?.href, image: socialImage })
    }
  ]
};

export const structuredData = '<script type="application/ld+json">' +
  JSON.stringify(data).replace(/</g, '\\u003c') + '</script>';
