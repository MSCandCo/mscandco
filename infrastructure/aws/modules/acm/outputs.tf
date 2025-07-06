output "certificate_arn" {
  description = "Certificate ARN"
  value       = aws_acm_certificate.main.arn
}

output "certificate_id" {
  description = "Certificate ID"
  value       = aws_acm_certificate.main.id
}

output "certificate_domain_name" {
  description = "Certificate domain name"
  value       = aws_acm_certificate.main.domain_name
}

output "certificate_subject_alternative_names" {
  description = "Certificate subject alternative names"
  value       = aws_acm_certificate.main.subject_alternative_names
}

output "certificate_status" {
  description = "Certificate status"
  value       = aws_acm_certificate.main.status
}

output "certificate_validation_method" {
  description = "Certificate validation method"
  value       = aws_acm_certificate.main.validation_method
}

output "certificate_domain_validation_options" {
  description = "Certificate domain validation options"
  value       = aws_acm_certificate.main.domain_validation_options
}

output "certificate_not_after" {
  description = "Certificate expiration date"
  value       = aws_acm_certificate.main.not_after
}

output "certificate_not_before" {
  description = "Certificate start date"
  value       = aws_acm_certificate.main.not_before
}

output "certificate_validation_arn" {
  description = "Certificate validation ARN"
  value       = var.validation_method == "DNS" ? aws_acm_certificate_validation.main[0].certificate_arn : null
}

output "certificate_validation_fqdns" {
  description = "Certificate validation FQDNs"
  value       = var.validation_method == "DNS" ? aws_acm_certificate_validation.main[0].validation_record_fqdns : []
} 