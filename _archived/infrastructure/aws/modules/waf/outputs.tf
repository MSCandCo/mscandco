output "web_acl_id" {
  description = "WAF Web ACL ID"
  value       = aws_wafv2_web_acl.main.id
}

output "web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = aws_wafv2_web_acl.main.arn
}

output "web_acl_name" {
  description = "WAF Web ACL name"
  value       = aws_wafv2_web_acl.main.name
}

output "web_acl_description" {
  description = "WAF Web ACL description"
  value       = aws_wafv2_web_acl.main.description
}

output "web_acl_scope" {
  description = "WAF Web ACL scope"
  value       = aws_wafv2_web_acl.main.scope
}

output "web_acl_capacity" {
  description = "WAF Web ACL capacity"
  value       = aws_wafv2_web_acl.main.capacity
}

output "web_acl_visibility_config" {
  description = "WAF Web ACL visibility config"
  value       = aws_wafv2_web_acl.main.visibility_config
}

output "web_acl_rules" {
  description = "WAF Web ACL rules"
  value       = aws_wafv2_web_acl.main.rules
} 