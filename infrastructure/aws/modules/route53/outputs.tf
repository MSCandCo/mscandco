output "zone_id" {
  description = "Route53 hosted zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "zone_arn" {
  description = "Route53 hosted zone ARN"
  value       = aws_route53_zone.main.arn
}

output "zone_name" {
  description = "Route53 hosted zone name"
  value       = aws_route53_zone.main.name
}

output "zone_name_servers" {
  description = "Route53 hosted zone name servers"
  value       = aws_route53_zone.main.name_servers
}

output "zone_primary_name_server" {
  description = "Route53 hosted zone primary name server"
  value       = aws_route53_zone.main.primary_name_server
}

output "records" {
  description = "Route53 records"
  value = {
    for k, v in aws_route53_record.records : k => {
      id   = v.id
      name = v.name
      type = v.type
      ttl  = v.ttl
      records = v.records
      alias = v.alias
      set_identifier = v.set_identifier
      health_check_id = v.health_check_id
    }
  }
}

output "health_checks" {
  description = "Route53 health checks"
  value = {
    for k, v in aws_route53_health_check.main : k => {
      id                = v.id
      arn               = v.arn
      fqdn              = v.fqdn
      port              = v.port
      type              = v.type
      request_interval  = v.request_interval
      failure_threshold = v.failure_threshold
      ip_address        = v.ip_address
      resource_path     = v.resource_path
      child_healthchecks = v.child_healthchecks
      child_health_threshold = v.child_health_threshold
      cloudwatch_alarm_name = v.cloudwatch_alarm_name
      cloudwatch_alarm_region = v.cloudwatch_alarm_region
      insufficient_data_health_status = v.insufficient_data_health_status
      inverted_health_check = v.inverted_health_check
      measure_latency = v.measure_latency
      regions = v.regions
      search_string = v.search_string
    }
  }
} 