variable "bucket_name" {
  description = "S3 bucket name"
  type        = string
}

variable "versioning_enabled" {
  description = "Enable bucket versioning"
  type        = bool
  default     = true
}

variable "lifecycle_rules" {
  description = "S3 bucket lifecycle rules"
  type = list(object({
    id      = string
    enabled = bool
    transition = list(object({
      days          = number
      storage_class = string
    }))
    expiration = list(object({
      days = number
    }))
    noncurrent_version_transition = list(object({
      noncurrent_days = number
      storage_class   = string
    }))
    noncurrent_version_expiration = list(object({
      noncurrent_days = number
    }))
  }))
  default = []
}

variable "cors_configuration" {
  description = "S3 bucket CORS configuration"
  type = list(object({
    allowed_headers = list(string)
    allowed_methods = list(string)
    allowed_origins = list(string)
    expose_headers  = list(string)
    max_age_seconds = number
  }))
  default = []
}

variable "alarm_actions" {
  description = "CloudWatch alarm actions"
  type        = list(string)
  default     = []
}

variable "audio_processing_lambda_arn" {
  description = "Lambda function ARN for audio processing"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
} 