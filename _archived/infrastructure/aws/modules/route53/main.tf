# Route53 Hosted Zone
resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = var.tags
}

# Route53 Records
resource "aws_route53_record" "records" {
  for_each = { for idx, record in var.records : idx => record }

  zone_id = aws_route53_zone.main.zone_id
  name    = each.value.name == "" ? var.domain_name : "${each.value.name}.${var.domain_name}"
  type    = each.value.type
  ttl     = lookup(each.value, "ttl", 300)

  dynamic "alias" {
    for_each = each.value.alias ? [each.value.alias] : []
    content {
      name                   = alias.value.name
      zone_id                = alias.value.zone_id
      evaluate_target_health = lookup(alias.value, "evaluate_target_health", true)
    }
  }

  dynamic "records" {
    for_each = each.value.alias ? [] : [each.value.records]
    content {
      records = records.value
    }
  }

  dynamic "failover_routing_policy" {
    for_each = each.value.failover_routing_policy ? [each.value.failover_routing_policy] : []
    content {
      type = failover_routing_policy.value.type
    }
  }

  dynamic "geolocation_routing_policy" {
    for_each = each.value.geolocation_routing_policy ? [each.value.geolocation_routing_policy] : []
    content {
      continent   = lookup(geolocation_routing_policy.value, "continent", null)
      country     = lookup(geolocation_routing_policy.value, "country", null)
      subdivision = lookup(geolocation_routing_policy.value, "subdivision", null)
    }
  }

  dynamic "latency_routing_policy" {
    for_each = each.value.latency_routing_policy ? [each.value.latency_routing_policy] : []
    content {
      region = latency_routing_policy.value.region
    }
  }

  dynamic "weighted_routing_policy" {
    for_each = each.value.weighted_routing_policy ? [each.value.weighted_routing_policy] : []
    content {
      weight = weighted_routing_policy.value.weight
    }
  }

  dynamic "multivalue_answer_routing_policy" {
    for_each = each.value.multivalue_answer_routing_policy ? [each.value.multivalue_answer_routing_policy] : []
    content {
      multivalue_answer_routing_policy = multivalue_answer_routing_policy.value
    }
  }

  set_identifier = lookup(each.value, "set_identifier", null)

  health_check_id = lookup(each.value, "health_check_id", null)

  tags = var.tags
}

# Health Checks
resource "aws_route53_health_check" "main" {
  for_each = { for idx, health_check in var.health_checks : idx => health_check }

  fqdn              = lookup(each.value, "fqdn", null)
  port              = lookup(each.value, "port", null)
  type              = each.value.type
  request_interval  = lookup(each.value, "request_interval", 30)
  failure_threshold = lookup(each.value, "failure_threshold", 3)
  ip_address        = lookup(each.value, "ip_address", null)
  resource_path     = lookup(each.value, "resource_path", null)

  dynamic "child_healthchecks" {
    for_each = lookup(each.value, "child_healthchecks", [])
    content {
      child_healthchecks = child_healthchecks.value
    }
  }

  dynamic "child_health_threshold" {
    for_each = lookup(each.value, "child_health_threshold", [])
    content {
      child_health_threshold = child_health_threshold.value
    }
  }

  dynamic "cloudwatch_alarm_name" {
    for_each = lookup(each.value, "cloudwatch_alarm_name", [])
    content {
      cloudwatch_alarm_name = cloudwatch_alarm_name.value
    }
  }

  dynamic "cloudwatch_alarm_region" {
    for_each = lookup(each.value, "cloudwatch_alarm_region", [])
    content {
      cloudwatch_alarm_region = cloudwatch_alarm_region.value
    }
  }

  dynamic "insufficient_data_health_status" {
    for_each = lookup(each.value, "insufficient_data_health_status", [])
    content {
      insufficient_data_health_status = insufficient_data_health_status.value
    }
  }

  dynamic "inverted_health_check" {
    for_each = lookup(each.value, "inverted_health_check", [])
    content {
      inverted_health_check = inverted_health_check.value
    }
  }

  dynamic "measure_latency" {
    for_each = lookup(each.value, "measure_latency", [])
    content {
      measure_latency = measure_latency.value
    }
  }

  dynamic "regions" {
    for_each = lookup(each.value, "regions", [])
    content {
      regions = regions.value
    }
  }

  dynamic "search_string" {
    for_each = lookup(each.value, "search_string", [])
    content {
      search_string = search_string.value
    }
  }

  tags = var.tags
} 