provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.tags
  }
}

# CloudFront exige que le certificat ACM soit émis en us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = local.tags
  }
}

locals {
  tags = {
    Project   = "walidblog"
    ManagedBy = "terraform"
    Owner     = var.owner
  }
}
