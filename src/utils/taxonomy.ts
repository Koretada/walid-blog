import { slugify } from './format';
import type { BlogPost } from './posts';

export type TaxonomyKey = 'tags' | 'categories';

export interface TermSummary {
  /** Libellé d'origine, ex. « Infrastructure as Code » */
  term: string;
  /** Version URL-safe, ex. « infrastructure-as-code » */
  slug: string;
  count: number;
}

/** Agrège les termes (tags ou catégories) avec leur nombre d'articles. */
export function summarizeTerms(posts: BlogPost[], key: TaxonomyKey): TermSummary[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const term of post.data[key]) {
      counts.set(term, (counts.get(term) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([term, count]) => ({ term, slug: slugify(term), count }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term, 'fr'));
}

/** Filtre les articles possédant un terme donné (identifié par son slug). */
export function postsByTerm(posts: BlogPost[], key: TaxonomyKey, slug: string): BlogPost[] {
  return posts.filter((post) => post.data[key].some((term) => slugify(term) === slug));
}
