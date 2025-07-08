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

# Get default VPC
data "aws_vpc" "default" {
  default = true
}

# Get default subnets
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Security Group for Aurora Cluster
resource "aws_security_group" "aurora_cluster" {
  name_prefix = "${var.project_name}-aurora-cluster-"
  description = "Security group for ${var.project_name} Aurora PostgreSQL cluster"
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
    Name = "${var.project_name}-aurora-cluster-sg"
  })
}

# Subnet Group for Aurora
resource "aws_db_subnet_group" "aurora" {
  name       = "${var.project_name}-aurora-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = var.tags
}

# Aurora Cluster
resource "aws_rds_cluster" "aurora" {
  cluster_identifier = "${var.project_name}-aurora-cluster"

  # Engine configuration
  engine         = "aurora-postgresql"
  engine_version = "15.4"
  engine_mode    = "provisioned"

  # Database configuration
  database_name   = var.database_name
  master_username = var.database_username
  master_password = var.database_password

  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.aurora.name
  vpc_security_group_ids = [aws_security_group.aurora_cluster.id]
  port                   = 5432

  # Backup and maintenance
  backup_retention_period = var.backup_retention_period
  deletion_protection   = var.deletion_protection
  skip_final_snapshot   = false
  final_snapshot_identifier = "${var.project_name}-aurora-cluster-final-snapshot"

  # Encryption
  storage_encrypted = true

  # Multi-AZ for high availability
  availability_zones = var.availability_zones

  tags = var.tags
}

# Aurora Cluster Instance (Primary)
resource "aws_rds_cluster_instance" "aurora_primary" {
  identifier         = "${var.project_name}-aurora-primary"
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = var.database_instance_class

  # Engine configuration
  engine         = aws_rds_cluster.aurora.engine
  engine_version = aws_rds_cluster.aurora.engine_version

  # Performance Insights
  performance_insights_enabled = true
  performance_insights_retention_period = 7

  # Monitoring
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn

  # Auto scaling
  auto_minor_version_upgrade = true

  tags = var.tags
}

# Aurora Cluster Instance (Read Replica)
resource "aws_rds_cluster_instance" "aurora_replica" {
  count               = var.multi_az ? 1 : 0
  identifier          = "${var.project_name}-aurora-replica"
  cluster_identifier  = aws_rds_cluster.aurora.id
  instance_class      = var.database_instance_class

  # Engine configuration
  engine         = aws_rds_cluster.aurora.engine
  engine_version = aws_rds_cluster.aurora.engine_version

  # Performance Insights
  performance_insights_enabled = true
  performance_insights_retention_period = 7

  # Monitoring
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn

  # Auto scaling
  auto_minor_version_upgrade = true

  tags = var.tags
}

# IAM Role for RDS Monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.project_name}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

# Attach monitoring policy to role
resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "cpu_utilization" {
  alarm_name          = "${var.project_name}-aurora-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors Aurora CPU utilization"
  alarm_actions       = var.alarm_actions

  dimensions = {
    DBClusterIdentifier = aws_rds_cluster.aurora.cluster_identifier
  }
}

resource "aws_cloudwatch_metric_alarm" "free_memory" {
  alarm_name          = "${var.project_name}-aurora-free-memory"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "FreeableMemory"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "1000000000" # 1GB
  alarm_description   = "This metric monitors Aurora free memory"
  alarm_actions       = var.alarm_actions

  dimensions = {
    DBClusterIdentifier = aws_rds_cluster.aurora.cluster_identifier
  }
}

# Outputs
output "cluster_endpoint" {
  description = "The cluster endpoint"
  value       = aws_rds_cluster.aurora.endpoint
}

output "cluster_reader_endpoint" {
  description = "The cluster reader endpoint"
  value       = aws_rds_cluster.aurora.reader_endpoint
}

output "cluster_port" {
  description = "The database port"
  value       = aws_rds_cluster.aurora.port
}

output "cluster_name" {
  description = "The database name"
  value       = aws_rds_cluster.aurora.database_name
}

output "cluster_username" {
  description = "The master username for the database"
  value       = aws_rds_cluster.aurora.master_username
  sensitive   = true
}

output "cluster_password" {
  description = "The master password for the database"
  value       = aws_rds_cluster.aurora.master_password
  sensitive   = true
}

output "cluster_arn" {
  description = "The ARN of the cluster"
  value       = aws_rds_cluster.aurora.arn
}

output "vpc_id" {
  description = "The VPC ID"
  value       = data.aws_vpc.default.id
}

output "subnet_ids" {
  description = "List of subnet IDs"
  value       = data.aws_subnets.default.ids
} 