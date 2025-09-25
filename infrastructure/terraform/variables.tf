variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
  default     = "staging"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"  # Frankfurt is closest to Turkey
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
}

# Database variables
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "mutpark_user"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "mutpark"
}

# Application variables
variable "app_image" {
  description = "Docker image for the application"
  type        = string
  default     = "ghcr.io/mutpark/mutpark:latest"
}

variable "app_port" {
  description = "Port the application runs on"
  type        = number
  default     = 8080
}

variable "desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 2
}

variable "cpu" {
  description = "CPU units for ECS task"
  type        = number
  default     = 512
}

variable "memory" {
  description = "Memory for ECS task"
  type        = number
  default     = 1024
}

# Application secrets
variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "nextauth_secret" {
  description = "NextAuth secret key"
  type        = string
  sensitive   = true
}

variable "nextauth_url" {
  description = "NextAuth URL"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "mutpark.com"
}

# Auto Scaling variables
variable "min_capacity" {
  description = "Minimum number of ECS tasks"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 10
}

variable "target_cpu_utilization" {
  description = "Target CPU utilization for auto scaling"
  type        = number
  default     = 70
}

variable "target_memory_utilization" {
  description = "Target memory utilization for auto scaling"
  type        = number
  default     = 80
}