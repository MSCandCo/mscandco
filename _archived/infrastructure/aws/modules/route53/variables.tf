variable "domain_name" {
  description = "Domain name for Route53 hosted zone"
  type        = string
}

variable "records" {
  description = "Route53 records configuration"
  type = list(object({
    name = string
    type = string
    ttl  = optional(number, 300)
    records = optional(list(string), [])
    alias = optional(object({
      name                   = string
      zone_id                = string
      evaluate_target_health = optional(bool, true)
    }))
    failover_routing_policy = optional(object({
      type = string
    }))
    geolocation_routing_policy = optional(object({
      continent   = optional(string)
      country     = optional(string)
      subdivision = optional(string)
    }))
    latency_routing_policy = optional(object({
      region = string
    }))
    weighted_routing_policy = optional(object({
      weight = number
    }))
    multivalue_answer_routing_policy = optional(object({
      multivalue_answer_routing_policy = bool
    }))
    set_identifier = optional(string)
    health_check_id = optional(string)
  }))
  default = []
}

variable "health_checks" {
  description = "Route53 health checks configuration"
  type = list(object({
    fqdn              = optional(string)
    port              = optional(number)
    type              = string
    request_interval  = optional(number, 30)
    failure_threshold = optional(number, 3)
    ip_address        = optional(string)
    resource_path     = optional(string)
    child_healthchecks = optional(list(string), [])
    child_health_threshold = optional(number)
    cloudwatch_alarm_name = optional(string)
    cloudwatch_alarm_region = optional(string)
    insufficient_data_health_status = optional(string)
    inverted_health_check = optional(bool)
    measure_latency = optional(bool)
    regions = optional(list(string), [])
    search_string = optional(string)
  }))
  default = []
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
} 