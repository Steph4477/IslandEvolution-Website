import { siteUrl } from '../../lib/seo';

export const prerender = true;

export function GET() {
  const sitemap = siteUrl ? `Sitemap: ${new URL('sitemap.xml', siteUrl).href}\n` : '';
  return new Response(`User-agent: *\nAllow: /\n${sitemap}`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
}
