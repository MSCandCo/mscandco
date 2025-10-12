variable "domain_name" {
  description = "Domain name for CloudFront distribution"
  type        = string
}

variable "s3_bucket_id" {
  description = "S3 bucket ID"
  type        = string
}

variable "s3_bucket_arn" {
  description = "S3 bucket ARN"
  type        = string
}

variable "s3_bucket_regional_domain_name" {
  description = "S3 bucket regional domain name"
  type        = string
}

variable "alb_id" {
  description = "ALB ID"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS name"
  type        = string
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "default_cache_behavior" {
  description = "Default cache behavior configuration"
  type = object({
    allowed_methods = list(string)
    cached_methods  = list(string)
    target_origin_id = string
    viewer_protocol_policy = string
    min_ttl     = number
    default_ttl = number
    max_ttl     = number
    compress    = bool
    forwarded_values = object({
      query_string = bool
      headers      = list(string)
      cookies = object({
        forward = string
      })
    })
  })
  default = {
    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]
    target_origin_id = "S3-bucket"
    viewer_protocol_policy = "redirect-to-https"
    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
    compress    = true
    forwarded_values = {
      query_string = false
      headers      = []
      cookies = {
        forward = "none"
      }
    }
  }
}

variable "ordered_cache_behavior" {
  description = "Ordered cache behavior configurations"
  type = list(object({
    path_pattern     = string
    allowed_methods  = list(string)
    cached_methods   = list(string)
    target_origin_id = string
    viewer_protocol_policy = string
    min_ttl         = number
    default_ttl     = number
    max_ttl         = number
    compress        = bool
    forwarded_values = object({
      query_string = bool
      headers      = list(string)
      cookies = object({
        forward = string
      })
    })
  }))
  default = []
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