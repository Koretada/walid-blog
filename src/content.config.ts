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

/**
 * Collection `certifications` : les certifications professionnelles affichées
 * sur la page « À propos ». Un fichier par certification (frontmatter seul).
 *
 * Astuce : `issued` et `verifyUrl` sont optionnels afin qu'une certification
 * puisse être listée avant que sa date ou son badge public ne soient connus —
 * la carte omet simplement l'information manquante.
 */
const certifications = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/certifications' }),
  schema: z.object({
    /** Intitulé officiel complet de la certification */
    name: z.string().max(160),
    /** Organisme émetteur (AWS, CNCF, CompTIA…) */
    issuer: z.string().max(80),
    /** Code de l'examen, ex. SAA-C03, CKA, SY0-701 */
    code: z.string().max(40).optional(),
    /** Date d'obtention */
    issued: z.coerce.date().optional(),
    /** Date d'expiration (la plupart sont valables 3 ans) */
    expires: z.coerce.date().optional(),
    /** URL de vérification publique du badge (Credly, CertMetrics…) */
    verifyUrl: z.url().optional(),
    /** Identifiant de la certification, affiché à défaut d'URL de vérification */
    credentialId: z.string().max(80).optional(),
    /** Badge affiché, servi depuis public/ (SVG ou PNG carré recommandé) */
    logo: z.string().optional(),
    /** Texte alternatif du badge (décoratif si omis) */
    logoAlt: z.string().optional(),
    /** Couleur d'accent de la carte */
    accent: z.enum(['sky', 'amber', 'violet', 'emerald', 'red', 'neutral']).default('neutral'),
    /** Compétences validées, affichées en puces */
    skills: z.array(z.string()).default([]),
    /** Ordre d'affichage (croissant) ; à défaut, tri par date décroissante */
    order: z.number().default(99),
    /** Brouillon : visible en développement uniquement */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, pages, certifications };
