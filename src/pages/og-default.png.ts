import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { SITE } from '../consts';
import { renderOgSvg } from '../utils/og';

/**
 * Image Open Graph par défaut du site.
 * Rendue en PNG au build via sharp (l'image existe donc dès le déploiement).
 */
export const GET: APIRoute = async () => {
  const svg = renderOgSvg(SITE.description, SITE.title, SITE.tagline);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
