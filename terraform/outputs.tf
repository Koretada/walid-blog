output "bucket_name" {
  description = "Nom du bucket S3 à renseigner dans la variable GitHub Actions AWS_BUCKET"
  value       = aws_s3_bucket.site.bucket
}

output "cloudfront_distribution_id" {
  description = "ID de la distribution CloudFront (variable GitHub CLOUDFRONT_DISTRIBUTION_ID)"
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "Nom de domaine CloudFront de la distribution"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "site_url" {
  description = "URL publique du site"
  value       = "https://${var.domain_name}"
}

output "deploy_role_arn" {
  description = "ARN du rôle IAM à renseigner dans le secret GitHub AWS_ROLE_ARN"
  value       = aws_iam_role.deploy.arn
}
