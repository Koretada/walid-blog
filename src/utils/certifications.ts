import { getCollection, type CollectionEntry } from 'astro:content';

export type Certification = CollectionEntry<'certifications'>;

/**
 * Comme pour les articles : en développement les brouillons restent visibles,
 * en build de production ils sont exclus du site.
 */
const INCLUDE_DRAFTS = import.meta.env.DEV;

/**
 * Certifications à afficher, triées par `order` croissant, puis — à ordre égal —
 * de la plus récente à la plus ancienne.
 */
export async function getVisibleCertifications(): Promise<Certification[]> {
  const items = await getCollection('certifications', ({ data }) => INCLUDE_DRAFTS || !data.draft);

  return items.sort((a, b) => {
    if (a.data.order !== b.data.order) {
      return a.data.order - b.data.order;
    }
    return (b.data.issued?.getTime() ?? 0) - (a.data.issued?.getTime() ?? 0);
  });
}
