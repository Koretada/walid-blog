import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';
import { renderOgSvg } from '../../../utils/og';
import { getPublishedPosts, type BlogPost } from '../../../utils/posts';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: BlogPost };
  const kicker = post.data.categories[0] ?? 'Blog';
  const svg = renderOgSvg(post.data.title, kicker);

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
