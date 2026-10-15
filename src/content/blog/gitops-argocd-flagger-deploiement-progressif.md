---
title: 'GitOps avec ArgoCD et déploiement progressif via Flagger'
description: 'Construire une chaîne GitOps de bout en bout : ArgoCD pour synchroniser le cluster depuis Git, Flagger pour livrer progressivement en canary.'
pubDate: 2026-09-18
author: 'Koretada'
tags: ['argocd', 'gitops', 'kubernetes', 'cicd', 'flagger']
categories: ['DevOps']
cover: '/images/argocd-flagger.svg'
coverAlt: 'Illustration « GitOps »'
keywords: ['argocd', 'flagger', 'gitops', 'canary', 'progressive delivery', 'kubernetes']
draft: true
---

## TL;DR

Git devient la source de vérité du cluster. ArgoCD applique l'état décrit dans le dépôt, et Flagger orchestre une livraison progressive en canary en s'appuyant sur des métriques avant de promouvoir la nouvelle version.

## Le principe GitOps

Dans un flux GitOps, le dépôt décrit l'état désiré, et un agent embarqué dans le cluster réconcilie continuellement l'état réel avec l'état décrit.

```text
Développeur ──push──▶ Dépôt Git (manifests)
                          │
                          ▼
                   ArgoCD (in-cluster)
                          │  reconcile
                          ▼
                    Cluster Kubernetes
```

Conséquence directe : annuler un changement revient à faire un `git revert`. L'historique de Git devient l'historique des déploiements.

## Installer ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Puis on déclare une `Application` qui pointe vers notre dépôt.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: mon-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/example/mon-app-manifests
    targetRevision: main
    path: overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

`selfHeal` et `prune` méritent l'attention : ils suppriment ce qui n'est plus décrit et corrigent les dérives manuelles. C'est puissant, et à activer en conscience.

## Au-delà du déploiement : livrer progressivement

ArgoCD synchronise un état, mais il ne décide pas _si_ une nouvelle version est bonne. C'est là qu'intervient Flagger : il gère un canary piloté par des métriques.

```yaml
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: mon-app
  namespace: prod
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mon-app
  service:
    port: 80
  analysis:
    interval: 1m
    threshold: 5
    maxWeight: 50
    stepWeight: 10
    metrics:
      - name: request-success-rate
        thresholdRange:
          min: 99
        interval: 1m
    webhooks:
      - name: load-test
        url: http://flagger-loadtester.test/
```

Le déroulé : Flagger crée une version canary, redirige progressivement le trafic (10 %, 20 %…), surveille le taux de succès, puis promeut ou annule automatiquement.

## Ce que ça change

- **Traçabilité** : chaque état du cluster correspond à un commit.
- **Reversibilité** : le retour arrière est un changement Git, pas une opération manuelle sous pression.
- **Confiance** : une mauvaise version est détectée par les métriques avant de toucher tout le trafic.

Le tout s'assemble naturellement : ArgoCD apporte la synchronisation, Flagger apporte la prudence.
