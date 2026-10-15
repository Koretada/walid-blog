import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

/**
 * En développement (`astro dev`), les brouillons sont visibles afin de pouvoir
 * les relire. En build de production, ils disparaissent complètement du site.
 */
const INCLUDE_DRAFTS = import.meta.env.DEV;

/** Tri du plus récent au plus ancien. */
function byDateDesc(a: BlogPost, b: BlogPost): number {
  return b.data.pubDate.getTime() - a.data.pubDate.getTime();
}

/**
 * Articles à afficher sur le site.
 *
 * - `npm run dev` → brouillons **inclus** (signalés par un badge « Brouillon »),
 *   pour relire un article avant de le publier.
 * - `npm run build` → brouillons **exclus**. Leurs pages ne sont pas générées :
 *   ils sont donc absents des listes, du flux RSS, du sitemap, des images Open
 *   Graph et de l'index de recherche Pagefind.
 */
export async function getVisiblePosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => INCLUDE_DRAFTS || !data.draft);
  return posts.sort(byDateDesc);
}

/**
 * Uniquement les brouillons, du plus récent au plus ancien.
 * Sert à signaler les articles en attente de publication en développement.
 */
export async function getDraftPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => data.draft);
  return posts.sort(byDateDesc);
}

/** Découpe une liste d'articles en pages de taille `size`. */
export function paginate<T>(items: T[], size: number, page: number): T[] {
  const start = (page - 1) * size;
  return items.slice(start, start + size);
}

/** Nombre total de pages pour une liste et une taille de page données. */
export function pageCount(total: number, size: number): number {
  return Math.max(1, Math.ceil(total / size));
}

/**
 * Articles adjacents dans l'ordre chronologique décroissant.
 * `newer` = article plus récent, `older` = article plus ancien.
 */
export function getAdjacentPosts(
  posts: BlogPost[],
  currentId: string
): { newer?: BlogPost; older?: BlogPost } {
  const index = posts.findIndex((post) => post.id === currentId);
  return {
    newer: index > 0 ? posts[index - 1] : undefined,
    older: index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}
