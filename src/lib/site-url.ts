export function parsePublicSiteUrl(value: string | undefined): URL | undefined {
  if (!value?.trim()) return;

  const url = new URL(value.trim());
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !/^\/(?:[\w.-]+\/)*[\w.-]*$/.test(url.pathname)
  ) {
    throw new Error(
      'VITE_SITE_URL doit être une URL HTTPS publique pointant vers la page d’accueil.'
    );
  }
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url;
}
