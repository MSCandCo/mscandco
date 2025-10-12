# AWS Database Infrastructure for AudioStems

This directory contains the Terraform configuration for setting up a production-grade PostgreSQL database on AWS RDS for the AudioStems platform.

## Architecture Overview

- **RDS PostgreSQL 15.4** with Multi-AZ support
- **VPC with private/public subnets** across 3 availability zones
- **KMS encryption** for data at rest and in transit
- **CloudWatch monitoring** with performance insights
- **Automated backups** with 7-day retention
- **Security groups** with least-privilege access
- **Parameter groups** optimized for performance and logging

## Features

### Security
- ✅ KMS encryption for data at rest
- ✅ SSL/TLS encryption for data in transit
- ✅ Security groups with least-privilege access
- ✅ Private subnets for database isolation
- ✅ IAM roles for monitoring

### High Availability
- ✅ Multi-AZ deployment (configurable)
- ✅ Automated failover
- ✅ Read replicas support (can be added)
- ✅ Automated backups with point-in-time recovery

### Performance
- ✅ Performance Insights enabled
- ✅ Connection pooling configuration
- ✅ Optimized parameter groups
- ✅ GP3 storage with auto-scaling

### Monitoring
- ✅ CloudWatch metrics and alarms
- ✅ Enhanced monitoring (60-second intervals)
- ✅ Performance Insights dashboard
- ✅ Database connection monitoring

## Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **Terraform installed** (version >= 1.0)
3. **AWS credentials** with RDS, VPC, IAM, and CloudWatch permissions

## Quick Start

### 1. Configure Variables

Copy the example variables file and customize it:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your specific values:

```hcl
project_name = "audiostems"
database_password = "your-secure-password-here"
aws_region = "us-east-1"
```

### 2. Initialize Terraform

```bash
terraform init
```

### 3. Plan the Deployment

```bash
terraform plan
```

### 4. Deploy the Infrastructure

```bash
terraform apply
```

### 5. Get Database Connection Details

```bash
terraform output database_endpoint
terraform output database_name
terraform output database_username
```

## Configuration Options

### Instance Classes

- **Development**: `db.t3.micro` (1 vCPU, 1 GB RAM)
- **Staging**: `db.t3.small` (2 vCPU, 2 GB RAM)
- **Production**: `db.r6g.large` (2 vCPU, 16 GB RAM)

### Storage Options

- **Initial**: 20 GB (configurable)
- **Auto-scaling**: Up to 100 GB (configurable)
- **Storage type**: GP3 (cost-effective, high-performance)

### Backup Configuration

- **Retention**: 7 days (configurable)
- **Backup window**: 03:00-04:00 UTC
- **Maintenance window**: Sunday 04:00-05:00 UTC

## Security Best Practices

### Network Security
- Database is placed in private subnets
- Security groups restrict access to application layer only
- No direct internet access to database

### Encryption
- Data encrypted at rest using KMS
- Data encrypted in transit using SSL/TLS
- KMS key rotation enabled

### Access Control
- IAM roles for monitoring
- Database credentials managed securely
- Connection pooling to prevent connection exhaustion

## Monitoring and Alerts

### CloudWatch Alarms
- **CPU Utilization**: Alerts when > 80% for 2 periods
- **Database Connections**: Alerts when > 80% for 2 periods
- **Free Storage Space**: Alerts when < 20% remaining

### Performance Insights
- **Retention**: 7 days of performance data
- **Metrics**: Query performance, wait events, load analysis

## Cost Optimization

### Instance Sizing
- Start with `db.t3.micro` for development
- Monitor usage and scale up as needed
- Use reserved instances for production workloads

### Storage Optimization
- Use GP3 storage (cheaper than GP2)
- Enable auto-scaling to avoid over-provisioning
- Monitor storage usage and clean up old data

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check security group rules
   - Verify VPC configuration
   - Ensure application is in correct subnet

2. **SSL Connection Issues**
   - Verify SSL configuration in Strapi
   - Check certificate validity
   - Test connection with psql

3. **Performance Issues**
   - Check CloudWatch metrics
   - Review Performance Insights
   - Consider scaling instance class

### Useful Commands

```bash
# Check database status
aws rds describe-db-instances --db-instance-identifier audiostems-database

# View CloudWatch metrics
aws cloudwatch get-metric-statistics --namespace AWS/RDS --metric-name CPUUtilization

# Test database connection
psql -h <endpoint> -U <username> -d <database> -p 5432
```

## Updating Configuration

### Scaling Up
1. Modify `database_instance_class` in terraform.tfvars
2. Run `terraform plan` to see changes
3. Run `terraform apply` to apply changes

### Enabling Multi-AZ
1. Set `multi_az = true` in terraform.tfvars
2. Run `terraform apply`

### Adding Read Replicas
1. Add read replica configuration to main.tf
2. Configure application to use read replicas for read operations

## Cleanup

To destroy the infrastructure:

```bash
terraform destroy
```

⚠️ **Warning**: This will delete all data and backups!

## Next Steps

1. **Set up application deployment** to use the database
2. **Configure monitoring dashboards** in CloudWatch
3. **Set up automated backups** to S3
4. **Implement read replicas** for read-heavy workloads
5. **Configure cross-region replication** for disaster recovery 