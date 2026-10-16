import { SITE } from '../consts';
import { toISO } from './format';
import type { BlogPost } from './posts';
import { absoluteUrl } from './url';

/**
 * Données structurées `Person` (auteur).
 *
 * Les certifications obtenues sont exposées via `hasCredential`, ce qui permet
 * aux moteurs de recherche de rattacher les badges au profil.
 */
export function personJsonLd(
  credentials: ReadonlyArray<{ name: string; issuer: string; url?: string }> = []
): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.author,
    url: absoluteUrl('/about'),
    // Construit depuis SITE.social : retirer un réseau le retire d'ici aussi.
    sameAs: Object.values(SITE.social),
  };

  if (credentials.length > 0) {
    jsonLd.hasCredential = credentials.map((credential) => ({
      '@type': 'EducationalOccupationalCredential',
      name: credential.name,
      credentialCategory: 'certification',
      recognizedBy: { '@type': 'Organization', name: credential.issuer },
      ...(credential.url ? { url: credential.url } : {}),
    }));
  }

  return jsonLd;
}

/** Données structurées `WebSite` (+ SearchAction). */
export function websiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.title,
    description: SITE.description,
    url: absoluteUrl('/'),
    inLanguage: SITE.lang,
    author: { '@type': 'Person', name: SITE.author },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/search')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Données structurées `BlogPosting` pour un article. */
export function articleJsonLd(post: BlogPost): Record<string, unknown> {
  const { title, description, pubDate, updatedDate, tags, cover, author, keywords, categories } =
    post.data;
  const url = absoluteUrl(`/blog/${post.id}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: toISO(pubDate),
    dateModified: toISO(updatedDate ?? pubDate),
    inLanguage: SITE.lang,
    author: { '@type': 'Person', name: author },
    publisher: { '@type': 'Person', name: SITE.author },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    image: absoluteUrl(cover ?? SITE.defaultOgImage),
    keywords: keywords.length > 0 ? keywords.join(', ') : tags.join(', '),
    articleSection: categories[0],
  };
}

/** Données structurées `BreadcrumbList`. */
export function breadcrumbJsonLd(
  items: ReadonlyArray<{ name: string; url: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}
