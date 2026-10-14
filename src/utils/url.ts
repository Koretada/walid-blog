/**
 * Helpers d'URL.
 */

/** Base du site (définie par `site` dans astro.config.mjs), sans slash final. */
export function siteBase(): string {
  return (import.meta.env.SITE ?? '').replace(/\/+$/, '');
}

/** Construit une URL absolue à partir d'un chemin relatif au site. */
export function absoluteUrl(path: string): string {
  const base = siteBase();
  if (!base) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
