/**
 * Constantes globales du site (source unique de vérité).
 * Toute la configuration éditoriale et SEO est centralisée ici.
 */

export const SITE = {
  /** Nom affiché du site */
  title: 'walidblog',
  /** Tagline courte (header, hero) */
  tagline: 'Cloud · DevOps · Infrastructure-as-Code',
  /** Description par défaut (SEO / Open Graph) */
  description:
    "Blog IT sur le Cloud, le DevOps, l'Infrastructure-as-Code et l'observabilité. Des articles concrets, écrits et publiés comme du code (documentation as code).",
  /** Auteur / propriétaire */
  author: 'Koretada',
  /** Langue principale */
  lang: 'fr',
  /** Locale Open Graph */
  locale: 'fr_FR',
  /** Image Open Graph par défaut (dans public/) */
  defaultOgImage: '/og-default.png',
  /** Comptes sociaux (utilisés dans le footer et le JSON-LD) */
  social: {
    github: 'https://github.com/koretada',
    linkedin: 'https://www.linkedin.com/in/koretada',
    x: 'https://x.com/koretada',
  },
} as const;

/** Navigation principale */
export const NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/blog', label: 'Blog' },
  { href: '/tags', label: 'Tags' },
  { href: '/categories', label: 'Catégories' },
  { href: '/search', label: 'Recherche' },
  { href: '/about', label: 'À propos' },
];

/** Nombre d'articles par page dans les listes paginées */
export const POSTS_PER_PAGE = 3;

/** Répertoire des images "cover" servies depuis public/ */
export const COVER_DIR = '/images';
