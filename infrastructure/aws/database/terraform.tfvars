# AWS Configuration
project_name = "audiostems"
environment  = "production"
aws_region  = "us-east-1"

# Only keep variables that are declared in variables.tf
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

# Database Configuration
database_instance_class = "db.r6g.large"
database_name          = "audiostems"
database_username      = "audiostems_admin"
database_password      = "Audiostems2024!SecureDB"

# Backup and Maintenance
backup_retention_period = 7
deletion_protection     = true
multi_az               = true

# CloudWatch Alarm Actions (optional)
alarm_actions = []

tags = {
  Project     = "audiostems"
  Environment = "production"
  ManagedBy   = "terraform"
} 