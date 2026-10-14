// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// URL publique du site. Surchargeable via la variable d'environnement SITE_URL.
const site = process.env.SITE_URL ?? 'https://walidblog.example.com';

// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'ignore',
  integrations: [
    mdx(),
    sitemap({
      // On exclut la page 404 du sitemap
      filter: (page) => !page.includes('/404'),
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
