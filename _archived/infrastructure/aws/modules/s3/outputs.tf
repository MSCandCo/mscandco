output "bucket_id" {
  description = "S3 bucket ID"
  value       = aws_s3_bucket.main.id
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.main.arn
}

output "bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.main.bucket
}

output "bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.main.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "S3 bucket regional domain name"
  value       = aws_s3_bucket.main.bucket_regional_domain_name
}

output "bucket_region" {
  description = "S3 bucket region"
  value       = aws_s3_bucket.main.region
}

output "kms_key_id" {
  description = "KMS key ID for S3 encryption"
  value       = aws_kms_key.s3.key_id
}

output "kms_key_arn" {
  description = "KMS key ARN for S3 encryption"
  value       = aws_kms_key.s3.arn
}

output "audio_uploads_access_point_arn" {
  description = "Audio uploads access point ARN"
  value       = aws_s3_access_point.audio_uploads.arn
}

output "audio_uploads_access_point_id" {
  description = "Audio uploads access point ID"
  value       = aws_s3_access_point.audio_uploads.id
}

output "processed_audio_access_point_arn" {
  description = "Processed audio access point ARN"
  value       = aws_s3_access_point.processed_audio.arn
}

output "processed_audio_access_point_id" {
  description = "Processed audio access point ID"
  value       = aws_s3_access_point.processed_audio.id
}

output "public_assets_access_point_arn" {
  description = "Public assets access point ARN"
  value       = aws_s3_access_point.public_assets.arn
}

output "public_assets_access_point_id" {
  description = "Public assets access point ID"
  value       = aws_s3_access_point.public_assets.id
}

output "audio_processing_object_lambda_arn" {
  description = "Audio processing object lambda ARN"
  value       = aws_s3control_object_lambda_access_point.audio_processing.arn
}

output "audio_processing_object_lambda_id" {
  description = "Audio processing object lambda ID"
  value       = aws_s3control_object_lambda_access_point.audio_processing.id
} 