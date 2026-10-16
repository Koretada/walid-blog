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
# ---------------------------------------------------------------------------
# Image « unprivileged » : elle démarre directement en uid 101 (non-root) et
# n'a donc aucun chown() à faire sur /var/cache/nginx.
#
# L'image officielle `nginx` démarre au contraire le master en root puis tente
# de chown les dossiers de cache vers l'utilisateur nginx (uid 101). Avec
# `capabilities.drop: [ALL]` (cf. k8s/base/deployment.yaml), CAP_CHOWN n'existe
# plus et le conteneur plante :
#   [emerg] chown("/var/cache/nginx/client_temp", 101) failed (1: Operation not permitted)
# ===========================================================================
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

# Les messages d'initialisation de l'entrypoint n'apportent rien ici
ENV NGINX_ENTRYPOINT_QUIET_LOGS=1

# Configuration Nginx (en-têtes de sécurité, cache, compression, 404)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Redirections 301 des articles en brouillon, générées par le build Astro
# (src/pages/drafts.conf.ts). Ce fichier est inclus par nginx.conf et n'est pas
# exposé : il est copié hors de la racine web et bloqué par une location dédiée.
COPY --from=build /app/dist/drafts.conf /etc/nginx/drafts.conf

# On repart d'une racine web vide, puis on y dépose le site généré.
# USER root uniquement le temps de ce nettoyage, quel que soit l'USER de base.
USER root
RUN rm -rf /usr/share/nginx/html/*
COPY --chown=101:101 --from=build /app/dist /usr/share/nginx/html

# Retour à l'utilisateur non privilégié de l'image
USER 101

# Port non privilégié (celui par défaut de l'image unprivileged)
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
