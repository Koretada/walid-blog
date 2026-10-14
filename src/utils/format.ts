/**
 * Helpers de formatage (dates, temps de lecture, slugs).
 */

/** Formate une date en français, ex. « 14 octobre 2026 ». */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Formate une date au format court, ex. « 14/10/2026 ». */
export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Date au format ISO 8601 (attribut `datetime`, JSON-LD). */
export function toISO(date: Date): string {
  return date.toISOString();
}

/**
 * Estime le temps de lecture (en minutes) à partir du corps de l'article.
 * Base : ~200 mots/minute.
 */
export function readingTimeMinutes(body = ''): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Transforme un libellé arbitraire en slug URL-safe (accents, espaces, casse). */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
