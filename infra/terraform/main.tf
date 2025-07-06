terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
  backend "s3" {
    bucket         = "audiostems-terraform-state"
    key            = "global/main.tfstate"
    region         = "us-east-1"
    dynamodb_table = "audiostems-terraform-lock"
    encrypt        = true
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

locals {
  regions = ["us-east-1", "eu-west-1"]
}

module "vpc" {
  source = "./modules/vpc"
  region = var.aws_region
}

module "eks" {
  source = "./modules/eks"
  vpc_id = module.vpc.vpc_id
  region = var.aws_region
}

module "aurora" {
  source = "./modules/aurora"
  vpc_id = module.vpc.vpc_id
  region = var.aws_region
}

module "redis" {
  source = "./modules/redis"
  vpc_id = module.vpc.vpc_id
  region = var.aws_region
}

module "s3" {
  source = "./modules/s3"
  region = var.aws_region
  cross_region_replication = true
}

module "cloudfront" {
  source = "./modules/cloudfront"
  s3_bucket_id = module.s3.bucket_id
  region = var.aws_region
}

module "monitoring" {
  source = "./modules/monitoring"
  region = var.aws_region
}

module "security" {
  source = "./modules/security"
  region = var.aws_region
} 