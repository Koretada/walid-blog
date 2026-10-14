# syntax=docker/dockerfile:1
#
# Image de production du blog « walidblog ».
#
#   Étape 1 (build)   : construit le site statique Astro + l'index de recherche Pagefind
#   Étape 2 (runtime) : sert le résultat avec Nginx (image finale légère, sans Node)
#
# Le contexte de build doit être la RACINE du dépôt :
#
#   docker build -f docker/Dockerfile -t walidblog .
#   # ou simplement :
#   docker compose -f docker/docker-compose.yml up --build
#
# Puis : http://localhost:8080

# ===========================================================================
# Étape 1 — Build
# ---------------------------------------------------------------------------
# IMPORTANT : on utilise une base Debian (glibc) et NON Alpine (musl).
# Pagefind ne publie que des binaires glibc (@pagefind/linux-x64) : sur Alpine,
# `npm ci` installerait ce binaire et le build échouerait à l'exécution.
# ===========================================================================
FROM node:26-bookworm-slim AS build

WORKDIR /app

# Dépendances installées seules → cette couche reste en cache tant que le
# lockfile ne change pas, même si le contenu des articles évolue.
COPY package.json package-lock.json ./
RUN npm ci

# Code source (le reste est filtré par .dockerignore à la racine)
COPY . .

# Build de production : `astro build && pagefind --site dist`
RUN npm run build

# ===========================================================================
# Étape 2 — Runtime : Nginx sert uniquement des fichiers statiques
# ===========================================================================
FROM nginx:1.27-alpine AS runtime

# Configuration Nginx (en-têtes de sécurité, cache, compression, 404)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# On repart d'une racine web vide, puis on y dépose le site généré
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

# Port non privilégié (permet de passer à un conteneur non-root)
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
