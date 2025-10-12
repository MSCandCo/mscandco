# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "main" {
  name              = var.log_group_name
  retention_in_days = var.retention_in_days

  tags = var.tags
}

# CloudWatch Metric Filters
resource "aws_cloudwatch_log_metric_filter" "main" {
  for_each = { for idx, filter in var.metric_filters : idx => filter }

  name           = each.value.name
  pattern        = each.value.pattern
  log_group_name = aws_cloudwatch_log_group.main.name

  metric_transformation {
    name      = each.value.metric_transformation.name
    namespace = each.value.metric_transformation.namespace
    value     = each.value.metric_transformation.value
  }
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "main" {
  for_each = { for idx, alarm in var.alarms : idx => alarm }

  alarm_name          = each.value.alarm_name
  comparison_operator = each.value.comparison_operator
  evaluation_periods  = each.value.evaluation_periods
  metric_name         = each.value.metric_name
  namespace           = each.value.namespace
  period              = each.value.period
  statistic           = each.value.statistic
  threshold           = each.value.threshold
  alarm_description   = each.value.alarm_description
  alarm_actions       = each.value.alarm_actions
  ok_actions          = lookup(each.value, "ok_actions", [])
  insufficient_data_actions = lookup(each.value, "insufficient_data_actions", [])

  dynamic "dimensions" {
    for_each = lookup(each.value, "dimensions", {})
    content {
      name  = dimensions.key
      value = dimensions.value
    }
  }

  tags = var.tags
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  count = var.dashboard_configuration != null ? 1 : 0

  dashboard_name = var.dashboard_name
  dashboard_body = jsonencode({
    widgets = var.dashboard_configuration.widgets
  })
}

# CloudWatch Composite Alarm
resource "aws_cloudwatch_composite_alarm" "main" {
  for_each = { for idx, composite_alarm in var.composite_alarms : idx => composite_alarm }

  alarm_name = each.value.alarm_name
  alarm_rule = each.value.alarm_rule

  alarm_actions = lookup(each.value, "alarm_actions", [])
  ok_actions    = lookup(each.value, "ok_actions", [])
  insufficient_data_actions = lookup(each.value, "insufficient_data_actions", [])

  alarm_description = lookup(each.value, "alarm_description", "")

  tags = var.tags
}

# CloudWatch Event Rule
resource "aws_cloudwatch_event_rule" "main" {
  for_each = { for idx, event_rule in var.event_rules : idx => event_rule }

  name                = each.value.name
  description         = lookup(each.value, "description", "")
  schedule_expression = lookup(each.value, "schedule_expression", null)
  event_pattern       = lookup(each.value, "event_pattern", null)
  is_enabled          = lookup(each.value, "is_enabled", true)

  tags = var.tags
}

# CloudWatch Event Target
resource "aws_cloudwatch_event_target" "main" {
  for_each = { for idx, event_target in var.event_targets : idx => event_target }

  rule      = aws_cloudwatch_event_rule.main[each.value.rule_key].name
  target_id = each.value.target_id
  arn       = each.value.arn

  dynamic "input_transformer" {
    for_each = lookup(each.value, "input_transformer", null) != null ? [each.value.input_transformer] : []
    content {
      input_paths    = input_transformer.value.input_paths
      input_template = input_transformer.value.input_template
    }
  }

  dynamic "run_command_targets" {
    for_each = lookup(each.value, "run_command_targets", [])
    content {
      key    = run_command_targets.value.key
      values = run_command_targets.value.values
    }
  }

  dynamic "ecs_target" {
    for_each = lookup(each.value, "ecs_target", null) != null ? [each.value.ecs_target] : []
    content {
      task_count         = lookup(ecs_target.value, "task_count", 1)
      task_definition_arn = ecs_target.value.task_definition_arn
      launch_type        = lookup(ecs_target.value, "launch_type", "FARGATE")
      platform_version   = lookup(ecs_target.value, "platform_version", "LATEST")
      group              = lookup(ecs_target.value, "group", null)
    }
  }

  dynamic "lambda_target" {
    for_each = lookup(each.value, "lambda_target", null) != null ? [each.value.lambda_target] : []
    content {
      lambda_target = lambda_target.value
    }
  }

  dynamic "sqs_target" {
    for_each = lookup(each.value, "sqs_target", null) != null ? [each.value.sqs_target] : []
    content {
      sqs_target = sqs_target.value
    }
  }

  dynamic "sns_target" {
    for_each = lookup(each.value, "sns_target", null) != null ? [each.value.sns_target] : []
    content {
      sns_target = sns_target.value
    }
  }
} 