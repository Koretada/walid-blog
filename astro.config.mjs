// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// URL publique du site. Surchargeable via la variable d'environnement SITE_URL.
// ⚠️ Cette valeur alimente TOUTES les URL absolues du site : canonical, Open Graph,
// flux RSS, sitemap, robots.txt et données structurées JSON-LD.
const site = process.env.SITE_URL ?? 'https://blog.walidb.fr';

// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'ignore',
  integrations: [
    mdx(),
    sitemap({
      // On exclut la page 404 du sitemap, ainsi que le fichier de redirections
      // Nginx — c'est un artefact de build, pas une page (voir
      // src/pages/drafts.conf.ts).
      filter: (page) => !page.includes('/404') && !page.endsWith('/drafts.conf'),
    }),
  ],
  markdown: {
    shikiConfig: {
      // Thème clair / sombre double (basculés en CSS via html.dark)
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
  },
  prefetch: true,
  vite: {
    plugins: [tailwindcss()],
  },
});
