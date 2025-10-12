output "distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.main.arn
}

output "distribution_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "distribution_hosted_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  value       = aws_cloudfront_distribution.main.hosted_zone_id
}

output "distribution_status" {
  description = "CloudFront distribution status"
  value       = aws_cloudfront_distribution.main.status
}

output "distribution_enabled" {
  description = "CloudFront distribution enabled"
  value       = aws_cloudfront_distribution.main.enabled
}

output "distribution_is_ipv6_enabled" {
  description = "CloudFront distribution IPv6 enabled"
  value       = aws_cloudfront_distribution.main.is_ipv6_enabled
}

output "distribution_price_class" {
  description = "CloudFront distribution price class"
  value       = aws_cloudfront_distribution.main.price_class
}

output "distribution_aliases" {
  description = "CloudFront distribution aliases"
  value       = aws_cloudfront_distribution.main.aliases
}

output "origin_access_identity_id" {
  description = "CloudFront origin access identity ID"
  value       = aws_cloudfront_origin_access_identity.main.id
}

output "origin_access_identity_iam_arn" {
  description = "CloudFront origin access identity IAM ARN"
  value       = aws_cloudfront_origin_access_identity.main.iam_arn
}

output "origin_access_identity_cloudfront_access_identity_path" {
  description = "CloudFront origin access identity path"
  value       = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
}

output "waf_web_acl_id" {
  description = "WAF Web ACL ID"
  value       = aws_wafv2_web_acl.cloudfront.id
}

output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = aws_wafv2_web_acl.cloudfront.arn
}

output "waf_web_acl_name" {
  description = "WAF Web ACL name"
  value       = aws_wafv2_web_acl.cloudfront.name
}

output "waf_web_acl_description" {
  description = "WAF Web ACL description"
  value       = aws_wafv2_web_acl.cloudfront.description
}

output "waf_web_acl_scope" {
  description = "WAF Web ACL scope"
  value       = aws_wafv2_web_acl.cloudfront.scope
} 