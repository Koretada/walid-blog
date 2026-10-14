# Déploiement Kubernetes (ArgoCD / GitOps)

Le blog est publié sous forme d'image Docker sur GHCR, puis déployé sur un cluster
Kubernetes par **ArgoCD**, selon le principe GitOps : **Git est la source de vérité**,
ArgoCD réconcilie en continu l'état du cluster.

> Prérequis : un cluster avec **ArgoCD** et un **contrôleur Ingress** (Ingress NGINX).
> Le certificat TLS est fourni par **cert-manager** (optionnel).

## Sommaire du dossier

| Fichier | Rôle |
| --- | --- |
| `base/` | Manifests communs : `Deployment`, `Service`, `Ingress` |
| `overlays/prod/kustomization.yaml` | Overlay de production — **point d'entrée surveillé par ArgoCD** |
| `argocd/application.yaml` | Manifeste de l'`Application` ArgoCD (application unique, une fois) |

## Architecture

```text
merge sur main
   │
   ├─ publish.yml : build + push de l'image
   │     └──► ghcr.io/koretada/walid-blog:sha-<court>
   │
   └─ publish.yml : commit du nouveau tag dans overlays/prod/kustomization.yaml
              │
              └──► ArgoCD détecte le commit
                        │
                        └──► synchronise le cluster (Deployment → Service → Ingress)
```

## Cycle de publication

| Étape | Où | Automatique ? |
| --- | --- | --- |
| Écrire l'article (branche `content/<slug>`) | Git | non |
| Valider (lint, types, build, image) | CI | oui |
| Fusionner sur `main` | Git | non |
| Build + push de l'image | `publish.yml` | oui |
| Commit du tag dans l'overlay | `publish.yml` | oui |
| Synchronisation du cluster | ArgoCD | oui |

**Rollback** — deux possibilités :

```bash
# 1) Via Git (recommandé, laisse une trace)
git revert <commit-de-bump> && git push

# 2) Via ArgoCD (immédiat)
argocd app rollback walid-blog
```

## Mise en place (une seule fois)

### 1. Adapter le domaine

Remplacez `walidblog.example.com` dans `base/ingress.yaml` par votre domaine réel, et
alignez la valeur `site` de `astro.config.mjs` (ou la variable d'environnement `SITE_URL`).

### 2. Bootstrap de l'`Application`

ArgoCD ne peut pas se déclarer lui-même : cette étape est manuelle et unique.

```bash
kubectl apply -f k8s/argocd/application.yaml
```

À partir de là, **tout passe par Git** : plus besoin de `kubectl apply` sur les manifests.

### 3. Suivre l'état

```bash
kubectl -n argocd get application walid-blog
kubectl -n walid-blog get pods,svc,ingress
argocd app get walid-blog          # si le CLI argocd est installé
```

## Vérifier les manifests localement

```bash
# Rendu final (overlay prod)
kubectl kustomize k8s/overlays/prod

# Validation côté client
kubectl apply --dry-run=client -f <(kubectl kustomize k8s/overlays/prod)
```

## Détails de conception

- **2 replicas + `maxUnavailable: 0`** : un RollingUpdate ne coupe jamais le service.
  Sur un cluster mono-nœud, les 2 pods cohabitent sans souci (le site est très léger).
- **Sondes `readiness`/`liveness`** sur `/` : un pod n'entre dans le Service qu'une fois
  Nginx prêt, et un pod bloqué est redémarré.
- **Port 8080** : le conteneur n'écoute pas sur un port privilégié ; le `Service` expose
  le port 80 et fait la correspondance.
- **`imagePullPolicy: IfNotPresent`** : on tire **une seule fois** un tag immuable
  (`sha-<court>`). On ne déploie jamais un tag mouvant — c'est ce qui rend le rollback
  déterministe.
- **`allowPrivilegeEscalation: false` + `drop: ALL`** : durcissement sans casser l'image
  officielle `nginx:alpine` (dont le master a besoin de root pour écrire dans
  `/var/cache/nginx`). Pour aller plus loin : `nginxinc/nginx-unprivileged` (voir
  [`../docker/README.md`](../docker/README.md)).

## Dépannage

| Symptôme | Cause probable |
| --- | --- |
| `ImagePullBackOff` | Package GHCR resté privé, ou tag inexistant dans le registre |
| `503` sur le domaine | Aucun pod `Ready` (voir `kubectl -n walid-blog describe pod`) |
| Certificat TLS invalide | `cert-manager` absent, ou annotation `cluster-issuer` non décommentée |
| ArgoCD `OutOfSync` en boucle | `selfHeal` corrige une modification manuelle : revenez à Git |
| Le site ne se met pas à jour | Le commit de bump n'a pas été poussé (`publish.yml` en échec) |

## Évolution possible

- **Argo CD Image Updater** : supprime le commit de bump (ArgoCD suit le registre
  lui-même). Pertinent si les manifests vivent dans un dépôt de configuration dédié.
- **`ServiceMonitor`** : inutile en l'état, Nginx n'expose pas de métriques Prometheus
  sans exporter supplémentaire.
- **CDN devant l'Ingress** : le cluster étant mono-nœud, un cache en amont améliore
  nettement la latence et la résilience.
