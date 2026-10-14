import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Collection `blog` : les articles, en Markdown ou MDX.
 * Le frontmatter est validé par un schéma Zod (le build échoue si invalide).
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().max(120),
    description: z.string().min(20).max(220),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Koretada'),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    lang: z.string().default('fr'),
    series: z.string().optional(),
    canonicalURL: z.string().optional(),
    keywords: z.array(z.string()).default([]),
  }),
});

/**
 * Collection `pages` : pages statiques éditables (À propos, Mentions légales…).
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { blog, pages };
