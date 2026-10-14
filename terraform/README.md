# Infrastructure — walidblog (Terraform)

Infrastructure AWS du blog : hébergement statique **S3 + CloudFront**, certificat **ACM**,
DNS **Route53**, et **rôle IAM OIDC** pour le déploiement depuis GitHub Actions.

## Architecture

```text
Route53 (walidblog.<domain>)
   │
   ├── ACM (us-east-1) ── validation DNS
   │
   └── CloudFront (HTTPS, en-têtes de sécurité, cache)
          │
          └── S3 Bucket (privé, OAC) ── fichiers du build Astro
                 ▲
                 └── GitHub Actions (OIDC → rôle restreint : S3 + invalidation)
```

## Prérequis

- Terraform ≥ 1.7
- Un compte AWS avec les droits de créer S3 / CloudFront / ACM / Route53 / IAM
- Une zone **Route53** existante pour le domaine

## Utilisation

```bash
cd terraform

# 1. Configurer les variables
cp terraform.tfvars.example terraform.tfvars
$EDITOR terraform.tfvars

# 2. Initialiser
terraform init

# 3. Prévisualiser
terraform plan

# 4. Appliquer
terraform apply
```

## Sorties utiles

Après `apply`, récupérez les valeurs à configurer côté GitHub :

```bash
terraform output bucket_name                 # → variable AWS_BUCKET
terraform output cloudfront_distribution_id  # → variable CLOUDFRONT_DISTRIBUTION_ID
terraform output deploy_role_arn             # → secret AWS_ROLE_ARN
```

## State distant (recommandé)

Par défaut, le state est local. Pour le rendre partagé et verrouillé, créez un bucket S3
et une table DynamoDB, puis décommentez le bloc `backend "s3"` dans `versions.tf`.

## Premier déploiement

L'infrastructure se crée sans contenu. Poussez ensuite sur `main` : le workflow
`Deploy (production)` construit le site et synchronise `dist/` vers le bucket.

## Coûts

Le site est statique : le coût reste proche de zéro (stockage S3 négligeable et
CloudFront dans le palier gratuit ou à un coût minime). `PriceClass_100` limite la
diffusion à l'Europe et l'Amérique du Nord.
