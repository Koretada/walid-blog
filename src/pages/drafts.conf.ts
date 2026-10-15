import type { APIRoute } from 'astro';
import { getDraftPosts } from '../utils/posts';

/**
 * Génère la configuration Nginx des redirections pour les articles en brouillon.
 *
 * Un article en brouillon n'est pas généré par le build : son URL historique
 * renverrait donc une 404, ce qui la ferait disparaître de l'index des moteurs
 * de recherche. Pour préserver ces URL, on émet un **vrai 301** vers la liste
 * des articles.
 *
 * Propriétés importantes :
 *  - la liste est dérivée de la collection : repasser un article en
 *    `draft: false` **supprime automatiquement** sa redirection, la page réelle
 *    étant alors générée ;
 *  - les correspondances sont exactes, donc une URL réellement inexistante sous
 *    `/blog/` continue de renvoyer une 404 (pas de « soft 404 » global).
 *
 * Le fichier produit (`dist/drafts.conf`) est copié dans l'image Nginx par
 * `docker/Dockerfile` et n'est pas servi publiquement (`docker/nginx.conf`).
 */
export const GET: APIRoute = async () => {
  const drafts = await getDraftPosts();

  const locations = drafts.flatMap((post) => [
    `location = /blog/${post.id} {`,
    `    return 301 /blog;`,
    `}`,
    `location = /blog/${post.id}/ {`,
    `    return 301 /blog;`,
    `}`,
  ]);

  const body = [
    '# Fichier généré par Astro — src/pages/drafts.conf.ts',
    '# Ne pas modifier à la main : régénéré à chaque build.',
    '',
    '# Redirections 301 : articles en brouillon → liste des articles.',
    ...(drafts.length > 0 ? locations : ['# Aucun article en brouillon.']),
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
