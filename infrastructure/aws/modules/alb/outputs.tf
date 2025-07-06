output "alb_id" {
  description = "ALB ID"
  value       = aws_lb.main.id
}

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "alb_name" {
  description = "ALB name"
  value       = aws_lb.main.name
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALB zone ID"
  value       = aws_lb.main.zone_id
}

output "alb_canonical_hosted_zone_id" {
  description = "ALB canonical hosted zone ID"
  value       = aws_lb.main.canonical_hosted_zone_id
}

output "alb_arn_suffix" {
  description = "ALB ARN suffix"
  value       = aws_lb.main.arn_suffix
}

output "alb_internal" {
  description = "ALB internal"
  value       = aws_lb.main.internal
}

output "alb_load_balancer_type" {
  description = "ALB load balancer type"
  value       = aws_lb.main.load_balancer_type
}

output "alb_security_groups" {
  description = "ALB security groups"
  value       = aws_lb.main.security_groups
}

output "alb_subnets" {
  description = "ALB subnets"
  value       = aws_lb.main.subnets
}

output "alb_enable_deletion_protection" {
  description = "ALB enable deletion protection"
  value       = aws_lb.main.enable_deletion_protection
}

output "security_group_id" {
  description = "ALB security group ID"
  value       = aws_security_group.alb.id
}

output "security_group_arn" {
  description = "ALB security group ARN"
  value       = aws_security_group.alb.arn
}

output "security_group_name" {
  description = "ALB security group name"
  value       = aws_security_group.alb.name
}

output "target_group_main_arn" {
  description = "Main target group ARN"
  value       = aws_lb_target_group.main.arn
}

output "target_group_main_id" {
  description = "Main target group ID"
  value       = aws_lb_target_group.main.id
}

output "target_group_main_name" {
  description = "Main target group name"
  value       = aws_lb_target_group.main.name
}

output "target_group_api_arn" {
  description = "API target group ARN"
  value       = aws_lb_target_group.api.arn
}

output "target_group_api_id" {
  description = "API target group ID"
  value       = aws_lb_target_group.api.id
}

output "target_group_api_name" {
  description = "API target group name"
  value       = aws_lb_target_group.api.name
}

output "listener_http_arn" {
  description = "HTTP listener ARN"
  value       = aws_lb_listener.http.arn
}

output "listener_http_id" {
  description = "HTTP listener ID"
  value       = aws_lb_listener.http.id
}

output "listener_https_arn" {
  description = "HTTPS listener ARN"
  value       = aws_lb_listener.https.arn
}

output "listener_https_id" {
  description = "HTTPS listener ID"
  value       = aws_lb_listener.https.id
}

output "waf_web_acl_id" {
  description = "WAF Web ACL ID"
  value       = aws_wafv2_web_acl.alb.id
}

output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = aws_wafv2_web_acl.alb.arn
}

output "waf_web_acl_name" {
  description = "WAF Web ACL name"
  value       = aws_wafv2_web_acl.alb.name
}

output "waf_web_acl_description" {
  description = "WAF Web ACL description"
  value       = aws_wafv2_web_acl.alb.description
}

output "waf_web_acl_scope" {
  description = "WAF Web ACL scope"
  value       = aws_wafv2_web_acl.alb.scope
} 