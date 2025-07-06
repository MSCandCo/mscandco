terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.primary_region
  
  default_tags {
    tags = {
      Project     = "audiostems"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

provider "aws" {
  alias  = "secondary"
  region = var.secondary_region
  
  default_tags {
    tags = {
      Project     = "audiostems"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# VPC and Networking
module "vpc_primary" {
  source = "./modules/vpc"
  
  environment = var.environment
  region     = var.primary_region
  vpc_cidr   = var.vpc_cidr_primary
  
  availability_zones = var.availability_zones_primary
  private_subnets    = var.private_subnets_primary
  public_subnets     = var.public_subnets_primary
  
  enable_nat_gateway = true
  single_nat_gateway = false
}

module "vpc_secondary" {
  source = "./modules/vpc"
  providers = {
    aws = aws.secondary
  }
  
  environment = var.environment
  region     = var.secondary_region
  vpc_cidr   = var.vpc_cidr_secondary
  
  availability_zones = var.availability_zones_secondary
  private_subnets    = var.private_subnets_secondary
  public_subnets     = var.public_subnets_secondary
  
  enable_nat_gateway = true
  single_nat_gateway = false
}

# EKS Clusters
module "eks_primary" {
  source = "./modules/eks"
  
  cluster_name    = "${var.project_name}-${var.environment}-primary"
  cluster_version = var.kubernetes_version
  
  vpc_id     = module.vpc_primary.vpc_id
  subnet_ids = module.vpc_primary.private_subnets
  
  node_groups = {
    general = {
      desired_capacity = 3
      max_capacity     = 10
      min_capacity     = 1
      
      instance_types = ["t3.medium", "t3.large"]
      capacity_type  = "ON_DEMAND"
      
      labels = {
        Environment = var.environment
        NodeGroup   = "general"
      }
    }
    
    gpu = {
      desired_capacity = 1
      max_capacity     = 5
      min_capacity     = 0
      
      instance_types = ["g4dn.xlarge", "g4dn.2xlarge"]
      capacity_type  = "ON_DEMAND"
      
      labels = {
        Environment = var.environment
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

module "eks_secondary" {
  source = "./modules/eks"
  providers = {
    aws = aws.secondary
  }
  
  cluster_name    = "${var.project_name}-${var.environment}-secondary"
  cluster_version = var.kubernetes_version
  
  vpc_id     = module.vpc_secondary.vpc_id
  subnet_ids = module.vpc_secondary.private_subnets
  
  node_groups = {
    general = {
      desired_capacity = 2
      max_capacity     = 5
      min_capacity     = 1
      
      instance_types = ["t3.medium", "t3.large"]
      capacity_type  = "ON_DEMAND"
      
      labels = {
        Environment = var.environment
        NodeGroup   = "general"
      }
    }
  }
}

# Aurora PostgreSQL Cluster
module "aurora" {
  source = "./modules/aurora"
  
  cluster_identifier = "${var.project_name}-${var.environment}"
  
  vpc_id     = module.vpc_primary.vpc_id
  subnet_ids = module.vpc_primary.private_subnets
  
  engine_version = "15.4"
  instance_class = "db.r6g.large"
  
  cluster_size = {
    primary   = 1
    replicas  = 2
    read_only = 2
  }
  
  backup_retention_period = 30
  deletion_protection    = var.environment == "production"
  
  monitoring_interval = 60
  enable_performance_insights = true
}

# ElastiCache Redis
module "redis" {
  source = "./modules/redis"
  
  cluster_id = "${var.project_name}-${var.environment}"
  
  vpc_id     = module.vpc_primary.vpc_id
  subnet_ids = module.vpc_primary.private_subnets
  
  node_type = "cache.r6g.large"
  num_cache_nodes = 3
  
  parameter_group_name = "default.redis7"
  port = 6379
  
  automatic_failover_enabled = true
  multi_az_enabled = true
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
}

# S3 Buckets
module "s3" {
  source = "./modules/s3"
  
  bucket_name = "${var.project_name}-${var.environment}"
  
  versioning_enabled = true
  lifecycle_rules = [
    {
      id      = "audio_files"
      enabled = true
      
      transition = [
        {
          days          = 30
          storage_class = "STANDARD_IA"
        },
        {
          days          = 90
          storage_class = "GLACIER"
        },
        {
          days          = 365
          storage_class = "DEEP_ARCHIVE"
        }
      ]
    }
  ]
  
  cors_configuration = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
      allowed_origins = ["*"]
      expose_headers  = ["ETag"]
      max_age_seconds = 3000
    }
  ]
}

# CloudFront Distribution
module "cloudfront" {
  source = "./modules/cloudfront"
  
  domain_name = var.domain_name
  s3_bucket_id = module.s3.bucket_id
  
  price_class = "PriceClass_100"
  
  default_cache_behavior = {
    target_origin_id       = "S3-${module.s3.bucket_id}"
    viewer_protocol_policy = "redirect-to-https"
    
    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]
    
    compress = true
    
    forwarded_values = {
      query_string = false
      cookies = {
        forward = "none"
      }
    }
    
    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }
  
  ordered_cache_behavior = [
    {
      path_pattern     = "/api/*"
      target_origin_id = "ALB-${module.alb.alb_id}"
      
      allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods  = ["GET", "HEAD"]
      
      forwarded_values = {
        query_string = true
        headers      = ["*"]
        cookies = {
          forward = "all"
        }
      }
      
      min_ttl     = 0
      default_ttl = 0
      max_ttl     = 0
    }
  ]
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  name = "${var.project_name}-${var.environment}"
  
  vpc_id     = module.vpc_primary.vpc_id
  subnet_ids = module.vpc_primary.public_subnets
  
  enable_deletion_protection = var.environment == "production"
  
  listeners = [
    {
      port     = "80"
      protocol = "HTTP"
      action   = "redirect"
      redirect = {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    },
    {
      port            = "443"
      protocol        = "HTTPS"
      certificate_arn = module.acm.certificate_arn
      action          = "forward"
      target_group    = "default"
    }
  ]
}

# ACM Certificate
module "acm" {
  source = "./modules/acm"
  
  domain_name = var.domain_name
  subject_alternative_names = [
    "*.${var.domain_name}",
    "api.${var.domain_name}",
    "admin.${var.domain_name}"
  ]
  
  validation_method = "DNS"
}

# Route53
module "route53" {
  source = "./modules/route53"
  
  domain_name = var.domain_name
  
  records = [
    {
      name    = ""
      type    = "A"
      alias   = true
      zone_id = module.cloudfront.cloudfront_distribution_hosted_zone_id
      target  = module.cloudfront.cloudfront_distribution_domain_name
    },
    {
      name    = "api"
      type    = "A"
      alias   = true
      zone_id = module.alb.alb_zone_id
      target  = module.alb.alb_dns_name
    },
    {
      name    = "admin"
      type    = "A"
      alias   = true
      zone_id = module.alb.alb_zone_id
      target  = module.alb.alb_dns_name
    }
  ]
}

# WAF
module "waf" {
  source = "./modules/waf"
  
  name = "${var.project_name}-${var.environment}"
  
  rules = [
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

# CloudWatch Logs
module "cloudwatch" {
  source = "./modules/cloudwatch"
  
  log_group_name = "/aws/audiostems/${var.environment}"
  
  retention_in_days = 30
  
  metric_filters = [
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

# IAM Roles and Policies
module "iam" {
  source = "./modules/iam"
  
  project_name = var.project_name
  environment  = var.environment
  
  roles = [
    {
      name = "EKSNodeGroupRole"
      assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
          {
            Action = "sts:AssumeRole"
            Effect = "Allow"
            Principal = {
              Service = "ec2.amazonaws.com"
            }
          }
        ]
      })
      managed_policy_arns = [
        "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
        "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
        "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
      ]
    },
    {
      name = "AudioProcessingRole"
      assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
          {
            Action = "sts:AssumeRole"
            Effect = "Allow"
            Principal = {
              Service = "lambda.amazonaws.com"
            }
          }
        ]
      })
      inline_policies = [
        {
          name = "AudioProcessingPolicy"
          policy = jsonencode({
            Version = "2012-10-17"
            Statement = [
              {
                Effect = "Allow"
                Action = [
                  "s3:GetObject",
                  "s3:PutObject",
                  "s3:DeleteObject"
                ]
                Resource = "${module.s3.bucket_arn}/*"
              },
              {
                Effect = "Allow"
                Action = [
                  "logs:CreateLogGroup",
                  "logs:CreateLogStream",
                  "logs:PutLogEvents"
                ]
                Resource = "*"
              }
            ]
          })
        }
      ]
    }
  ]
}

# Lambda Functions
module "lambda" {
  source = "./modules/lambda"
  
  functions = [
    {
      name = "audio-processing"
      runtime = "nodejs18.x"
      handler = "index.handler"
      timeout = 900
      memory_size = 2048
      
      environment_variables = {
        S3_BUCKET = module.s3.bucket_id
        REDIS_ENDPOINT = module.redis.redis_endpoint
      }
      
      vpc_config = {
        subnet_ids         = module.vpc_primary.private_subnets
        security_group_ids = [module.vpc_primary.default_security_group_id]
      }
    },
    {
      name = "auditus-intelligence"
      runtime = "python3.9"
      handler = "lambda_function.lambda_handler"
      timeout = 300
      memory_size = 1024
      
      environment_variables = {
        ELASTICACHE_ENDPOINT = module.redis.redis_endpoint
        S3_BUCKET = module.s3.bucket_id
      }
    }
  ]
}

# EventBridge
module "eventbridge" {
  source = "./modules/eventbridge"
  
  rules = [
    {
      name = "audio-upload-trigger"
      description = "Triggers audio processing when files are uploaded to S3"
      
      event_pattern = jsonencode({
        source = ["aws.s3"]
        detail-type = ["Object Created"]
        detail = {
          bucket = {
            name = [module.s3.bucket_id]
          }
          object = {
            key = [{
              prefix = "uploads/"
            }]
          }
        }
      })
      
      targets = [
        {
          arn = module.lambda.function_arns["audio-processing"]
          id  = "AudioProcessingLambda"
        }
      ]
    }
  ]
}

# Outputs
output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks_primary.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = module.eks_primary.cluster_security_group_id
}

output "cluster_iam_role_name" {
  description = "IAM role name associated with EKS cluster"
  value       = module.eks_primary.cluster_iam_role_name
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = module.eks_primary.cluster_certificate_authority_data
}

output "aurora_cluster_endpoint" {
  description = "Aurora cluster endpoint"
  value       = module.aurora.cluster_endpoint
}

output "aurora_cluster_reader_endpoint" {
  description = "Aurora cluster reader endpoint"
  value       = module.aurora.cluster_reader_endpoint
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.redis.redis_endpoint
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = module.s3.bucket_id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cloudfront.cloudfront_distribution_id
}

output "cloudfront_distribution_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.cloudfront.cloudfront_distribution_domain_name
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.alb.alb_dns_name
}

output "domain_name" {
  description = "Domain name"
  value       = var.domain_name
} 