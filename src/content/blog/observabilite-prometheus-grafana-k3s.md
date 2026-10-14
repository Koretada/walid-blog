---
title: 'Observabilité sur K3s : Prometheus, Grafana et Alertmanager'
description: 'Mettre en place la stack kube-prometheus-stack sur un cluster K3s : installation, ServiceMonitor, dashboards et premières alertes.'
pubDate: 2026-09-30
author: 'Koretada'
tags: ['prometheus', 'grafana', 'kubernetes', 'observabilite']
categories: ['Observabilité']
cover: '/images/prometheus-grafana.svg'
coverAlt: 'Illustration « Observabilité »'
keywords: ['prometheus', 'grafana', 'alertmanager', 'k3s', 'monitoring']
---

## TL;DR

On installe `kube-prometheus-stack` via Helm sur K3s, on branche une application avec un `ServiceMonitor`, puis on crée une alerte utile. En sortie : des métriques, des tableaux de bord et des notifications.

## Pourquoi le « kube-prometheus-stack »

Installer Prometheus seul laisse de côté l'essentiel : les exporters, les règles d'alerte prêtes à l'emploi et les tableaux de bord Grafana. Le chart `kube-prometheus-stack` (projet prometheus-community) assemble tout cela de façon cohérente.

## Installation

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace \
  --set grafana.adminPassword='change-me' \
  --set prometheus.prometheusSpec.retention=7d
```

Pour un cluster d'apprentissage, on peut réduire les ressources et désactiver `kubeEtcd`/`kubeControllerManager`, souvent inaccessibles sur K3s.

## Vérifier que ça collecte

```bash
kubectl -n monitoring get pods
kubectl -n monitoring port-forward svc/monitoring-kube-prometheus-prometheus 9090:9090
# http://localhost:9090/targets
```

La page `targets` liste ce que Prometheus scrape. Un `UP` sur les cibles Kubernetes indique une collecte saine.

## Exposer une application

Une application expose ses métriques, mais Prometheus doit savoir _quoi_ scraper. C'est le rôle du `ServiceMonitor`, une CRD du Prometheus Operator.

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: mon-app
  namespace: monitoring
  labels:
    release: monitoring
spec:
  namespaceSelector:
    matchNames: ['default']
  selector:
    matchLabels:
      app: mon-app
  endpoints:
    - port: http-metrics
      interval: 30s
      path: /metrics
```

> Piège classique : le `ServiceMonitor` doit porter le label attendu par le sélecteur du chart (`release: monitoring`). Sans lui, Prometheus l'ignore silencieusement.

## Une première alerte utile

Prévenons-nous lorsqu'un service disparaît, plutôt que de surveiller des seuils arbitraires.

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: disponibilite
  namespace: monitoring
  labels:
    release: monitoring
spec:
  groups:
    - name: disponibilite.rules
      rules:
        - alert: CibleIndisponible
          expr: up == 0
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: 'La cible {{ $labels.instance }} est indisponible depuis 5 minutes'
```

`Alertmanager` prend ensuite le relais pour router la notification (Slack, e-mail, webhook).

## Ce qu'il faut retenir

- Prometheus collecte, Grafana visualise, Alertmanager notifie : trois responsabilités distinctes.
- Sur K3s, adaptez les composants désactivés par défaut.
- Une alerte doit correspondre à une **action** claire. `up == 0` en est une ; « la RAM dépasse 70 % » rarement.
