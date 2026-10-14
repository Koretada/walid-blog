variable "aws_region" {
  description = "Région AWS pour les ressources régionales (S3, IAM, Route53 étant global)"
  type        = string
  default     = "eu-west-3"
}

variable "owner" {
  description = "Propriétaire du projet (tag Owner)"
  type        = string
  default     = "Koretada"
}

variable "domain_name" {
  description = "Nom de domaine principal du site, ex. « walidblog.example.com »"
  type        = string
}

variable "subject_alternative_names" {
  description = "Noms de domaine alternatifs pour le certificat (ex. www)"
  type        = list(string)
  default     = []
}

variable "hosted_zone_name" {
  description = "Nom de la zone Route53 hébergeant le domaine, ex. « example.com »"
  type        = string
}

variable "bucket_name" {
  description = "Nom globalement unique du bucket S3 devant héberger le site"
  type        = string
}

variable "price_class" {
  description = "Classe de prix CloudFront (PriceClass_100 = Europe/Amérique du Nord)"
  type        = string
  default     = "PriceClass_100"
}

variable "github_repo" {
  description = "Dépôt GitHub autorisé à assumer le rôle de déploiement, format « owner/repo »"
  type        = string
}

variable "create_github_oidc_provider" {
  description = "Créer le fournisseur OIDC GitHub (à mettre à false s'il existe déjà dans le compte)"
  type        = bool
  default     = true
}

variable "github_oidc_thumbprints" {
  description = "Empreintes du certificat du fournisseur OIDC GitHub Actions"
  type        = list(string)
  default = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]
}
