import { parsePublicSiteUrl } from './site-url';

export const siteName = 'Island Evolution';
export const title = `Moko - ${siteName}`;
export const description =
  'Découvrez Moko dans Island Evolution, un jeu de plateforme 2D développé sous Godot. Explorez une jungle mystérieuse et affrontez des ennemis qui évoluent.';
export const siteUrl = parsePublicSiteUrl(import.meta.env.VITE_SITE_URL);
export const socialImage = siteUrl && new URL('social/island-evolution.jpg', siteUrl).href;
export const socialImageAlt = 'Capture de gameplay d’Island Evolution dans la jungle';

const gameId = siteUrl && new URL('#jeu', siteUrl).href;
const data = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: siteName,
      description,
      inLanguage: 'fr',
      ...(siteUrl && { url: siteUrl.href, about: { '@id': gameId } })
    },
    {
      '@type': 'VideoGame',
      name: siteName,
      description,
      genre: 'Jeu de plateforme 2D',
      ...(gameId && { '@id': gameId, url: siteUrl?.href, image: socialImage })
    }
  ]
};

export const structuredData = '<script type="application/ld+json">' +
  JSON.stringify(data).replace(/</g, '\\u003c') + '</script>';
