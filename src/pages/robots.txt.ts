import type { APIRoute } from 'astro';
import { absoluteUrl } from '../utils/url';

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /

# Le sitemap est généré par @astrojs/sitemap
Sitemap: ${absoluteUrl('/sitemap-index.xml')}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
