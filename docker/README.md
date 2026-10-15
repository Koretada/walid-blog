# walidblog — application conteneurisée

Image Docker de production du blog : le site statique **Astro** est construit dans une
première étape, puis servi par **Nginx** dans une image finale légère (sans Node).

## Sommaire du dossier

| Fichier | Rôle |
| --- | --- |
| `Dockerfile` | Build multi-étapes : `node:22-bookworm-slim` (build) → `nginxinc/nginx-unprivileged:1.27-alpine` (runtime, non-root) |
| `nginx.conf` | Configuration Nginx : en-têtes de sécurité, compression, cache, 404 |
| `docker-compose.yml` | Développement / build local (`--build`) |
| `docker-compose.prod.yml` | Production : utilise l'image publiée sur GHCR |

> Le fichier `.dockerignore` se trouve **à la racine du dépôt** : Docker ne le lit qu'à
> l'endroit du contexte de build, qui est la racine (le build a besoin de `src/`, `public/`…).

## Démarrage

```bash
# Option 1 — Docker Compose (recommandé)
docker compose -f docker/docker-compose.yml up --build

# Option 2 — build + run manuels
docker build -f docker/Dockerfile -t walidblog .
docker run --rm -p 8080:8080 walidblog
```

Le site est alors disponible sur **<http://localhost:8080>**.

## Ce que fait l'image

```text
Étape 1 — build (node:22-bookworm-slim)
   npm ci                    → dépendances (couche mise en cache via le lockfile)
   COPY . .                  → code + contenu
   npm run build             → astro build && pagefind --site dist
   │
   └──► /app/dist
Étape 2 — runtime (nginxinc/nginx-unprivileged:1.27-alpine, uid 101)
   COPY nginx.conf                  → /etc/nginx/conf.d/default.conf
   COPY --from=build /app/dist      → /usr/share/nginx/html
   EXPOSE 8080 + HEALTHCHECK
```

Résultat : une image finale de l'ordre de **quelques dizaines de Mo**, sans Node.js, sans
dépendance applicative, exposant uniquement des fichiers statiques.

## Détails techniques

### Pourquoi Debian et pas Alpine pour l'étape de build ?

**Pagefind ne publie que des binaires glibc** (`@pagefind/linux-x64`, sans variante musl et
sans champ `libc` déclaré). Sur une base Alpine (musl), `npm ci` installerait tout de même
ce binaire, et `npm run build` échouerait à l'exécution. L'étape de build utilise donc
`node:22-bookworm-slim` (glibc). L'étape **runtime** peut rester sur Alpine : elle se
contente de servir des fichiers statiques.

### Port 8080 et utilisateur non-root

Le conteneur écoute sur **8080** et tourne en **uid 101 (non-root)**, grâce à l'image
`nginxinc/nginx-unprivileged`.

> ⚠️ **Ne pas utiliser `nginx:alpine` avec `capabilities.drop: [ALL]`.** L'image officielle
> démarre le master en **root** puis exécute `chown(.../client_temp, 101)` pour basculer les
> workers sur l'utilisateur `nginx`. Sans `CAP_CHOWN`, cette étape échoue et le conteneur
> redémarre en boucle :
> `[emerg] chown("/var/cache/nginx/client_temp", 101) failed (1: Operation not permitted)`

L'image *unprivileged* n'a **aucun `chown` à effectuer** : les chemins temporaires lui
appartiennent déjà. C'est ce qui rend possible un `securityContext` en profil
*restricted* côté Kubernetes (`runAsNonRoot: true`, `drop: [ALL]`).

### En-têtes servis par Nginx

`nginx.conf` applique, sur toutes les réponses :

- `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy` ;
- compression **gzip** sur HTML/CSS/JS/JSON/SVG/RSS ;
- **cache long** (`expires 1y`) pour `/_astro/*` et `/pagefind/*` (assets fingerprintés),
  `30d` pour les images ;
- `error_page 404 → /404.html` (page générée par Astro).

> Les en-têtes sont déclarés au niveau `server` et utilisent `expires` dans les `location` :
> `add_header` dans un `location` écraserait l'héritage des en-têtes de sécurité.

### Redirections des articles en brouillon

Un article marqué `draft: true` n'est **pas généré par le build** : son URL historique
renverrait donc une **404**, ce qui la ferait sortir de l'index des moteurs de recherche.

Pour préserver ces URL, le build Astro produit un fragment de configuration Nginx
(`src/pages/drafts.conf.ts` → `dist/drafts.conf`) qui contient une **redirection 301** par
article en brouillon :

```nginx
location = /blog/mon-article-en-brouillon {
    return 301 /blog;
}
```

Le `Dockerfile` copie ce fichier dans `/etc/nginx/drafts.conf`, et `nginx.conf` l'inclut
dans le bloc `server` (via `include`), avec une `location` qui rend le fichier
**non téléchargeable** (il révèle la liste des articles non publiés).

Trois propriétés à connaître :

- **la liste est dérivée de la collection** : repasser un article en `draft: false`
  **supprime automatiquement** sa redirection, puisque la vraie page est alors générée.
  Rien à maintenir à la main, rien à penser à nettoyer ;
- **les correspondances sont exactes** : une URL réellement inexistante sous `/blog/`
  renvoie toujours une 404 (pas de « soft 404 » global sur tout le dossier) ;
- le `Location` est **relatif** grâce à `absolute_redirect off` (voir plus haut) : aucun
  port interne (`8080`) ne fuit dans l'en-tête.

Vérification locale :

```bash
curl -sSI http://localhost:8080/blog/deployer-k3s-aws-terraform | grep -i location
# Location: /blog

curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:8080/blog/inexistant
# 404
```

### Reverse proxy / HTTPS

Cette image sert du **HTTP** sur `8080`. Placez-la derrière un reverse proxy (Traefik,
Caddy, Nginx, un load balancer…) pour terminer le TLS, ou exposez-la directement si
votre infrastructure s'en charge.

## Vérification

```bash
docker run -d --name walidblog -p 8080:8080 walidblog
curl -sSI http://localhost:8080/ | head -12    # statut, CSP, cache…
docker inspect --format '{{.State.Health.Status}}' walidblog
docker rm -f walidblog
```

---

## Production : image publiée sur GHCR

L'image est construite et publiée automatiquement par le workflow
[`.github/workflows/publish.yml`](../.github/workflows/publish.yml) à chaque merge sur `main`
(et sur les tags Git `v*`).

```text
merge sur main
   └── publish.yml ──► ghcr.io/koretada/walid-blog:latest
                       ghcr.io/koretada/walid-blog:sha-<court>
```

Sur l'hôte :

```bash
docker compose -f docker/docker-compose.prod.yml pull
docker compose -f docker/docker-compose.prod.yml up -d

# Rollback : épingler un tag sha immuable
TAG=sha-a1b2c3d docker compose -f docker/docker-compose.prod.yml up -d
```

Variables reconnues : `IMAGE` (défaut `ghcr.io/koretada/walid-blog`) et `TAG` (défaut `latest`).
