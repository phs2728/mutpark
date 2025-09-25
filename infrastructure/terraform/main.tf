terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  backend "s3" {
    # Configure this in terraform.tfvars or via CLI
    # bucket         = "mutpark-terraform-state"
    # key            = "infrastructure/terraform.tfstate"
    # region         = "eu-west-1"
    # encrypt        = true
    # dynamodb_table = "mutpark-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "MutPark"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Random password for RDS
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"

  environment         = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones

  tags = local.common_tags
}

# Security Groups
module "security_groups" {
  source = "./modules/security_groups"

  environment = var.environment
  vpc_id      = module.vpc.vpc_id

  tags = local.common_tags
}

# RDS Database
module "database" {
  source = "./modules/database"

  environment                = var.environment
  vpc_id                    = module.vpc.vpc_id
  private_subnet_ids        = module.vpc.private_subnet_ids
  database_security_group_id = module.security_groups.database_security_group_id

  db_instance_class = var.db_instance_class
  db_username       = var.db_username
  db_password       = random_password.db_password.result
  db_name           = var.db_name

  tags = local.common_tags
}

# ECS Cluster for Application
module "ecs" {
  source = "./modules/ecs"

  environment               = var.environment
  vpc_id                   = module.vpc.vpc_id
  public_subnet_ids        = module.vpc.public_subnet_ids
  private_subnet_ids       = module.vpc.private_subnet_ids
  alb_security_group_id    = module.security_groups.alb_security_group_id
  ecs_security_group_id    = module.security_groups.ecs_security_group_id

  app_image                = var.app_image
  app_port                 = var.app_port
  desired_count           = var.desired_count
  cpu                     = var.cpu
  memory                  = var.memory

  database_url            = module.database.database_url
  jwt_secret              = var.jwt_secret
  nextauth_secret         = var.nextauth_secret
  nextauth_url            = var.nextauth_url

  tags = local.common_tags
}

# CloudFront CDN
module "cloudfront" {
  source = "./modules/cloudfront"

  environment = var.environment
  alb_dns_name = module.ecs.alb_dns_name

  tags = local.common_tags
}

# S3 Bucket for file uploads
module "s3" {
  source = "./modules/s3"

  environment = var.environment

  tags = local.common_tags
}

# Route 53 DNS
module "route53" {
  source = "./modules/route53"

  environment         = var.environment
  domain_name         = var.domain_name
  cloudfront_domain   = module.cloudfront.cloudfront_domain
  cloudfront_zone_id  = module.cloudfront.cloudfront_zone_id

  tags = local.common_tags
}

# Auto Scaling and Monitoring
module "monitoring" {
  source = "./modules/monitoring"

  environment       = var.environment
  ecs_cluster_name  = module.ecs.cluster_name
  ecs_service_name  = module.ecs.service_name
  alb_arn_suffix    = module.ecs.alb_arn_suffix
  target_group_arn_suffix = module.ecs.target_group_arn_suffix

  tags = local.common_tags
}

locals {
  common_tags = {
    Project     = "MutPark"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}