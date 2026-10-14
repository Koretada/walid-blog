import { SITE } from '../consts';
import { toISO } from './format';
import type { BlogPost } from './posts';
import { absoluteUrl } from './url';

/** Données structurées `Person` (auteur). */
export function personJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.author,
    url: absoluteUrl('/about'),
    sameAs: [SITE.social.github, SITE.social.linkedin, SITE.social.x],
  };
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
