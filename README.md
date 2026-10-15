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

- `draft: true` place l'article en **brouillon** :
  - ✅ **visible en développement** (`npm run dev`), avec un badge « Brouillon » et un
    rappel sur `/blog` listant les brouillons en attente — pour pouvoir le relire ;
  - ❌ **absent du site publié** (`npm run build`) : la page n'est pas générée, donc
    l'article n'apparaît ni dans les listes, ni dans le flux RSS, ni dans le sitemap,
    ni dans l'index de recherche Pagefind.
  - ♻️ son ancienne URL **redirige en 301 vers `/blog`** au lieu de renvoyer une 404, pour
    ne pas casser une URL déjà indexée (voir [docker/README.md](docker/README.md)).
- Pour publier : passez `draft: false` (ou supprimez la ligne) et mergez. La redirection
  disparaît alors d'elle-même.
- Les images **dans le corps** d'un article sont optimisées par Astro lorsqu'elles sont
  référencées en chemin relatif.
- Les composants MDX (ex. `Callout`) s'importent en tête de fichier :

```mdx
import Callout from '../../components/Callout.astro';

<Callout type="warning" title="Attention">...</Callout>
```

---

## CV & certifications

La page « À propos » affiche le CV. Chaque section est alimentée par une collection
validée par Zod, ce qui permet d'ajouter une ligne sans toucher au code ni à la mise en page.

### Certifications

Un fichier par certification dans `src/content/certifications/` :

```yaml
---
name: 'AWS Certified Solutions Architect – Associate'   # intitulé officiel
issuer: 'Amazon Web Services'                          # organisme émetteur
code: 'SAA-C03'                                        # code de l'examen (optionnel)
issued: 2024-06-15                                     # date d'obtention (optionnel)
expires: 2027-06-15                                    # expiration (optionnel)
verifyUrl: 'https://www.credly.com/badges/…'           # vérification publique (optionnel)
credentialId: 'ABC-123'                                # ID affiché à défaut d'URL (optionnel)
logo: '/images/certifications/mon-badge.svg'           # badge carré depuis public/
logoAlt: 'Badge …'                                     # texte alternatif
accent: 'amber'                                        # sky | amber | violet | emerald | red | neutral
skills: ['Architectures résilientes', 'Optimisation des coûts']
order: 1                                               # ordre d'affichage croissant
draft: false                                           # true = visible en dev uniquement
---
```

Les champs optionnels sont réellement optionnels : une certification sans `issued` s'affiche
sans date (un rappel n'apparaît qu'en développement). Le tri se fait par `order`, puis par date
décroissante.

La collection alimente aussi le JSON-LD `Person.hasCredential` de la page, ce qui permet aux
moteurs de recherche de rattacher les badges au profil.

#### Préparer un badge

Le champ `logo:` attend une image **carrée** servie depuis `public/`. Les visuels fournis par
les éditeurs ont des ratios et des marges très variables : le script de normalisation
détoure, centre dans un carré transparent (sans jamais déformer) et compresse.

```bash
# Depuis un fichier local
node scripts/optimize-certification-badge.mjs ~/telechargements/badge.png --name aws-saa

# Depuis une URL
node scripts/optimize-certification-badge.mjs https://exemple.tld/badge.png --name cka
```

Sortie par défaut : **224×224 px** (4× la taille d'affichage de 56 px, donc net sur Retina et
écrans 3×). Le script avertit si la source est plus petite que la cible — un agrandissement donne
un rendu flou, mieux vaut toujours partir du badge d'origine à la résolution la plus élevée
fournie par l'éditeur. Il affiche aussi la ligne de frontmatter à coller.

> **Choisir `--size`** : inutile de viser 224 px si la source est plus petite. Pour un source de
> 60 px, `--size 112` (2× l'affichage) suffit et divise le poids par ~3 sans perte visible :
> au-delà, on ne fait qu'agrandir du flou.
>
> ```bash
> node scripts/optimize-certification-badge.mjs ./source-60px.png --name mon-badge --size 112
> ```

> **Résolution** : la carte rend le badge en `56×56` CSS. Une source de `60×60` oblige à
> agrandir de ~4× → rendu mou. Visez au minimum **224 px** de côté à la source.

#### Provenance des badges

Les badges de `public/images/certifications/` proviennent des éditeurs de certification. Les
marques (AWS, Kubernetes, CompTIA) appartiennent à leurs détenteurs ; elles sont utilisées ici
pour désigner les certifications obtenues.

| Badge | Source | Traitement |
|---|---|---|
| `aws-solutions-architect.png` | `blog.filador.ch/resume/images/aws-logo.png` | 60×60 → 112×112 |
| `kubernetes-cka.png` | `blog.filador.ch/resume/images/kubernetes-logo.png` | 60×58 → 112×112 |
| `comptia-security-plus.png` | `cin.comptia.org` (mediahub Security+) | 800×730 → 224×224 |

⚠️ Les deux premiers ne sont disponibles qu'en **60 px** : le rendu affiché à 56 px est donc
**agrandi** (≈2×), ce qui donne un résultat mou sur écran Retina. Les remplacer par les badges
officiels haute résolution délivrés aux certifiés — Credly pour AWS et CompTIA, portail
CNCF / Linux Foundation pour la CKA — améliorerait nettement le rendu **et** fournirait
l'`verifyUrl` (lien « Vérifier le badge »). Voir [Préparer un badge](#préparer-un-badge).


Pour insérer la grille dans une page, on utilise le composant :

```mdx
import Certifications from '../../components/Certifications.astro';

## Certifications

<Certifications />
```

---

## Structure du projet

```text
walidblog/
├── .github/workflows/     # CI (lint, types, build, Lighthouse, liens)
├── public/                # assets statiques (favicon, images, robots)
│   └── images/
│       └── certifications/ # badges des certifications (SVG/PNG carrés)
├── src/
│   ├── components/        # Header, Footer, PostCard, BaseHead, Callout, TOC...
│   ├── content/
│   │   ├── blog/          # ARTICLES (.md / .mdx)
│   │   ├── certifications/ # CV : certifications (un fichier par badge)
│   │   └── pages/         # pages statiques (about.mdx)
│   ├── layouts/           # BaseLayout, BlogPostLayout
│   ├── pages/             # routes (index, blog, tags, categories, rss, og...)
│   ├── styles/global.css  # Tailwind + styles Shiki
│   ├── utils/             # helpers (dates, posts, certifications, taxonomie, SEO, OG)
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

### Kubernetes (ArgoCD / GitOps)

Pour un déploiement GitOps sur Kubernetes, les manifests sont dans [`k8s/`](./k8s) :
`Deployment`, `Service`, `Gateway` et `HTTPRoute` (API Gateway, Kustomize base + overlay),
plus une `Application` ArgoCD. Le routage passe par **Traefik** via sa `GatewayClass`.
La CI reporte automatiquement le tag de l'image dans l'overlay de production, et ArgoCD
synchronise le cluster.

```bash
kubectl apply -f k8s/argocd/application.yaml   # bootstrap, une seule fois
kubectl kustomize k8s/overlays/prod            # voir le rendu local
```

> Détails, cycle de publication et dépannage : [`k8s/README.md`](./k8s/README.md).

---

## Publication & mise à jour

### Stratégie retenue

**Image immuable + registre (GHCR) + tags explicites.** Le contenu est cuit dans l'image :
un nouvel article produit une nouvelle image, ce qui garantit un rollback déterministe
(`docker pull :sha-<ancien>`).

| Étape | Où | Déclencheur |
| --- | --- | --- |
| Écrire un article | branche `content/<slug>` | manuel |
| Valider | CI (`ci.yml`) | Pull Request |
| Fusionner | `main` | manuel |
| **Construire + publier l'image** | `publish.yml` → GHCR | merge sur `main` (ou tag `v*`) |
| **Bumper le tag dans les manifests** | `publish.yml` (commit Git) | automatique |
| **Synchroniser le cluster** | ArgoCD | automatique |
| **Mettre à jour un hôte Docker** | serveur | `docker compose pull && up -d` |

### Tags produits

```
ghcr.io/koretada/walid-blog:latest       # mobile → dernier merge de main
ghcr.io/koretada/walid-blog:sha-a1b2c3d  # immuable → rollback déterministe
ghcr.io/koretada/walid-blog:v1.2.0       # tag Git → "release" lisible
```

`publish.yml` réutilise le cache de build (`type=gha`) : la couche `npm ci` n'est pas
rejouée, seul `COPY . .` + `npm run build` le sont.

### Sur le serveur

```bash
# Dernière version
docker compose -f docker/docker-compose.prod.yml pull
docker compose -f docker/docker-compose.prod.yml up -d

# Épingler une version (rollback)
TAG=sha-a1b2c3d docker compose -f docker/docker-compose.prod.yml up -d
```

### Mise à jour automatique (optionnel)

Ajoutez Watchtower pour tirer les nouvelles images sans intervention :

```yaml
  watchtower:
    image: containrrr/watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 600 --cleanup walidblog
```

> Avec Watchtower, la production suit `latest` : pratique, mais vous ne contrôlez plus le
> moment du basculement. Pour un blog, un `docker compose pull` manuel (ou un timer
> `systemd`) reste plus prévisible.

### Première publication

1. Créer le dépôt GitHub et pousser `main`.
2. **Settings → Actions → General → Workflow permissions** : autoriser l'écriture des
   packages (ou se fier à `permissions: packages: write` du workflow).
3. Après le premier run, rendre le package visible : **Packages → walidblog → Package settings**.

Les images de base (`node`, `nginx`) et les dépendances sont suivies par **Dependabot**
(`.github/dependabot.yml`).

---

## Licence

- **Code** : [MIT](./LICENSE)
- **Contenu des articles** : [CC BY-NC-SA 4.0](./CONTENT-LICENSE.md)
