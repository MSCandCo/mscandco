terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Use existing VPC and subnets (if available)
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Security Group for RDS
resource "aws_security_group" "database" {
  name_prefix = "${var.project_name}-database-"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "PostgreSQL access"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-database-sg"
  })
}

# Subnet Group for RDS
resource "aws_db_subnet_group" "database" {
  name       = "${var.project_name}-database-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = var.tags
}

# RDS Instance (simplified)
resource "aws_db_instance" "database" {
  identifier = "${var.project_name}-database"

  # Engine configuration
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.database_instance_class

  # Storage configuration
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type         = "gp3"
  storage_encrypted    = true

  # Database configuration
  db_name  = var.database_name
  username = var.database_username
  password = var.database_password

  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.database.name
  vpc_security_group_ids = [aws_security_group.database.id]
  port                   = 5432
  publicly_accessible    = true  # For development - remove in production

  # Backup and maintenance
  backup_retention_period = var.backup_retention_period
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  auto_minor_version_upgrade = true

  # Deletion protection
  deletion_protection = var.deletion_protection
  skip_final_snapshot = false
  final_snapshot_identifier = "${var.project_name}-database-final-snapshot"

  # Multi-AZ for high availability
  multi_az = var.multi_az

  tags = var.tags
}

# Outputs
output "database_endpoint" {
  description = "The connection endpoint"
  value       = aws_db_instance.database.endpoint
}

output "database_port" {
  description = "The database port"
  value       = aws_db_instance.database.port
}

output "database_name" {
  description = "The database name"
  value       = aws_db_instance.database.db_name
}

output "database_username" {
  description = "The master username for the database"
  value       = aws_db_instance.database.username
  sensitive   = true
}

output "database_password" {
  description = "The master password for the database"
  value       = aws_db_instance.database.password
  sensitive   = true
}

output "database_arn" {
  description = "The ARN of the database"
  value       = aws_db_instance.database.arn
}

output "vpc_id" {
  description = "The VPC ID"
  value       = data.aws_vpc.default.id
}

output "subnet_ids" {
  description = "List of subnet IDs"
  value       = data.aws_subnets.default.ids
} 