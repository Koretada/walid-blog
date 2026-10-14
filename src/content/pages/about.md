---
title: 'À propos'
description: 'Qui écrit sur walidblog, pourquoi, et comment ce blog est construit en documentation as code.'
---

Bonjour, moi c'est **Koretada**, ingénieur orienté **Cloud, DevOps et Infrastructure-as-Code**. J'écris ici pour documenter ce que je construis, ce que je casse, et ce que j'en apprends.

## Ce que vous trouverez sur ce blog

Des articles concrets sur :

- le **Cloud** (AWS en particulier) et le provisionnement d'infrastructure ;
- l'**Infrastructure-as-Code** avec Terraform ;
- le **DevOps** : CI/CD, GitOps, Kubernetes (K3s), progressive delivery ;
- l'**observabilité** : Prometheus, Grafana, Alertmanager.

Chaque article privilégie les exemples exécutables, les schémas et les retours d'expérience plutôt que la théorie.

## Comment ce blog est fabriqué

Ce blog est lui-même un projet d'ingénierie. Il applique le principe de **documentation as code** :

- Les articles sont des fichiers **Markdown / MDX** versionnés dans **Git**.
- Le site est généré par **Astro** en HTML statique, puis déployé automatiquement.
- Chaque modification passe par une **Pull Request** avec vérifications automatiques (build, liens, budget de performance) et une **préversion**.
- La production se met à jour au merge sur `main`.

Autrement dit : **le contenu vit dans un dépôt, pas dans une base de données**. C'est la même discipline que pour du code, appliquée à l'écriture.

> Vous voulez le détail de l'architecture et des choix techniques ? Tout est décrit dans le `PRD.md` du dépôt.
