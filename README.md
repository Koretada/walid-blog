# walidblog

Blog IT (**Cloud · DevOps · Infrastructure-as-Code · Observabilité**) construit en
**documentation as code** : les articles sont des fichiers Markdown/MDX versionnés dans Git,
générés en site statique par **Astro**, et déployés automatiquement.

- **Framework** : [Astro](https://astro.build) (SSG, quasi zéro JS)
- **Contenu** : Markdown + MDX, Content Collections validées par Zod
- **Style** : Tailwind CSS v4 + plugin Typography
- **Recherche** : Pagefind (index statique, sans backend)
- **Hébergement** : site 100 % statique, déployé sur **Cloudflare Pages**
- **CI/CD** : GitHub Actions (lint, types, build, Lighthouse, liens, déploiement)

> Le cahier des charges complet est dans [`PRD.md`](./PRD.md).

---

## Démarrage rapide

Prérequis : **Node.js ≥ 22.12**.

```bash
npm install

npm run dev        # serveur de développement → http://localhost:4321
npm run build      # build de production + index de recherche Pagefind
npm run preview    # sert le build local
```

Qualité :

```bash
npm run lint       # vérification Prettier
npm run format     # formatage automatique
npm run check      # vérification des types (astro check)
```

---

## Écrire un article

1. Créez un fichier dans `src/content/blog/`, nommé en `kebab-case`
   (ex. `mon-super-article.mdx`). Le nom du fichier devient l'URL :
   `/blog/mon-super-article`.
2. Renseignez le frontmatter (validé au build) :

```yaml
---
title: 'Mon super article'
description: 'Résumé optimisé pour le SEO (20 à 220 caractères).'
pubDate: 2026-10-14
author: 'Koretada'
tags: ['terraform', 'aws']
categories: ['Cloud']
cover: '/images/mon-image.svg' # optionnel (dans public/)
coverAlt: 'Description de l’image' # requis si cover
draft: false
featured: false
lang: 'fr'
# series: 'Terraform en pratique'      # optionnel
# canonicalURL: 'https://...'           # optionnel (republish)
# keywords: ['terraform', 'iac']        # optionnel (SEO)
---
```

3. Prévisualisez avec `npm run dev`, puis ouvrez une **Pull Request**.

### Règles

- `draft: true` exclut l'article du build de production (mais pas du mode dev).
- Les images **dans le corps** d'un article sont optimisées par Astro lorsqu'elles sont
  référencées en chemin relatif.
- Les composants MDX (ex. `Callout`) s'importent en tête de fichier :

```mdx
import Callout from '../../components/Callout.astro';

<Callout type="warning" title="Attention">...</Callout>
```

---

## Structure du projet

```text
walidblog/
├── .github/workflows/     # CI, déploiement production, preview
├── public/                # assets statiques (favicon, images, robots)
├── src/
│   ├── components/        # Header, Footer, PostCard, BaseHead, Callout, TOC...
│   ├── content/
│   │   ├── blog/          # ARTICLES (.md / .mdx)
│   │   └── pages/         # pages statiques (about.md)
│   ├── layouts/           # BaseLayout, BlogPostLayout
│   ├── pages/             # routes (index, blog, tags, categories, rss, og...)
│   ├── styles/global.css  # Tailwind + styles Shiki
│   ├── utils/             # helpers (dates, posts, taxonomie, SEO, OG)
│   ├── consts.ts          # configuration éditoriale & SEO
│   └── content.config.ts  # schémas Zod des collections
├── astro.config.mjs
├── PRD.md                 # cahier des charges
└── README.md
```

---

## SEO & visibilité

Généré automatiquement au build :

- `sitemap-index.xml` (exclut la 404) et `robots.txt` ;
- flux **RSS** sur `/rss.xml` ;
- balises **Open Graph / Twitter Card** avec **image OG générée par article**
  (`/og/blog/<slug>.png`, rendue via `sharp`) ;
- **données structurées JSON-LD** (`WebSite`, `Person`, `BlogPosting`, `BreadcrumbList`) ;
- URL canoniques, `title`/`description` uniques, balise `lang`.

---

## Déploiement

Le build produit `dist/` : un site **100 % statique**. N'importe quel hébergeur de fichiers
statiques convient. La configuration fournie cible **Cloudflare Pages** (intégration Git,
previews par PR) — **aucun bucket, aucun rôle cloud, aucune infrastructure à gérer**.

| Environnement | Déclencheur | Cible |
| --- | --- | --- |
| Local | `npm run dev` | `http://localhost:4321` |
| Preview | Pull Request | Cloudflare Pages (`.github/workflows/preview.yml`) |
| Production | Merge sur `main` | Cloudflare Pages (`.github/workflows/deploy.yml`) |

### Secrets/variables GitHub à configurer

| Type | Nom | Description |
| --- | --- | --- |
| secret | `CLOUDFLARE_API_TOKEN` | Jeton API Cloudflare (permission *Cloudflare Pages: Edit*) |
| secret | `CLOUDFLARE_ACCOUNT_ID` | Identifiant du compte Cloudflare |
| variable | `CLOUDFLARE_PROJECT_NAME` | *(optionnel)* Nom du projet Pages — défaut : `walidblog` |

### Héberger ailleurs

Rien dans le code n'est lié à un fournisseur : `npm run build` génère un dossier `dist/`
autonome. Adaptez l'étape de déploiement de `deploy.yml` à votre hébergeur (Netlify,
GitHub Pages, hébergement mutualisé, serveur web…), ou déployez-le manuellement.

---

## Licence

- **Code** : [MIT](./LICENSE)
- **Contenu des articles** : [CC BY-NC-SA 4.0](./CONTENT-LICENSE.md)
