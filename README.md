# walidblog

Blog IT (**Cloud · DevOps · Infrastructure-as-Code · Observabilité**) construit en
**documentation as code** : les articles sont des fichiers Markdown/MDX versionnés dans Git,
générés en site statique par **Astro**, puis **conteneurisés** pour être servis par Nginx.

- **Framework** : [Astro](https://astro.build) (SSG, quasi zéro JS)
- **Contenu** : Markdown + MDX, Content Collections validées par Zod
- **Style** : Tailwind CSS v4 + plugin Typography
- **Recherche** : Pagefind (index statique, sans backend)
- **Conteneurisation** : Docker + Nginx (voir [`docker/`](./docker))
- **CI** : GitHub Actions (lint, types, build, Lighthouse, liens)

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
├── .github/workflows/     # CI (lint, types, build, Lighthouse, liens)
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
├── docker/                # application conteneurisée (Dockerfile, Nginx, Compose)
├── astro.config.mjs
├── .dockerignore
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

## Docker (application conteneurisée)

Le blog est livré sous forme d'**image Docker** : le site statique est construit dans une
première étape, puis servi par **Nginx**.

```bash
# Build + run avec Compose (recommandé)
docker compose -f docker/docker-compose.yml up --build
# → http://localhost:8080

# Ou manuellement (le contexte de build est la racine du dépôt)
docker build -f docker/Dockerfile -t walidblog .
docker run --rm -p 8080:8080 walidblog
```

| Étape | Image de base | Rôle |
| --- | --- | --- |
| Build | `node:22-bookworm-slim` | `npm ci` + `npm run build` (Astro + Pagefind) |
| Runtime | `nginx:1.27-alpine` | Sert `dist/` sur le port `8080` |

`docker/nginx.conf` fournit les **en-têtes de sécurité** (CSP, HSTS, `X-Frame-Options`…), la
compression gzip, le cache des assets fingerprintés et la page 404.

> Détails, justification du choix Debian (Pagefind exige glibc) et variantes :
> [`docker/README.md`](./docker/README.md).

### Publier l'image

L'image est autonome : poussez-la sur un registre (Docker Hub, GitHub Container Registry…)
puis exécutez-la où vous voulez (VPS, Kubernetes, PaaS). Le **TLS** est à terminer en amont
via un reverse proxy / un ingress.

---

## Licence

- **Code** : [MIT](./LICENSE)
- **Contenu des articles** : [CC BY-NC-SA 4.0](./CONTENT-LICENSE.md)
