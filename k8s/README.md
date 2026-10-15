# Déploiement Kubernetes (ArgoCD / GitOps)

Le blog est publié sous forme d'image Docker sur GHCR, puis déployé sur un cluster
Kubernetes par **ArgoCD**, selon le principe GitOps : **Git est la source de vérité**,
ArgoCD réconcilie en continu l'état du cluster.

> Prérequis : un cluster avec **ArgoCD** et l'**API Gateway**.
> Sur K3s, **Traefik** est fourni par défaut : il fournit la `GatewayClass` `traefik`
> (à activer, voir [Traefik & Gateway API](#traefik--gateway-api)).

## Sommaire du dossier

| Fichier | Rôle |
| --- | --- |
| `base/` | Manifests communs : `Deployment`, `Service`, `Gateway`, `HTTPRoute`, `Issuer`, `Certificate` |
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
                        └──► synchronise le cluster (Deployment · Service · Gateway · HTTPRoute)
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

Remplacez `walidblog.example.com` dans `base/gateway.yaml` (uniquement dans les
`HTTPRoute`) par votre domaine réel, et alignez la valeur `site` de `astro.config.mjs`
(ou la variable d'environnement `SITE_URL`).

### 2. Bootstrap de l'`Application`

ArgoCD ne peut pas se déclarer lui-même : cette étape est manuelle et unique.

```bash
kubectl apply -f k8s/argocd/application.yaml
```

À partir de là, **tout passe par Git** : plus besoin de `kubectl apply` sur les manifests.

### 3. Suivre l'état

```bash
kubectl -n argocd get application walid-blog
kubectl -n walid-blog get pods,svc,gateway,httproute
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
- **`runAsNonRoot` + `drop: [ALL]`** : l'image de runtime
  (`nginxinc/nginx-unprivileged`) démarre en uid 101 et n'effectue **aucun `chown`**, ce qui
  la rend compatible avec le profil *restricted* des Pod Security Standards. À l'inverse,
  l'image officielle `nginx` — qui démarre le master en root — échouerait ici
  (`chown(.../client_temp, 101) failed: Operation not permitted`). Voir
  [`../docker/README.md`](../docker/README.md).

## Traefik & Gateway API

Le routage utilise l'**API Gateway** (et non plus `Ingress`) : la ressource `HTTPRoute`
s'attache à une `Gateway`, dont la `GatewayClass` est fournie par **Traefik**.

> ⚠️ Ne pas confondre : **Traefik** route le trafic *vers* le cluster (Gateway / HTTPRoute),
> **Nginx** sert les fichiers statiques *dans* le conteneur (voir [`../docker/`](../docker)).

### Prérequis (une seule fois, au niveau du cluster)

**1. Installer les CRD de l'API Gateway** (canal *Standard*), alignées sur la spécification
supportée par Traefik :

```bash
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.6.3/standard-install.yaml
```

**2. Activer le provider Gateway de Traefik.** Il est **désactivé par défaut**
(`providers.kubernetesGateway.enabled: false`). Sans cela, la `GatewayClass` `traefik`
n'existe pas et la `Gateway` reste en `Accepted=False`.

Sur K3s, Traefik est géré via `HelmChartConfig` :

```yaml
# /var/lib/rancher/k3s/server/manifests/traefik-config.yaml
apiVersion: helm.cattle.io/v1
kind: HelmChartConfig
metadata:
  name: traefik
  namespace: kube-system
spec:
  valuesContent: |-
    providers:
      kubernetesGateway:
        enabled: true
    gateway:
      enabled: false   # on fournit notre propre Gateway (base/gateway.yaml)
```

Vérification :

```bash
kubectl get gatewayclass                 # → traefik (ACCEPTED: True)
kubectl -n walid-blog get gateway,httproute
```

### Ports des listeners — le piège n°1

> D'après la doc Traefik : les ports des listeners d'une `Gateway` **doivent correspondre
> aux ports des EntryPoints** du déploiement Traefik. Sinon un `ERROR` est journalisé et le
> statut de la ressource passe en échec.

Valeurs par défaut (K3s / chart Helm) :

| Listener | Port à déclarer | EntryPoint Traefik | Exposé par le Service |
| --- | --- | --- | --- |
| `http` | **8000** | `web` | 80 → 8000 |
| `https` | **8443** | `websecure` | 443 → 8443 |

### TLS (Let's Encrypt, challenge HTTP-01)

Le certificat est référencé **sur le listener** de la `Gateway`, en mode `Terminate` :

```yaml
listeners:
  - name: https
    protocol: HTTPS
    port: 8443
    tls:
      mode: Terminate
      certificateRefs:
        - name: walid-blog-tls
```

Le secret `walid-blog-tls` est **produit par cert-manager** à partir de
`base/certificate.yaml` (`Certificate` → `Issuer` `letsencrypt-prod` → `base/issuer.yaml`).

#### Pourquoi le solveur `http01.ingress` et pas `gatewayHTTPRoute`

La doc cert-manager impose au solveur Gateway API une `Gateway` avec **un listener sur le
port 80** :

> *"you can also choose to re-use your existing Gateway, as long as it has a listener on
> port 80."*

Or Traefik exige que les ports de listener correspondent à ses **EntryPoints** (ici `8000`
et `8443`). Les deux contraintes sont incompatibles : le solveur retenu est donc
`http01.ingress` avec `ingressClassName: traefik`, qui s'appuie sur le **provider Ingress de
Traefik** (actif par défaut sur K3s) et n'impose aucune contrainte de port.

Cert-manager crée alors **temporairement** un `Service` et un `Ingress` pour
`/.well-known/acme-challenge/<token>`, puis **les supprime** une fois le certificat émis.

#### Mise en route

```bash
# 1. Remplacer l'adresse e-mail dans base/issuer.yaml (2 occurrences)
# 2. Vérifier l'émetteur
kubectl -n walid-blog get issuer
kubectl -n walid-blog describe issuer letsencrypt-prod

# 3. Suivre la demande
kubectl -n walid-blog get certificate,certificaterequest,order,challenge
kubectl -n walid-blog describe certificate walid-blog-tls

# 4. Prêt quand READY=True et que le secret existe
kubectl -n walid-blog get secret walid-blog-tls
```

#### Mise au point : utiliser l'émetteur *staging*

Let's Encrypt **bloque** après quelques échecs répétés en production. Pour itérer sans
risque, pointez le `Certificate` sur `letsencrypt-staging` (le navigateur affichera un
avertissement de certificat : c'est normal), puis repassez sur `letsencrypt-prod`.

Pour repartir d'un état propre après un échec :

```bash
kubectl -n walid-blog delete secret walid-blog-tls
kubectl -n walid-blog delete certificaterequest --all
```

#### Alternatives

- **Certificat manuel** :
  `kubectl create secret tls walid-blog-tls -n walid-blog --cert=crt.pem --key=key.pem`
- **Émetteur partagé** : remplacez `Issuer` par `ClusterIssuer` dans `base/issuer.yaml`
  (et retirez `metadata.namespace`).

> ⚠️ Ne placez **pas** un `ClusterIssuer` dans `k8s/base/` : l'overlay applique
> `namespace: walid-blog`, et Kustomize ignorant qu'un CRD est *cluster-scoped* y ajouterait
> un `metadata.namespace` invalide. Mettez-le dans un kustomization sans `namespace`, ou
> dans un dépôt de plateforme.

### Redirection HTTP → HTTPS

Aucun `Middleware` Traefik n'est nécessaire : c'est un **filtre natif** de l'API Gateway,
porté par la route `walid-blog-redirect` de `base/httproute.yaml` :

```yaml
filters:
  - type: RequestRedirect
    requestRedirect:
      scheme: https
      statusCode: 301
```

Avec `scheme: https` et **sans** `port`, la redirection cible le port 443 implicite — ce qui
est correct puisque le Service Traefik expose 443 → 8443.

### Alternative : réutiliser la Gateway du chart Traefik

Par défaut, le chart crée aussi sa propre `Gateway` dans le namespace de Traefik. La
réutiliser impose de lever la restriction inter-namespace (une route ne peut pas, par
défaut, s'attacher à une `Gateway` d'un autre namespace) :

```yaml
gateway:
  enabled: true
  listeners:
    web:
      namespacePolicy:
        from: All
```

Puis dans la `HTTPRoute` :
`parentRefs: [{name: traefik-gateway, namespace: traefik, sectionName: web}]`

**Choix retenu : une `Gateway` propre à l'application** (`base/gateway.yaml`, namespace
`walid-blog`). Elle évite toute référence inter-namespace, reste versionnée avec le blog, et
conserve `allowedRoutes.namespaces.from: Same` — soit le réglage le plus restrictif.

## Dépannage

| Symptôme | Cause probable |
| --- | --- |
| `ImagePullBackOff` | Package GHCR resté privé, ou tag inexistant dans le registre |
| `503` sur le domaine | Aucun pod `Ready` (voir `kubectl -n walid-blog describe pod`) |
| `Gateway` en `Accepted=False` | CRD de l'API Gateway absents, ou provider Gateway de Traefik non activé |
| `Gateway` en `Programmed=False` | Port de listener ≠ port d'EntryPoint Traefik (attendu : 8000 / 8443) |
| `HTTPRoute` en `Accepted=False` | `parentRefs` ne cible pas la bonne `Gateway`/listener, ou namespace non autorisé |
| `404` renvoyé par Traefik | `hostnames` de la `HTTPRoute` ≠ domaine demandé |
| Le site répond en HTTP sans redirection | Route `walid-blog-redirect` absente ou non attachée au listener `http` |
| Certificat TLS invalide / auto-signé | Secret `walid-blog-tls` absent ou non prêt (voir section TLS) |
| `Certificate` jamais `READY` | `kubectl -n walid-blog describe certificate walid-blog-tls`, puis `get challenges` |
| Challenge HTTP-01 renvoyant `404` | DNS de `blog.walidb.fr` non propagé, ou route de redirection prioritaire sur le challenge |
| ACME « too many failed authorizations » | Limite Let's Encrypt atteinte : basculer sur `letsencrypt-staging` le temps de corriger |
| ArgoCD `OutOfSync` en boucle | `selfHeal` corrige une modification manuelle : revenez à Git |
| Le site ne se met pas à jour | Le commit de bump n'a pas été poussé (`publish.yml` en échec) |

## Évolution possible

- **Argo CD Image Updater** : supprime le commit de bump (ArgoCD suit le registre
  lui-même). Pertinent si les manifests vivent dans un dépôt de configuration dédié.
- **`ServiceMonitor`** : inutile en l'état, Nginx n'expose pas de métriques Prometheus
  sans exporter supplémentaire.
- **CDN devant la Gateway** : le cluster étant mono-nœud, un cache en amont améliore
  nettement la latence et la résilience.
