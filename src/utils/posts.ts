import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

/**
 * Récupère les articles publiés (brouillons exclus), triés du plus récent
 * au plus ancien.
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
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
