output "replication_group_id" {
  description = "Redis replication group ID"
  value       = aws_elasticache_replication_group.main.id
}

output "replication_group_arn" {
  description = "Redis replication group ARN"
  value       = aws_elasticache_replication_group.main.arn
}

output "redis_endpoint" {
  description = "Redis primary endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "redis_port" {
  description = "Redis port"
  value       = aws_elasticache_replication_group.main.port
}

output "redis_auth_token" {
  description = "Redis auth token"
  value       = aws_elasticache_replication_group.main.auth_token
  sensitive   = true
}

output "redis_member_clusters" {
  description = "Redis member clusters"
  value       = aws_elasticache_replication_group.main.member_clusters
}

output "redis_node_type" {
  description = "Redis node type"
  value       = aws_elasticache_replication_group.main.node_type
}

output "redis_num_cache_clusters" {
  description = "Redis number of cache clusters"
  value       = aws_elasticache_replication_group.main.num_cache_clusters
}

output "redis_automatic_failover_enabled" {
  description = "Redis automatic failover enabled"
  value       = aws_elasticache_replication_group.main.automatic_failover_enabled
}

output "redis_multi_az_enabled" {
  description = "Redis multi-AZ enabled"
  value       = aws_elasticache_replication_group.main.multi_az_enabled
}

output "redis_at_rest_encryption_enabled" {
  description = "Redis at rest encryption enabled"
  value       = aws_elasticache_replication_group.main.at_rest_encryption_enabled
}

output "redis_transit_encryption_enabled" {
  description = "Redis transit encryption enabled"
  value       = aws_elasticache_replication_group.main.transit_encryption_enabled
}

output "redis_kms_key_id" {
  description = "Redis KMS key ID"
  value       = aws_elasticache_replication_group.main.kms_key_id
}

output "redis_parameter_group_name" {
  description = "Redis parameter group name"
  value       = aws_elasticache_replication_group.main.parameter_group_name
}

output "redis_subnet_group_name" {
  description = "Redis subnet group name"
  value       = aws_elasticache_replication_group.main.subnet_group_name
}

output "redis_security_group_ids" {
  description = "Redis security group IDs"
  value       = aws_elasticache_replication_group.main.security_group_ids
}

output "subnet_group_id" {
  description = "Redis subnet group ID"
  value       = aws_elasticache_subnet_group.main.id
}

output "subnet_group_arn" {
  description = "Redis subnet group ARN"
  value       = aws_elasticache_subnet_group.main.arn
}

output "subnet_group_name" {
  description = "Redis subnet group name"
  value       = aws_elasticache_subnet_group.main.name
}

output "parameter_group_id" {
  description = "Redis parameter group ID"
  value       = aws_elasticache_parameter_group.main.id
}

output "parameter_group_arn" {
  description = "Redis parameter group ARN"
  value       = aws_elasticache_parameter_group.main.arn
}

output "parameter_group_name" {
  description = "Redis parameter group name"
  value       = aws_elasticache_parameter_group.main.name
}

output "security_group_id" {
  description = "Redis security group ID"
  value       = aws_security_group.redis.id
}

output "security_group_arn" {
  description = "Redis security group ARN"
  value       = aws_security_group.redis.arn
}

output "security_group_name" {
  description = "Redis security group name"
  value       = aws_security_group.redis.name
}

output "kms_key_id" {
  description = "KMS key ID for Redis encryption"
  value       = aws_kms_key.redis.key_id
}

output "kms_key_arn" {
  description = "KMS key ARN for Redis encryption"
  value       = aws_kms_key.redis.arn
}

output "cloudwatch_log_group_name" {
  description = "CloudWatch log group name for Redis"
  value       = aws_cloudwatch_log_group.redis.name
}

output "cloudwatch_log_group_arn" {
  description = "CloudWatch log group ARN for Redis"
  value       = aws_cloudwatch_log_group.redis.arn
}

output "redis_logs_role_arn" {
  description = "Redis logs role ARN"
  value       = aws_iam_role.redis_logs.arn
}

output "redis_logs_role_name" {
  description = "Redis logs role name"
  value       = aws_iam_role.redis_logs.name
} 