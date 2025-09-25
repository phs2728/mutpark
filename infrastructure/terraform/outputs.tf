output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = module.ecs.alb_dns_name
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  value       = module.cloudfront.cloudfront_domain
}

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = module.database.db_endpoint
  sensitive   = true
}

output "database_url" {
  description = "Database connection URL"
  value       = module.database.database_url
  sensitive   = true
}

output "s3_bucket_name" {
  description = "S3 bucket name for file uploads"
  value       = module.s3.bucket_name
}

output "s3_bucket_domain" {
  description = "S3 bucket domain name"
  value       = module.s3.bucket_domain_name
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = module.ecs.service_name
}

output "application_url" {
  description = "Application URL"
  value       = "https://${var.domain_name}"
}