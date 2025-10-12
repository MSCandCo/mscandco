# AudioStems Enterprise Infrastructure

This directory contains the Infrastructure-as-Code (IaC) for the AudioStems platform, designed for global scale, high availability, and security.

## Architecture Overview

- **Multi-region AWS deployment** (EKS, Aurora PostgreSQL, Redis, S3, CloudFront)
- **Auto-scaling, self-healing microservices** (Kubernetes/EKS)
- **Aurora PostgreSQL** (Multi-AZ, global clusters, read replicas)
- **Elasticache Redis** (clustered, multi-AZ)
- **S3** (cross-region replication, versioning, encryption)
- **CloudFront CDN** (signed URLs, geo-restriction, WAF)
- **Route53** (latency-based routing, health checks)
- **IAM, Secrets Manager** (least-privilege, audit logging)
- **CloudWatch, X-Ray, Datadog** (monitoring, tracing, alerting)
- **GuardDuty, Inspector, Security Hub** (threat detection, compliance)

## Directory Structure

- `main.tf` — Root Terraform configuration
- `modules/` — Reusable modules (vpc, eks, rds, redis, s3, cloudfront, etc.)
- `environments/` — Per-environment configs (dev, staging, prod)

## Getting Started

1. **Install Terraform**
2. **Configure AWS credentials** (use IAM user with least-privilege)
3. **Edit variables in `environments/` for your regions and settings**
4. **Run `terraform init && terraform apply`**

## Security & Compliance
- All secrets in AWS Secrets Manager
- Private subnets for all sensitive resources
- WAF, Shield, GuardDuty enabled
- Audit logging and monitoring by default

## Next Steps
- See each module README for details
- See `../docs/` for architecture diagrams and compliance docs 