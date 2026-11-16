import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { parsePublicSiteUrl } from './src/lib/site-url.ts';

export default defineConfig(({ mode }) => {
  const site = parsePublicSiteUrl(loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL);
  const base = (site?.pathname.replace(/\/$/, '') ?? '') as '' | `/${string}`;
  return {
    plugins: [sveltekit({
      adapter: adapter(),
      paths: { base, relative: false },
      prerender: {
        entries: site ? ['*'] : ['/', '/robots.txt'],
        handleUnseenRoutes({ routes, message }) {
          // The sitemap has no public URLs until the publication address is configured.
          if (site || routes.some((route) => route !== '/sitemap.xml')) {
            throw new Error(message);
          }
        }
      }
    })]
  };
});
