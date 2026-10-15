# PRD — Blog IT « walidblog » (Astro / Docs-as-Code)

| Champ | Valeur |
|---|---|
| **Nom du produit** | walidblog |
| **Type** | Blog technique statique (IT / Cloud / DevOps) |
| **Stack cible** | Astro (SSG) + Markdown/MDX + Git |
| **Version du document** | 1.0 |
| **Statut** | Draft — à valider |
| **Auteur** | Koretada |
| **Date de création** | 2026-10-14 |
| **Dernière mise à jour** | 2026-10-14 |

---

## 1. Résumé exécutif

`walidblog` est un blog technique dont le contenu est **écrit, versionné et publié comme du code** (*documentation as code*). Les articles sont des fichiers **Markdown / MDX** stockés dans un dépôt Git, transformés en site statique par **Astro**, puis déployés automatiquement via un pipeline **CI/CD**.

L'objectif business est double :

1. **Gagner en visibilité** (SEO technique, partage sur réseaux/communautés) en publiant des articles IT de qualité sur le Cloud, l'Infrastructure-as-Code, le DevOps et l'observabilité.
2. **Industrialiser la publication** avec les mêmes pratiques qu'un projet logiciel : revue par Pull Request, *preview deployments*, versioning, lint, tests et déploiement continu.

Le choix d'Astro garantit des performances élevées (site statique, quasi zéro JS par défaut), un excellent score Core Web Vitals, et une indépendance totale vis-à-vis d'une base de données ou d'une plateforme fermée : **Git est la source de vérité**.

---

## 2. Contexte & Problème

### 2.1 Contexte

- L'auteur publie (ou souhaite publier) du contenu technique pour asseoir son expertise et sa visibilité (portfolio, réseau pro, communautés Cloud/DevOps).
- Les plateformes de blogging classiques (WordPress, Medium, Dev.to) éloignent le contenu du workflow de développement : le contenu vit dans une base de données, pas dans Git, ce qui casse la logique *docs-as-code*.
- Le profil de l'auteur est orienté **DevOps / Cloud / IaC** : le blog doit refléter ces compétences jusque dans son mode de fabrication.

### 2.2 Problème à résoudre

> Comment publier régulièrement des articles IT avec une **expérience de développement moderne** (Git, PR, CI/CD, Markdown), tout en maximisant la **découvrabilité** (SEO, partage, performance) et en **minimisant les coûts** d'hébergement et de maintenance ?

### 2.3 Justification du choix Astro

| Critère | Astro | WordPress (thème Astra) | CMS SaaS (Medium/Dev.to) |
|---|---|---|---|
| Contenu dans Git | ✅ Natif | ❌ Base MySQL | ❌ Plateforme fermée |
| Performance (Lighthouse) | ✅ Excellent | ⚠️ Variable | ⚠️ Dépend du tiers |
| Coût d'hébergement | ✅ ~0 € (statique) | ⚠️ Serveur + DB | ✅ Gratuit (mais pas de contrôle) |
| Workflow PR / review | ✅ Natif | ❌ | ❌ |
| Propriété / portabilité | ✅ Totale | ⚠️ Moyenne | ❌ Faible |
| SEO technique maîtrisé | ✅ Total contrôle | ⚠️ Plugins | ❌ Limité |

---

## 3. Objectifs & Non-objectifs

### 3.1 Objectifs (Goals)

- [ ] **G1** — Publier des articles IT en Markdown/MDX, versionnés dans Git, sans jamais toucher à une base de données.
- [ ] **G2** — Déployer automatiquement chaque article fusionné sur `main` (CD).
- [ ] **G3** — Offrir un *preview deployment* par Pull Request pour relire un article en conditions réelles.
- [ ] **G4** — Atteindre d'excellents scores techniques (Lighthouse ≥ 95 sur Perf/SEO/Best Practices/A11y).
- [ ] **G5** — Rendre le site **découvrable** : sitemap, RSS, Open Graph, données structurées (JSON-LD), indexation rapide.
- [ ] **G6** — Héberger le site à coût quasi nul sur un hébergeur statique, sans infrastructure à administrer (ni serveur, ni bucket, ni base de données).
- [ ] **G7** — Assurer une expérience de lecture technique de qualité : coloration syntaxique, blocs de code copiables, diagrammes, images optimisées.

### 3.2 Non-objectifs (Non-goals) — hors périmètre V1

- ❌ CMS avec base de données (WordPress, Strapi…).
- ❌ Espace commentaires **auto-hébergé** (V1 : pas de commentaires, ou giscus en P2).
- ❌ Application web dynamique / espace membre / authentification.
- ❌ Monétisation (pub, paywall, newsletter payante).
- ❌ Multi-auteurs avec rôles/permissions avancés (V1 : mono-auteur, contribution via PR).
- ❌ Application mobile native.

---

## 4. Personas & Cas d'usage

### 4.1 Personas

| Persona | Description | Besoin principal |
|---|---|---|
| **Auteur / Dev (principal)** | Ingénieur Cloud/DevOps, à l'aise avec Git et le terminal | Écrire en Markdown, pousser sur Git, publier via CI/CD |
| **Relecteur / Pair** | Collègue ou membre de la communauté | Relire un article via PR + preview déployée |
| **Lecteur technique** | Dev, DevOps, SRE, étudiant | Trouver un contenu fiable, rapide à lire, bien formaté, indexé sur Google |
| **Recruteur / Curieux** | Découvre le profil via le blog | Évaluer l'expertise via la qualité et la régularité du contenu |

### 4.2 Cas d'usage clés

- **UC1** — Rédiger un nouvel article en local, le prévisualiser, l'ouvrir en PR, le voir publié après merge.
- **UC2** — Rechercher un article par mot-clé / tag / catégorie.
- **UC3** — S'abonner au flux RSS et partager un article sur les réseaux sociaux (aperçu riche OG).
- **UC4** — Consulter un article sur mobile, en lecture rapide, avec blocs de code lisibles.
- **UC5** — Retrouver les articles par série (ex. « Terraform en pratique »).

---

## 5. Périmètre fonctionnel

Priorisation : **P0** = indispensable V1 · **P1** = important · **P2** = nice-to-have.

### 5.1 Epics & User Stories

#### EPIC 1 — Rédaction & rendu de contenu (P0)

- **US1.1** — *En tant qu'auteur*, je veux écrire mes articles en **Markdown/MDX** pour rester dans un flux de développement naturel.
  - Critères d'acceptation : support MD + MDX ; frontmatter typé et validé ; pas d'admin web requis.
- **US1.2** — *En tant que lecteur*, je veux des **blocs de code colorés** (Shiki) avec numéros de ligne et bouton *copier*.
- **US1.3** — *En tant que lecteur*, je veux voir des **callouts** (note / info / warning / danger) dans les articles.
- **US1.4** — *En tant que lecteur*, je veux des **images optimisées** (formats modernes, `srcset`, lazy-loading) et des **diagrammes** (Mermaid ou images).

#### EPIC 2 — Navigation & découverte (P0)

- **US2.1** — *En tant que lecteur*, je veux une **page d'accueil** listant les derniers articles (titre, date, résumé, tags, image).
- **US2.2** — *En tant que lecteur*, je veux **naviguer par tag** (`/tags/terraform`) et **par catégorie** (`/categories/cloud`).
- **US2.3** — *En tant que lecteur*, je veux **pagination** sur la liste d'articles.
- **US2.4** — *En tant que lecteur*, je veux une **page article** avec table des matières (TOC), temps de lecture et article précédent/suivant.
- **US2.5** — *En tant que lecteur*, je veux une **page « À propos »** et un **CV / profil** liant mes autres projets.

#### EPIC 3 — Recherche (P1)

- **US3.1** — *En tant que lecteur*, je veux **rechercher** un article par mot-clé (recherche statique type **Pagefind**, sans backend).

#### EPIC 4 — SEO & diffusion (P0)

- **US4.1** — Sitemap XML + `robots.txt` générés automatiquement.
- **US4.2** — Flux **RSS/Atom** complet.
- **US4.3** — Balises **Open Graph / Twitter Card** + **image OG** générée par article.
- **US4.4** — **Données structurées JSON-LD** (`Article`, `BlogPosting`, `BreadcrumbList`, `Person`).
- **US4.5** — URL canoniques, `<title>`/meta description uniques, `lang` correct.

#### EPIC 5 — Industrialisation (Docs-as-Code) (P0)

- **US5.1** — *En tant que dev*, je veux un **pipeline CI** qui valide (lint, build, liens cassés) à chaque PR.
- **US5.2** — *En tant que dev*, je veux un **preview deployment** par PR.
- **US5.3** — *En tant que dev*, je veux un **déploiement automatique en production** au merge sur `main`.
- **US5.4** — *En tant qu'auteur*, je veux **prévisualiser en local** (`npm run dev`).

#### EPIC 6 — Engagement (P2)

- **US6.1** — Commentaires via **giscus** (GitHub Discussions).
- **US6.2** — Bouton de partage social + newsletter (RSS-first en V1).
- **US6.3** — Mode sombre / clair avec persistance.

### 5.2 Backlog hors périmètre V1

Internationalisation complète FR/EN (préparée mais non traduite), génération d'images OG dynamiques par IA, A/B testing, programme d'affiliation.

---

## 6. Modèle de contenu (Content Model)

### 6.1 Collections Astro

| Collection | Dossier source | Usage |
|---|---|---|
| `blog` | `src/content/blog/**/*.{md,mdx}` | Articles de blog |
| `pages` (option) | `src/content/pages/**/*.md` | Pages statiques (À propos, etc.) |

### 6.2 Schéma de frontmatter (Zod)

```yaml
---
title: "Déployer un cluster K3s sur AWS avec Terraform"   # requis
description: "Guide pas à pas pour provisionner un cluster K3s single-node sur AWS."  # requis (SEO)
pubDate: 2026-10-14                                       # requis
updatedDate: 2026-10-20                                   # optionnel
author: "Koretada"                                        # requis
tags: ["kubernetes", "terraform", "aws"]                 # requis (1..n)
categories: ["Cloud"]                                     # requis
cover: "../../assets/k3s-cover.png"                       # optionnel (image OG fallback)
coverAlt: "Schéma d'un cluster K3s sur AWS"               # requis si cover
draft: true                                               # défaut: false
featured: false                                           # défaut: false
lang: "fr"                                                # défaut: fr
series: "Terraform en pratique"                           # optionnel
canonicalURL: "https://..."                               # optionnel (republish)
keywords: ["k3s", "terraform", "self-hosting"]            # optionnel (SEO)
readingTime: auto                                         # calculé automatiquement
---
```

### 6.3 Règles de contenu

- Un article = **un fichier**, nommé `kebab-case` (ex. `deployer-k3s-aws-terraform.mdx`).
- **Slug** = nom du fichier (URL propre : `/blog/deployer-k3s-aws-terraform`).
- Les brouillons (`draft: true`) sont **exclus du build de production** : leur page n'est pas générée, donc ils sont absents des listes, du RSS, du sitemap et de l'index Pagefind. En **développement** (`npm run dev`), ils restent visibles avec un badge « Brouillon » et un rappel listant les brouillons en attente, afin de pouvoir les relire avant publication.
- Les médias vivent dans `src/assets/` (optimisés par Astro) ou `public/` (statiques).
- Chaque article doit définir `description`, `tags`, et une `cover` (sinon image OG par défaut).

---

## 7. Architecture technique

### 7.1 Stack

| Couche | Technologie | Justification |
|---|---|---|
| Framework | **Astro** (dernière version stable) | SSG, zéro JS par défaut, Content Collections typées |
| Contenu | **Markdown + MDX** | Docs-as-code, composants réutilisables dans les articles |
| Validation | **Zod** (schémas Content Collections) | Frontmatter typé, erreurs de build si invalide |
| Styling | **Tailwind CSS** | Rapidité, cohérence, purge CSS |
| Coloration code | **Shiki** (intégré Astro) | Thèmes clair/sombre, haute fidélité |
| Diagrammes | **Mermaid** (remark-mermaidjs) ou images | Schémas d'archi dans les articles |
| Recherche | **Pagefind** | Index statique généré au build, sans backend |
| RSS | **@astrojs/rss** | Flux natif |
| Sitemap | **@astrojs/sitemap** | Génération automatique |
| Image OG | **astro-og-canvas** ou **satori** | Aperçus riches pour le partage social |
| Runtime Node | **Node LTS** (≥ 20) | Compatibilité Astro |
| Gestionnaire de paquets | **npm** (ou pnpm) | Standard, lockfile versionné |

### 7.2 Structure du dépôt

```text
walidblog/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # lint + build + link-check sur PR
│       └── deploy.yml             # build + deploy sur merge main
├── public/                        # fichiers statiques (favicon, robots, fonts)
├── src/
│   ├── assets/                    # images optimisées par Astro
│   ├── components/                # Header, Footer, Card, TOC, Callout, SEO...
│   ├── content/
│   │   ├── blog/                  # ARTICLES (.md / .mdx)
│   │   └── pages/                 # pages statiques
│   ├── layouts/                   # BaseLayout, BlogPostLayout
│   ├── pages/
│   │   ├── index.astro
│   │   ├── blog/
│   │   │   ├── index.astro        # liste + pagination
│   │   │   └── [...slug].astro    # page article
│   │   ├── tags/[tag].astro
│   │   ├── categories/[category].astro
│   │   ├── about.astro
│   │   ├── rss.xml.ts
│   │   └── 404.astro
│   ├── styles/global.css
│   ├── utils/                     # helpers (dates, reading time, slug)
│   └── content.config.ts          # schémas Zod des collections
├── docker/                        # application conteneurisée (Dockerfile, Nginx, Compose)
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── .editorconfig
├── .gitignore
├── README.md
└── PRD.md
```

### 7.3 Pipeline CI (Docs-as-Code)

```text
 Auteur
   │  git commit / git push (branche feat/article-xxx)
   ▼
 Pull Request ──► [CI] ci.yml
                  ├─ npm ci
                  ├─ npm run lint        (Prettier)
                  ├─ npm run check       (astro check : types + diagnostics)
                  ├─ npm run build       (valide frontmatter + rendu + index Pagefind)
                  ├─ link-check (liens des articles)
                  └─ Lighthouse CI (seuils, informatif)
```

- **Branches** : `main` · `feat/*`, `fix/*`, `content/*` (travail).
- **Commits** : convention `feat:`, `fix:`, `add:`, `docs:` (alignée sur les autres repos).
- **Aucun secret** requis : la CI **valide** seulement, elle ne publie rien.
- **Link-check** : lychee vérifie les liens des documents en prose (`README.md`, `docker/README.md`) **et** des articles. Attention, lychee **ignore par défaut les liens dans les blocs de code** : les URL d'exemple des tutoriels (placeholders, `localhost`, `*.test`) ne sont pas vérifiées. Un scan sans lien n'est donc pas une erreur (`failIfEmpty: false`), et les adresses locales/réservées sont exclues via `.lycheeignore`.

### 7.4 Livraison : application conteneurisée (Docker)

Le site est construit puis **empaqueté dans une image Docker** servie par Nginx. Il n'y a
**aucun serveur applicatif, aucune base de données, aucun bucket cloud**.

```text
Dépôt Git
   │
   └── docker build (multi-étapes)
          ├─ étape 1 (node:22-bookworm-slim) : npm ci && npm run build → dist/
          └─ étape 2 (nginx:1.27-alpine)     : dist/ → /usr/share/nginx/html
                 │
                 └── Image « walidblog » (port 8080) → VPS, Kubernetes, PaaS…
```

- **Portable** : l'image embarque tout (site + serveur) ; aucune dépendance à une plateforme d'hébergement.
- **Légère** : l'étape finale ne contient ni Node.js ni dépendances applicatives, seulement Nginx et des fichiers statiques.
- **En-têtes de sécurité** appliqués par `docker/nginx.conf` (CSP, HSTS, `X-Frame-Options`…).
- **TLS** : terminé en amont par un reverse proxy / un ingress.

> Choix assumé : **pas de S3 privé, pas d'OAC, pas de Terraform, pas de déploiement
> automatisé**. La livraison passe par **une image Docker** publiée sur un registre ; la mise
> à jour de l'hôte reste une opération explicite (`docker compose pull`).

#### 7.4.1 Publication de l'image

- **Registre** : GitHub Container Registry (`ghcr.io/<owner>/<repo>`).
- **Déclencheur** : merge sur `main` (tags `latest` + `sha-<court>`) et tags Git `v*` (release lisible).
- **Immuabilité** : le contenu est cuit dans l'image — un article publié = une image. Le rollback s'obtient en épinglant un tag `sha-<court>` antérieur.
- **Cache de build** (`type=gha`) : la couche `npm ci` n'est pas rejouée à chaque publication.
- **Validation continue** : la CI construit et **teste l'image** (smoke test HTTP sur `:8080`) avant tout merge.

#### 7.4.2 Déploiement sur Kubernetes (ArgoCD / GitOps)

Le blog peut être déployé sur un cluster Kubernetes via **ArgoCD**, en GitOps : Git reste la
source de vérité, ArgoCD réconcilie le cluster en continu.

```text
merge sur main
   └── publish.yml
         ├─ build + push de l'image        → ghcr.io/<owner>/<repo>:sha-<court>
         └─ commit du tag dans l'overlay   → k8s/overlays/prod/kustomization.yaml
                    │
                    └──► ArgoCD (selfHeal + prune) ──► Deployment · Service · Gateway · HTTPRoute
```

- **Manifests** : `k8s/base/` (Deployment, Service, Gateway, HTTPRoute) + `k8s/overlays/prod/` (Kustomize).
- **Routage** : API Gateway (Gateway + HTTPRoute) servie par la `GatewayClass` de **Traefik** ; le TLS est référencé sur le listener `https` (`certificateRefs`), et la redirection HTTP→HTTPS est un filtre natif `RequestRedirect`.
- **Point d'entrée** : une `Application` ArgoCD (`k8s/argocd/application.yaml`) bootstrapée une fois, puis pilotée par Git.
- **Tag d'image immuable** (`sha-<court>`) : le rollback se fait par `git revert` du commit de bump, ou via l'historique ArgoCD.
- **Anti-boucle** : le commit de bump porte `[skip ci]`, ce qui évite de relancer la CI qui l'a produit.
- **Disponibilité** : 2 replicas et `maxUnavailable: 0` → aucune coupure pendant un rolling update.

### 7.5 Environnements

| Environnement | Déclencheur | URL |
|---|---|---|
| **Local (dev)** | `npm run dev` | `http://localhost:4321` |
| **Local (build)** | `npm run preview` | `http://localhost:4321` |
| **Conteneur** | `docker compose -f docker/docker-compose.yml up` | `http://localhost:8080` |

---

## 8. Exigences SEO & Visibilité

> C'est le cœur de l'objectif business : **gagner en visibilité**.

- **Technique**
  - [ ] Sitemap XML auto (`@astrojs/sitemap`) + `robots.txt` autorisant le crawl.
  - [ ] HTML **statique pré-rendu** (rapidité d'indexation).
  - [ ] URLs propres et stables, hiérarchie claire, fil d'Ariane.
  - [ ] Balise `lang` correcte (`fr`), `hreflang` si i18n.
  - [ ] Pas de contenu dupliqué : `canonical` sur chaque page.
- **On-page**
  - [ ] `<title>` unique (< 60 car.) et `meta description` (< 155 car.) par article.
  - [ ] Structure sémantique `h1`→`h2`→`h3` sans saut de niveau.
  - [ ] **Données structurées JSON-LD** : `BlogPosting`/`Article`, `BreadcrumbList`, `Person`, `WebSite` (SearchAction).
  - [ ] Texte alternatif sur toutes les images.
- **Diffusion / social**
  - [ ] **Open Graph** + **Twitter Card** avec **image OG dédiée** par article.
  - [ ] Flux **RSS** + bouton de partage.
- **Performance (facteur de ranking)**
  - [ ] Voir section 9 (Core Web Vitals).
- **Suivi**
  - [ ] Soumission du sitemap à **Google Search Console** et **Bing Webmaster Tools**.
  - [ ] Analytics respectueux de la vie privée (voir section 11).

---

## 9. Exigences non-fonctionnelles

### 9.1 Performance (Core Web Vitals)

| Métrique | Cible | Seuil |
|---|---|---|
| Lighthouse Performance (mobile) | ≥ 95 | bloquant < 90 |
| LCP (Largest Contentful Paint) | < 2,0 s | < 2,5 s |
| CLS (Cumulative Layout Shift) | < 0,05 | < 0,1 |
| INP (Interaction to Next Paint) | < 150 ms | < 200 ms |
| Poids JS initial | < 50 Ko | < 100 Ko |
| Taille page article (HTML+CSS+img) | < 500 Ko | < 1 Mo |

- Zéro JS inutile (Astro *islands* uniquement pour l'interactif : recherche, dark mode).
- Images en **WebP/AVIF**, `srcset` responsive, `loading="lazy"`, dimensions explicites.

### 9.2 Accessibilité

- [ ] Cible **WCAG 2.1 niveau AA**.
- [ ] Contraste ≥ 4.5:1, navigation clavier complète, `focus` visible.
- [ ] `alt` sur images, `aria-label` sur éléments interactifs, structure sémantique.
- [ ] Lighthouse Accessibility ≥ 95.

### 9.3 Compatibilité

- [ ] Navigateurs modernes (dernières 2 versions Chrome/Firefox/Safari/Edge).
- [ ] Responsive : mobile-first, breakpoints 360 / 768 / 1024 / 1440 px.
- [ ] Rendu correct en mode sombre et clair.

### 9.4 Maintenabilité

- [ ] Code TypeScript, ESLint + Prettier, `.editorconfig`.
- [ ] Dépendances à jour (Dependabot/Renovate en P1).
- [ ] Contenu découplé du code (ajouter un article = ajouter un fichier).

### 9.5 Coût

- [ ] Coût d'exécution cible : **≈ 0 €/mois** en local/conteneur ; ~5 €/mois sur un petit VPS.
- [ ] Aucune base de données, aucun serveur applicatif permanent, aucun bucket à administrer.

---

## 10. Sécurité & Conformité

- [ ] HTTPS obligatoire (terminé en amont par un reverse proxy / un ingress).
- [ ] En-têtes de sécurité appliqués par Nginx (`docker/nginx.conf`) : `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`.
- [ ] **Aucun secret** dans le dépôt ; la CI ne publie rien (elle ne fait que valider).
- [ ] Aucune infrastructure à administrer (ni serveur applicatif, ni bucket, ni base de données).
- [ ] RGPD : pas de cookie de tracking tiers par défaut ; bannière inutile si analytics sans cookies (Plausible/Umami) — à confirmer selon l'outil retenu.
- [ ] `LICENSE` (contenu : à définir, ex. CC BY-NC-SA ; code : MIT).

---

## 11. Analytics & Observabilité

- [ ] **Analytics sans cookies** (Plausible, Umami self-hosted ou Cloudflare Web Analytics) — respect de la vie privée, léger.
- [ ] Suivi des pages vues, sources de trafic, articles les plus lus, taux de rebond.
- [ ] **Google Search Console** : impressions, clics, position moyenne, requêtes.
- [ ] (P2) Uptime monitoring externe (UptimeRobot/Better Stack) sur la prod.
- [ ] **Search Console** alimente la boucle d'amélioration SEO (mots-clés à fort potentiel).

---

## 12. Workflow éditorial (Docs-as-Code)

```text
1. Idée          → issue GitHub (template "article")
2. Rédaction     → branche content/<slug>, article en .mdx (draft: true)
3. Prévisualiser → npm run dev  (local)
4. PR            → CI (lint + build + link-check + Lighthouse) + preview deploy
5. Relecture     → relecture pair/auto via preview
6. Publish       → merge main (retrait de draft) → déploiement auto
7. Diffusion     → partage (LinkedIn/X/communautés) + RSS
8. Amélioration  → Search Console → mise à jour (updatedDate)
```

- **Convention de nommage** : branche `content/<slug-kebab-case>`, slug identique au nom de fichier.
- **Checklist PR article** : description SEO, tags, cover + alt, liens testés, build OK, relecture orthographique.

---

## 13. Roadmap & Jalons

| Jalon | Contenu | Objectif |
|---|---|---|
| **M0 — Bootstrap** | `git init`, Astro + Tailwind, structure dépôt, Content Collections, article « Hello World » | Base qui build en local |
| **M1 — Cœur éditorial** | Layout article, TOC, Shiki, callouts, tags/catégories, pagination, À propos | Blog navigable |
| **M2 — SEO & diffusion** | Sitemap, RSS, OG images, JSON-LD, robots.txt, 404 | Découvrable |
| **M3 — Conteneurisation** | Dockerfile multi-étapes (build + Nginx), `docker-compose.yml`, en-têtes de sécurité | Application livrable |
| **M4 — Industrialisation** | CI renforcée (check, Lighthouse CI, link-check), Dependabot | Qualité continue |
| **M5 — Polish (P1/P2)** | Recherche Pagefind, dark mode, giscus, analytics | Engagement |

**Definition of Ready (article)** : sujet + plan + mot-clé cible définis, image de couverture disponible.

---

## 14. KPIs & Métriques de succès

| Indicateur | Cible à 3 mois | Cible à 6 mois |
|---|---|---|
| Articles publiés | ≥ 8 | ≥ 20 |
| Sessions organiques / mois | ≥ 300 | ≥ 1 500 |
| Pages indexées (GSC) | ≥ 90 % des articles | 100 % |
| Score Lighthouse (Perf/SEO/A11y/BP) | ≥ 95 | ≥ 95 |
| Lead time « idée → prod » | < 1 jour | < 1 jour |
| Coût mensuel infra | ≤ 2 € | ≤ 2 € |
| Articles avec image OG + JSON-LD | 100 % | 100 % |

**Signaux d'échec** : aucun article indexé à J+30, Lighthouse < 90, pipeline CI instable (> 10 % d'échecs), coût infra > 5 €/mois.

---

## 15. Risques & Mitigations

| Risque | Prob. | Impact | Mitigation |
|---|---|---|---|
| Manque de régularité de publication | Moyenne | Élevé | Backlog d'articles, templates, cadence 1 article/semaine |
| SEO lent à décoller | Élevée | Moyen | Recherche de mots-clés, maillage interne, partage communautés, régularité |
| Configuration TLS / reverse proxy | Moyenne | Moyen | Reverse proxy ou ingress en amont ; certificats automatiques |
| Dérive des dépendances | Moyenne | Faible | Dependabot + build CI |
| Image de base vulnérable | Faible | Moyen | Images officielles épinglées, rebuild régulier, scan d'image |
| Articles trop techniques, peu accessibles | Moyenne | Moyen | Intro vulgarisée, TL;DR, schémas, exemples concrets |
| Coût d'exécution imprévu (pic de trafic) | Faible | Faible | Serveur statique léger (Nginx), cache des assets |

---

## 16. Definition of Done (V1)

- [ ] Dépôt Git initialisé, structure conforme (§7.2), `.gitignore` + `README.md`.
- [ ] Site Astro qui build sans erreur (`npm run build`).
- [ ] Content Collections avec schéma Zod validant le frontmatter.
- [ ] Au moins 3 articles réels publiés (non-brouillons).
- [ ] Pages : accueil, liste/pagination, article, tags, catégories, à propos, 404.
- [ ] SEO : sitemap, RSS, OG/Twitter, JSON-LD, canonical, robots.txt.
- [ ] Coloration syntaxique (Shiki) + TOC + callouts + images optimisées.
- [ ] Pipeline CI (lint + check + build + link-check + Lighthouse) sur PR.
- [ ] Application conteneurisée : `docker build` reproductible, site servi par Nginx sur le port 8080.
- [ ] En-têtes de sécurité servis par Nginx ; TLS terminé en amont.
- [ ] Lighthouse ≥ 95 (Perf, SEO, A11y, Best Practices) sur mobile.
- [ ] Analytics + Search Console opérationnels.
- [ ] Ce PRD à jour et versionné dans le dépôt.

---

## 17. Annexes

### 17.1 Commandes de référence

```bash
# Création du projet
npm create astro@latest .
npx astro add mdx tailwind sitemap rss

# Développement / build / preview
npm run dev        # http://localhost:4321
npm run build      # génère ./dist
npm run preview    # sert le build local

# Qualité
npm run lint
npm run format
```

### 17.2 Exemple de squelette d'article (MDX)

````mdx
---
title: "Titre de l'article"
description: "Résumé optimisé pour le SEO (155 caractères max)."
pubDate: 2026-10-14
author: "Koretada"
tags: ["terraform", "aws"]
categories: ["Cloud"]
draft: false
---

## TL;DR
Résumé en 2–3 phrases.

## Contexte
...

## Mise en œuvre
```bash
terraform init && terraform apply
```

## Conclusion
...
````

### 17.3 Dépendances externes / comptes requis

- Compte **GitHub** (dépôt + Actions).
- **Docker** (local ou CI) pour construire l'image.
- Hôte d'exécution : VPS, cluster Kubernetes ou PaaS — plus un nom de domaine.
- Compte **Google Search Console** (+ Bing Webmaster Tools).
- Outil **analytics** (Plausible / Umami).

### 17.4 Glossaire

- **SSG** : Static Site Generator — génère du HTML statique au build.
- **Docs-as-code** : gérer la documentation/contenu comme du code (Git, PR, CI/CD).
- **Content Collections** : système Astro de contenu typé et validé par schéma.
- **Image Docker** : artefact immuable empaquetant le site et le serveur Nginx, exécutable partout où Docker tourne.
- **Build multi-étapes** : Dockerfile en plusieurs `FROM`, dont seule la dernière étape est conservée dans l'image finale.
- **Reverse proxy** : serveur placé devant le conteneur, chargé de terminer le TLS et de router le trafic.
- **Core Web Vitals** : métriques Google de performance/UX (LCP, CLS, INP).

---

*Fin du document — PRD v1.0.*
