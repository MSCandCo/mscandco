# Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.cluster_identifier}-subnet-group"
  subnet_ids = var.subnet_ids

  tags = merge(var.tags, {
    Name = "${var.cluster_identifier}-subnet-group"
  })
}

# Parameter Group
resource "aws_rds_cluster_parameter_group" "main" {
  family = "aurora-postgresql15"
  name   = "${var.cluster_identifier}-cluster-params"

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_lock_waits"
    value = "1"
  }

  parameter {
    name  = "log_temp_files"
    value = "0"
  }

  parameter {
    name  = "log_autovacuum_min_duration"
    value = "0"
  }

  parameter {
    name  = "log_checkpoints"
    value = "1"
  }

  parameter {
    name  = "log_replication_commands"
    value = "1"
  }

  tags = var.tags
}

resource "aws_db_parameter_group" "main" {
  family = "aurora-postgresql15"
  name   = "${var.cluster_identifier}-instance-params"

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_lock_waits"
    value = "1"
  }

  parameter {
    name  = "log_temp_files"
    value = "0"
  }

  parameter {
    name  = "log_autovacuum_min_duration"
    value = "0"
  }

  parameter {
    name  = "log_checkpoints"
    value = "1"
  }

  parameter {
    name  = "log_replication_commands"
    value = "1"
  }

  tags = var.tags
}

# KMS Key for Encryption
resource "aws_kms_key" "aurora" {
  description             = "Aurora PostgreSQL Encryption Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = var.tags
}

resource "aws_kms_alias" "aurora" {
  name          = "alias/${var.cluster_identifier}-aurora"
  target_key_id = aws_kms_key.aurora.key_id
}

# Aurora Cluster
resource "aws_rds_cluster" "main" {
  cluster_identifier     = var.cluster_identifier
  engine                = "aurora-postgresql"
  engine_version        = var.engine_version
  database_name         = var.database_name
  master_username       = var.master_username
  master_password       = var.master_password
  skip_final_snapshot   = var.skip_final_snapshot
  deletion_protection   = var.deletion_protection
  backup_retention_period = var.backup_retention_period

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = var.security_group_ids

  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.main.name

  storage_encrypted = true
  kms_key_id       = aws_kms_key.aurora.arn

  enabled_cloudwatch_logs_exports = ["postgresql"]

  copy_tags_to_snapshot = true

  tags = var.tags
}

# Aurora Instances
resource "aws_rds_cluster_instance" "primary" {
  count = var.cluster_size.primary

  identifier         = "${var.cluster_identifier}-primary-${count.index + 1}"
  cluster_identifier = aws_rds_cluster.main.id
  instance_class    = var.instance_class
  engine            = aws_rds_cluster.main.engine
  engine_version    = aws_rds_cluster.main.engine_version

  db_parameter_group_name = aws_db_parameter_group.main.name

  performance_insights_enabled          = var.enable_performance_insights
  performance_insights_retention_period = 7
  monitoring_interval                  = var.monitoring_interval
  monitoring_role_arn                  = aws_iam_role.rds_monitoring.arn

  auto_minor_version_upgrade = true

  tags = merge(var.tags, {
    Name = "${var.cluster_identifier}-primary-${count.index + 1}"
  })
}

resource "aws_rds_cluster_instance" "replicas" {
  count = var.cluster_size.replicas

  identifier         = "${var.cluster_identifier}-replica-${count.index + 1}"
  cluster_identifier = aws_rds_cluster.main.id
  instance_class    = var.instance_class
  engine            = aws_rds_cluster.main.engine
  engine_version    = aws_rds_cluster.main.engine_version

  db_parameter_group_name = aws_db_parameter_group.main.name

  performance_insights_enabled          = var.enable_performance_insights
  performance_insights_retention_period = 7
  monitoring_interval                  = var.monitoring_interval
  monitoring_role_arn                  = aws_iam_role.rds_monitoring.arn

  auto_minor_version_upgrade = true

  tags = merge(var.tags, {
    Name = "${var.cluster_identifier}-replica-${count.index + 1}"
  })
}

resource "aws_rds_cluster_instance" "read_only" {
  count = var.cluster_size.read_only

  identifier         = "${var.cluster_identifier}-readonly-${count.index + 1}"
  cluster_identifier = aws_rds_cluster.main.id
  instance_class    = var.instance_class
  engine            = aws_rds_cluster.main.engine
  engine_version    = aws_rds_cluster.main.engine_version

  db_parameter_group_name = aws_db_parameter_group.main.name

  performance_insights_enabled          = var.enable_performance_insights
  performance_insights_retention_period = 7
  monitoring_interval                  = var.monitoring_interval
  monitoring_role_arn                  = aws_iam_role.rds_monitoring.arn

  auto_minor_version_upgrade = true

  tags = merge(var.tags, {
    Name = "${var.cluster_identifier}-readonly-${count.index + 1}"
  })
}

# IAM Role for RDS Monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.cluster_identifier}-rds-monitoring-role"

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

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "cpu_utilization" {
  alarm_name          = "${var.cluster_identifier}-cpu-utilization"
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
    DBClusterIdentifier = aws_rds_cluster.main.cluster_identifier
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "freeable_memory" {
  alarm_name          = "${var.cluster_identifier}-freeable-memory"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "FreeableMemory"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "1000000000"
  alarm_description   = "This metric monitors Aurora freeable memory"
  alarm_actions       = var.alarm_actions

  dimensions = {
    DBClusterIdentifier = aws_rds_cluster.main.cluster_identifier
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "database_connections" {
  alarm_name          = "${var.cluster_identifier}-database-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "100"
  alarm_description   = "This metric monitors Aurora database connections"
  alarm_actions       = var.alarm_actions

  dimensions = {
    DBClusterIdentifier = aws_rds_cluster.main.cluster_identifier
  }

  tags = var.tags
}

# Event Subscription for RDS Events
resource "aws_db_event_subscription" "main" {
  name      = "${var.cluster_identifier}-events"
  sns_topic = var.sns_topic_arn

  source_type = "db-cluster"
  source_ids  = [aws_rds_cluster.main.id]

  event_categories = [
    "availability",
    "backup",
    "configuration change",
    "creation",
    "deletion",
    "failure",
    "maintenance",
    "notification",
    "recovery",
    "restoration"
  ]

  tags = var.tags
} 