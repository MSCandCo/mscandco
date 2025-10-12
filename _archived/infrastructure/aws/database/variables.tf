variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "audiostems"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "database_instance_class" {
  description = "The instance class for the database"
  type        = string
  default     = "db.t3.micro"
}

variable "database_name" {
  description = "The name of the database"
  type        = string
  default     = "audiostems"
}

variable "database_username" {
  description = "The master username for the database"
  type        = string
  default     = "audiostems_admin"
}

variable "database_password" {
  description = "The master password for the database"
  type        = string
  default     = "Audiostems2024!SecureDB"
  sensitive   = true
}

variable "backup_retention_period" {
  description = "The number of days to retain backups"
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "If the DB instance should have deletion protection enabled"
  type        = bool
  default     = true
}

variable "multi_az" {
  description = "Specifies if the RDS instance is multi-AZ"
  type        = bool
  default     = true
}

variable "alarm_actions" {
  description = "List of ARNs to notify when alarms are triggered"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "A mapping of tags to assign to the resource"
  type        = map(string)
  default = {
    Project     = "audiostems"
    Environment = "production"
    ManagedBy   = "terraform"
  }
} 