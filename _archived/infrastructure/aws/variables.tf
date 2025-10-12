variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "audiostems"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
  
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "audiostems.com"
}

variable "primary_region" {
  description = "Primary AWS region"
  type        = string
  default     = "us-east-1"
}

variable "secondary_region" {
  description = "Secondary AWS region for disaster recovery"
  type        = string
  default     = "us-west-2"
}

variable "kubernetes_version" {
  description = "Kubernetes version for EKS clusters"
  type        = string
  default     = "1.28"
}

# VPC Configuration - Primary Region
variable "vpc_cidr_primary" {
  description = "CIDR block for primary VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones_primary" {
  description = "Availability zones for primary region"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "private_subnets_primary" {
  description = "Private subnet CIDR blocks for primary region"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnets_primary" {
  description = "Public subnet CIDR blocks for primary region"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

# VPC Configuration - Secondary Region
variable "vpc_cidr_secondary" {
  description = "CIDR block for secondary VPC"
  type        = string
  default     = "10.1.0.0/16"
}

variable "availability_zones_secondary" {
  description = "Availability zones for secondary region"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

variable "private_subnets_secondary" {
  description = "Private subnet CIDR blocks for secondary region"
  type        = list(string)
  default     = ["10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
}

variable "public_subnets_secondary" {
  description = "Public subnet CIDR blocks for secondary region"
  type        = list(string)
  default     = ["10.1.101.0/24", "10.1.102.0/24", "10.1.103.0/24"]
}

# Database Configuration
variable "database_instance_class" {
  description = "Aurora PostgreSQL instance class"
  type        = string
  default     = "db.r6g.large"
}

variable "database_engine_version" {
  description = "Aurora PostgreSQL engine version"
  type        = string
  default     = "15.4"
}

variable "database_backup_retention_period" {
  description = "Database backup retention period in days"
  type        = number
  default     = 30
}

variable "database_deletion_protection" {
  description = "Enable deletion protection for database"
  type        = bool
  default     = true
}

# Redis Configuration
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.r6g.large"
}

variable "redis_num_cache_nodes" {
  description = "Number of Redis cache nodes"
  type        = number
  default     = 3
}

variable "redis_automatic_failover_enabled" {
  description = "Enable automatic failover for Redis"
  type        = bool
  default     = true
}

variable "redis_multi_az_enabled" {
  description = "Enable multi-AZ for Redis"
  type        = bool
  default     = true
}

# EKS Configuration
variable "eks_node_groups" {
  description = "EKS node groups configuration"
  type = map(object({
    desired_capacity = number
    max_capacity     = number
    min_capacity     = number
    instance_types   = list(string)
    capacity_type    = string
    labels           = map(string)
    taints           = list(object({
      key    = string
      value  = string
      effect = string
    }))
  }))
  default = {
    general = {
      desired_capacity = 3
      max_capacity     = 10
      min_capacity     = 1
      instance_types   = ["t3.medium", "t3.large"]
      capacity_type    = "ON_DEMAND"
      labels = {
        Environment = "production"
        NodeGroup   = "general"
      }
      taints = []
    }
    gpu = {
      desired_capacity = 1
      max_capacity     = 5
      min_capacity     = 0
      instance_types   = ["g4dn.xlarge", "g4dn.2xlarge"]
      capacity_type    = "ON_DEMAND"
      labels = {
        Environment = "production"
        NodeGroup   = "gpu"
        Accelerator = "nvidia-tesla-t4"
      }
      taints = [{
        key    = "nvidia.com/gpu"
        value  = "present"
        effect = "NO_SCHEDULE"
      }]
    }
  }
}

# Lambda Configuration
variable "lambda_functions" {
  description = "Lambda functions configuration"
  type = map(object({
    runtime                = string
    handler                = string
    timeout                = number
    memory_size            = number
    environment_variables  = map(string)
    vpc_config            = object({
      subnet_ids         = list(string)
      security_group_ids = list(string)
    })
  }))
  default = {
    audio_processing = {
      runtime    = "nodejs18.x"
      handler    = "index.handler"
      timeout    = 900
      memory_size = 2048
      environment_variables = {}
      vpc_config = {
        subnet_ids         = []
        security_group_ids = []
      }
    }
    auditus_intelligence = {
      runtime    = "python3.9"
      handler    = "lambda_function.lambda_handler"
      timeout    = 300
      memory_size = 1024
      environment_variables = {}
      vpc_config = {
        subnet_ids         = []
        security_group_ids = []
      }
    }
  }
}

# WAF Configuration
variable "waf_rules" {
  description = "WAF rules configuration"
  type = list(object({
    name        = string
    priority    = number
    action      = string
    rate_limit  = optional(number)
    time_window = optional(number)
    rule_type   = optional(string)
  }))
  default = [
    {
      name        = "RateLimit"
      priority    = 1
      action      = "BLOCK"
      rate_limit  = 2000
      time_window = 300
    },
    {
      name     = "SQLInjection"
      priority = 2
      action   = "BLOCK"
      rule_type = "SQL_INJECTION"
    },
    {
      name     = "XSS"
      priority = 3
      action   = "BLOCK"
      rule_type = "XSS"
    }
  ]
}

# CloudWatch Configuration
variable "cloudwatch_log_retention_days" {
  description = "CloudWatch log retention period in days"
  type        = number
  default     = 30
}

variable "cloudwatch_metric_filters" {
  description = "CloudWatch metric filters"
  type = list(object({
    name    = string
    pattern = string
    metric_transformation = object({
      name      = string
      namespace = string
      value     = string
    })
  }))
  default = [
    {
      name    = "ErrorCount"
      pattern = "[timestamp, request_id, level=ERROR, ...]"
      metric_transformation = {
        name      = "ErrorCount"
        namespace = "AudioStems"
        value     = "1"
      }
    }
  ]
}

# Tags
variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "audiostems"
    Environment = "production"
    ManagedBy   = "terraform"
    Owner       = "audiostems-team"
  }
} 