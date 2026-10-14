terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }

  # ---------------------------------------------------------------------------
  # Backend distant recommandé (à activer après création du bucket de state).
  # Renseignez les valeurs via `terraform init -backend-config=...`
  # ou décommentez et fixez-les ici.
  # ---------------------------------------------------------------------------
  # backend "s3" {
  #   bucket         = "walidblog-tfstate"
  #   key            = "walidblog/terraform.tfstate"
  #   region         = "eu-west-3"
  #   dynamodb_table = "walidblog-tflock"
  #   encrypt        = true
  # }
}
