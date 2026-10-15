import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE } from '../consts';
import { getVisiblePosts } from '../utils/posts';

export const GET: APIRoute = async (context) => {
  if (!context.site) {
    throw new Error('`site` doit être défini dans astro.config.mjs pour générer le flux RSS.');
  }

  const posts = await getVisiblePosts();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}`,
      categories: [...post.data.categories, ...post.data.tags],
      author: post.data.author,
    })),
    customData: `<language>${SITE.lang}</language>`,
  });
};
