# AWS Configuration
project_name = "audiostems"
environment  = "production"
aws_region  = "us-east-1"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
private_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnet_cidrs  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

# Database Configuration
database_instance_class = "db.t3.micro"
allocated_storage      = 20
max_allocated_storage  = 100
database_name          = "audiostems"
database_username      = "audiostems_admin"
database_password      = "AudioStems2024!SecureDB"

# Backup and Maintenance
backup_retention_period = 7
deletion_protection     = true
multi_az               = false

# Monitoring
alarm_actions = [
  # "arn:aws:sns:us-east-1:123456789012:your-sns-topic"
]

# Tags
tags = {
  Project     = "audiostems"
  Environment = "production"
  ManagedBy   = "terraform"
  Owner       = "your-team"
} 