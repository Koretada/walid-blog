# walidblog

Blog IT (**Cloud · DevOps · Infrastructure-as-Code · Observabilité**) construit en
**documentation as code** : les articles sont des fichiers Markdown/MDX versionnés dans Git,
générés en site statique par **Astro**, et déployés automatiquement.

- **Framework** : [Astro](https://astro.build) (SSG, quasi zéro JS)
- **Contenu** : Markdown + MDX, Content Collections validées par Zod
- **Style** : Tailwind CSS v4 + plugin Typography
- **Recherche** : Pagefind (index statique, sans backend)
- **Hébergement** : AWS S3 + CloudFront (voir [`terraform/`](./terraform))
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
├── terraform/             # infrastructure AWS (S3, CloudFront, ACM, Route53, IAM)
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

| Environnement | Déclencheur | Cible |
| --- | --- | --- |
| Local | `npm run dev` | `http://localhost:4321` |
| Preview | Pull Request | Cloudflare Pages (optionnel, cf. `preview.yml`) |
| Production | Merge sur `main` | AWS S3 + CloudFront (OIDC) |

### Secrets/variables GitHub à configurer

| Type | Nom | Description |
| --- | --- | --- |
| secret | `AWS_ROLE_ARN` | ARN du rôle IAM (`terraform output deploy_role_arn`) |
| variable | `AWS_REGION` | Région AWS (ex. `eu-west-3`) |
| variable | `AWS_BUCKET` | Bucket S3 cible (`terraform output bucket_name`) |
| variable | `CLOUDFRONT_DISTRIBUTION_ID` | ID de distribution (`terraform output cloudfront_distribution_id`) |
| secret | `CLOUDFLARE_API_TOKEN` | *(optionnel)* pour les previews |
| secret | `CLOUDFLARE_ACCOUNT_ID` | *(optionnel)* pour les previews |

L'authentification AWS se fait par **OIDC** : aucune clé d'accès n'est stockée.

---

## Licence

- **Code** : [MIT](./LICENSE)
- **Contenu des articles** : [CC BY-NC-SA 4.0](./CONTENT-LICENSE.md)
