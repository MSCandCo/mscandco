variable "log_group_name" {
  description = "CloudWatch log group name"
  type        = string
}

variable "retention_in_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "metric_filters" {
  description = "CloudWatch metric filters"
  type = list(object({
    name    = string
    pattern = string
    metric_transformation = object({
      name      = string
      namespace = string
      value     = string
    })
  }))
  default = []
}

variable "alarms" {
  description = "CloudWatch alarms"
  type = list(object({
    alarm_name          = string
    comparison_operator = string
    evaluation_periods  = number
    metric_name         = string
    namespace           = string
    period              = number
    statistic           = string
    threshold           = number
    alarm_description   = string
    alarm_actions       = list(string)
    ok_actions          = optional(list(string), [])
    insufficient_data_actions = optional(list(string), [])
    dimensions          = optional(map(string), {})
  }))
  default = []
}

variable "dashboard_name" {
  description = "CloudWatch dashboard name"
  type        = string
  default     = ""
}

variable "dashboard_configuration" {
  description = "CloudWatch dashboard configuration"
  type = object({
    widgets = list(any)
  })
  default = null
}

variable "composite_alarms" {
  description = "CloudWatch composite alarms"
  type = list(object({
    alarm_name = string
    alarm_rule = string
    alarm_actions = optional(list(string), [])
    ok_actions = optional(list(string), [])
    insufficient_data_actions = optional(list(string), [])
    alarm_description = optional(string, "")
  }))
  default = []
}

variable "event_rules" {
  description = "CloudWatch event rules"
  type = list(object({
    name                = string
    description         = optional(string, "")
    schedule_expression = optional(string)
    event_pattern       = optional(string)
    is_enabled          = optional(bool, true)
  }))
  default = []
}

variable "event_targets" {
  description = "CloudWatch event targets"
  type = list(object({
    rule_key = string
    target_id = string
    arn = string
    input_transformer = optional(object({
      input_paths    = map(string)
      input_template = string
    }))
    run_command_targets = optional(list(object({
      key    = string
      values = list(string)
    })), [])
    ecs_target = optional(object({
      task_count = optional(number, 1)
      task_definition_arn = string
      launch_type = optional(string, "FARGATE")
      platform_version = optional(string, "LATEST")
      group = optional(string)
    }))
    lambda_target = optional(string)
    sqs_target = optional(string)
    sns_target = optional(string)
  }))
  default = []
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
} 