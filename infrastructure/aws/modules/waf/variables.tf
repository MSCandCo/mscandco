variable "name" {
  description = "Name of the WAF Web ACL"
  type        = string
}

variable "scope" {
  description = "Scope of the WAF Web ACL"
  type        = string
  default     = "REGIONAL"
  
  validation {
    condition     = contains(["REGIONAL", "CLOUDFRONT"], var.scope)
    error_message = "Scope must be either REGIONAL or CLOUDFRONT."
  }
}

variable "rate_limit" {
  description = "Rate limit for WAF rules"
  type        = number
  default     = 2000
}

variable "alarm_actions" {
  description = "CloudWatch alarm actions"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
} 