import { SITE } from '../consts';

/** Échappe les caractères réservés XML pour une injection sûre dans le SVG. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Coupe un texte en lignes d'au plus `maxChars` caractères, sur `maxLines` lignes. */
export function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxChars) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  return lines.slice(0, maxLines);
}

/**
 * Construit le SVG d'une image Open Graph (1200x630), rendue ensuite en PNG
 * via sharp. Les polices DejaVu sont disponibles sur la plupart des systèmes
 * Linux (paquet `fonts-dejavu-core`).
 */
export function renderOgSvg(
  title: string,
  kicker: string,
  footer: string = `${SITE.title} — ${SITE.tagline}`
): string {
  const lines = wrapText(title, 28, 4);
  const fontSize = lines.length > 2 ? 62 : 76;
  const lineHeight = fontSize * 1.16;
  const startY = 300;

  const tspans = lines
    .map(
      (line, index) => `<tspan x="80" y="${startY + index * lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join('');

  const fontFamily = 'DejaVu Sans, Arial, Helvetica, sans-serif';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#020617"/>
      <stop offset="1" stop-color="#0369a1"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="80" y="150" font-family="${fontFamily}" font-size="30" fill="#7dd3fc" letter-spacing="3">${escapeXml(
    kicker.toUpperCase()
  )}</text>
  <text font-family="${fontFamily}" font-size="${fontSize}" font-weight="bold" fill="#f8fafc">${tspans}</text>
  <text x="80" y="566" font-family="${fontFamily}" font-size="32" fill="#cbd5e1">${escapeXml(
    footer
  )}</text>
</svg>`;
}
