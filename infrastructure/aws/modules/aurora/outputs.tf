output "cluster_id" {
  description = "Aurora cluster ID"
  value       = aws_rds_cluster.main.id
}

output "cluster_arn" {
  description = "Aurora cluster ARN"
  value       = aws_rds_cluster.main.arn
}

output "cluster_endpoint" {
  description = "Aurora cluster endpoint"
  value       = aws_rds_cluster.main.endpoint
}

output "cluster_reader_endpoint" {
  description = "Aurora cluster reader endpoint"
  value       = aws_rds_cluster.main.reader_endpoint
}

output "cluster_resource_id" {
  description = "Aurora cluster resource ID"
  value       = aws_rds_cluster.main.cluster_resource_id
}

output "cluster_identifier" {
  description = "Aurora cluster identifier"
  value       = aws_rds_cluster.main.cluster_identifier
}

output "cluster_port" {
  description = "Aurora cluster port"
  value       = aws_rds_cluster.main.port
}

output "cluster_database_name" {
  description = "Aurora cluster database name"
  value       = aws_rds_cluster.main.database_name
}

output "cluster_master_username" {
  description = "Aurora cluster master username"
  value       = aws_rds_cluster.main.master_username
}

output "cluster_status" {
  description = "Aurora cluster status"
  value       = aws_rds_cluster.main.status
}

output "cluster_availability_zones" {
  description = "Aurora cluster availability zones"
  value       = aws_rds_cluster.main.availability_zones
}

output "cluster_backup_retention_period" {
  description = "Aurora cluster backup retention period"
  value       = aws_rds_cluster.main.backup_retention_period
}

output "cluster_deletion_protection" {
  description = "Aurora cluster deletion protection"
  value       = aws_rds_cluster.main.deletion_protection
}

output "cluster_storage_encrypted" {
  description = "Aurora cluster storage encrypted"
  value       = aws_rds_cluster.main.storage_encrypted
}

output "cluster_kms_key_id" {
  description = "Aurora cluster KMS key ID"
  value       = aws_rds_cluster.main.kms_key_id
}

output "cluster_enabled_cloudwatch_logs_exports" {
  description = "Aurora cluster enabled CloudWatch logs exports"
  value       = aws_rds_cluster.main.enabled_cloudwatch_logs_exports
}

output "primary_instances" {
  description = "Primary Aurora instances"
  value = {
    for k, v in aws_rds_cluster_instance.primary : k => {
      id                = v.id
      arn               = v.arn
      identifier        = v.identifier
      endpoint          = v.endpoint
      port              = v.port
      instance_class    = v.instance_class
      engine            = v.engine
      engine_version    = v.engine_version
      status            = v.status
      availability_zone = v.availability_zone
      performance_insights_enabled = v.performance_insights_enabled
      monitoring_interval = v.monitoring_interval
      monitoring_role_arn = v.monitoring_role_arn
    }
  }
}

output "replica_instances" {
  description = "Replica Aurora instances"
  value = {
    for k, v in aws_rds_cluster_instance.replicas : k => {
      id                = v.id
      arn               = v.arn
      identifier        = v.identifier
      endpoint          = v.endpoint
      port              = v.port
      instance_class    = v.instance_class
      engine            = v.engine
      engine_version    = v.engine_version
      status            = v.status
      availability_zone = v.availability_zone
      performance_insights_enabled = v.performance_insights_enabled
      monitoring_interval = v.monitoring_interval
      monitoring_role_arn = v.monitoring_role_arn
    }
  }
}

output "readonly_instances" {
  description = "Read-only Aurora instances"
  value = {
    for k, v in aws_rds_cluster_instance.read_only : k => {
      id                = v.id
      arn               = v.arn
      identifier        = v.identifier
      endpoint          = v.endpoint
      port              = v.port
      instance_class    = v.instance_class
      engine            = v.engine
      engine_version    = v.engine_version
      status            = v.status
      availability_zone = v.availability_zone
      performance_insights_enabled = v.performance_insights_enabled
      monitoring_interval = v.monitoring_interval
      monitoring_role_arn = v.monitoring_role_arn
    }
  }
}

output "subnet_group_id" {
  description = "Aurora subnet group ID"
  value       = aws_db_subnet_group.main.id
}

output "subnet_group_arn" {
  description = "Aurora subnet group ARN"
  value       = aws_db_subnet_group.main.arn
}

output "subnet_group_name" {
  description = "Aurora subnet group name"
  value       = aws_db_subnet_group.main.name
}

output "cluster_parameter_group_id" {
  description = "Aurora cluster parameter group ID"
  value       = aws_rds_cluster_parameter_group.main.id
}

output "cluster_parameter_group_arn" {
  description = "Aurora cluster parameter group ARN"
  value       = aws_rds_cluster_parameter_group.main.arn
}

output "cluster_parameter_group_name" {
  description = "Aurora cluster parameter group name"
  value       = aws_rds_cluster_parameter_group.main.name
}

output "instance_parameter_group_id" {
  description = "Aurora instance parameter group ID"
  value       = aws_db_parameter_group.main.id
}

output "instance_parameter_group_arn" {
  description = "Aurora instance parameter group ARN"
  value       = aws_db_parameter_group.main.arn
}

output "instance_parameter_group_name" {
  description = "Aurora instance parameter group name"
  value       = aws_db_parameter_group.main.name
}

output "kms_key_id" {
  description = "KMS key ID for Aurora encryption"
  value       = aws_kms_key.aurora.key_id
}

output "kms_key_arn" {
  description = "KMS key ARN for Aurora encryption"
  value       = aws_kms_key.aurora.arn
}

output "rds_monitoring_role_arn" {
  description = "RDS monitoring role ARN"
  value       = aws_iam_role.rds_monitoring.arn
}

output "rds_monitoring_role_name" {
  description = "RDS monitoring role name"
  value       = aws_iam_role.rds_monitoring.name
} 