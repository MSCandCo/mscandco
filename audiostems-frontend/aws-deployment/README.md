# MSC & Co - AWS Production Deployment Guide

This directory contains production-ready AWS infrastructure deployment for the MSC & Co platform.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   Application   │────│     Database    │
│   (CDN/SSL)     │    │   Load Balancer │    │   (RDS MySQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   ECS Fargate   │              │
         │              │   (Containers)  │              │
         │              └─────────────────┘              │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│       S3        │    │   Frontend      │    │    Backend      │
│  (File Storage) │    │   (Next.js)     │    │   (Strapi CMS)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Infrastructure Components

### Core Services
- **ECS Fargate**: Container orchestration for frontend and backend
- **RDS PostgreSQL**: Managed database with automated backups
- **Application Load Balancer**: High-availability load balancing
- **S3**: Object storage for files and static assets
- **CloudFront**: Global CDN for performance
- **ECR**: Container registry for Docker images

### Security & Monitoring
- **VPC**: Isolated network with public/private subnets
- **Security Groups**: Firewall rules for each service
- **IAM Roles**: Least-privilege access control
- **CloudWatch**: Comprehensive monitoring and logging
- **AWS Secrets Manager**: Secure secrets management

### High Availability
- **Multi-AZ Deployment**: Services across multiple availability zones
- **Auto Scaling**: Automatic scaling based on demand
- **Health Checks**: Continuous health monitoring
- **Backup Strategy**: Automated backups with point-in-time recovery

## 📋 Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured with credentials
3. **Terraform** (>= 1.0) installed
4. **Docker** installed and running
5. **Domain name** for the application

## 🎯 Quick Start

### 1. Configure Environment

```bash
# Copy the environment template
cp production.env.template production.env

# Edit with your production values
nano production.env
```

### 2. Deploy Infrastructure

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment (will prompt for confirmation)
./deploy.sh
```

### 3. Configure DNS

After deployment, update your domain's DNS records:

```
A Record: yourdomain.com → [Load Balancer IP]
CNAME: www.yourdomain.com → yourdomain.com
```

## 📁 File Structure

```
aws-deployment/
├── terraform/
│   ├── main.tf          # Main infrastructure configuration
│   ├── database.tf      # RDS PostgreSQL setup
│   ├── ecs.tf          # Container orchestration
│   ├── cloudfront.tf   # CDN configuration
│   └── monitoring.tf   # CloudWatch & alerts
├── deploy.sh           # Automated deployment script
├── production.env.template  # Environment variables template
└── README.md           # This file
```

## 🔧 Detailed Setup Instructions

### Step 1: AWS Prerequisites

1. **Create AWS Account** if you don't have one
2. **Configure AWS CLI**:
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Default region: us-east-1
   # Output format: json
   ```

3. **Verify permissions**:
   ```bash
   aws sts get-caller-identity
   ```

### Step 2: Environment Configuration

1. **Copy environment template**:
   ```bash
   cp production.env.template production.env
   ```

2. **Update required values**:
   - `DATABASE_PASSWORD`: Strong database password
   - `AUTH0_*`: Auth0 production credentials
   - `STRIPE_*`: Stripe production keys
   - `AWS_S3_BUCKET`: Unique S3 bucket name
   - `DOMAIN_NAME`: Your production domain

### Step 3: Infrastructure Deployment

1. **Initialize Terraform state bucket**:
   ```bash
   export CREATE_STATE_BUCKET=true
   ./deploy.sh
   ```

2. **Deploy infrastructure**:
   ```bash
   ./deploy.sh
   ```

3. **Monitor deployment progress**:
   - Check AWS Console for resource creation
   - Monitor CloudWatch logs for any issues

### Step 4: Application Deployment

1. **Build and push Docker images**:
   ```bash
   # Frontend
   docker build -t frontend:latest .
   docker tag frontend:latest [ECR_URL]/frontend:latest
   docker push [ECR_URL]/frontend:latest

   # Backend
   docker build -t backend:latest ../audiostems-backend
   docker tag backend:latest [ECR_URL]/backend:latest
   docker push [ECR_URL]/backend:latest
   ```

2. **Deploy ECS services**:
   ```bash
   # Services will auto-deploy from ECR images
   # Monitor in ECS Console
   ```

### Step 5: Post-Deployment Configuration

1. **Configure SSL Certificate**:
   - Request ACM certificate for your domain
   - Update CloudFront distribution

2. **Setup Database**:
   ```bash
   # Run database migrations
   npm run migrate:production
   
   # Seed initial data
   npm run seed:production
   ```

3. **Configure Monitoring**:
   - Set up CloudWatch dashboards
   - Configure SNS alerts
   - Test health checks

## 🔒 Security Considerations

### Network Security
- All resources in private subnets except load balancer
- Security groups with minimal required access
- Database accessible only from application subnets

### Data Security
- RDS encryption at rest and in transit
- S3 bucket encryption and versioning
- Secrets stored in AWS Secrets Manager

### Access Control
- IAM roles with least-privilege access
- No hardcoded credentials in code
- Regular security audits and updates

## 📊 Monitoring & Maintenance

### Health Monitoring
- Application health checks every 30 seconds
- Database performance insights enabled
- Container-level monitoring with CloudWatch

### Backup Strategy
- RDS automated backups (30 day retention)
- S3 versioning and lifecycle policies
- Cross-region backup replication

### Scaling Configuration
- Auto Scaling Groups for ECS tasks
- RDS storage auto-scaling enabled
- CloudFront edge caching

## 💰 Cost Optimization

### Resource Optimization
- Right-sized instance types
- Spot instances for non-critical workloads
- S3 intelligent tiering
- CloudFront caching optimization

### Cost Monitoring
- AWS Cost Explorer dashboards
- Budget alerts and notifications
- Regular cost reviews and optimization

## 🔧 Troubleshooting

### Common Issues

1. **Deployment Fails**:
   ```bash
   # Check Terraform logs
   terraform plan -detailed-exitcode
   
   # Verify AWS permissions
   aws iam get-user
   ```

2. **Database Connection Issues**:
   ```bash
   # Test database connectivity
   telnet [RDS_ENDPOINT] 5432
   
   # Check security groups
   aws ec2 describe-security-groups
   ```

3. **Container Startup Issues**:
   ```bash
   # Check ECS logs
   aws logs get-log-events --log-group-name /aws/ecs/msc-co
   
   # Verify ECR images
   aws ecr describe-images --repository-name msc-co-frontend
   ```

### Support Resources
- AWS Support (if applicable)
- Terraform Documentation
- Docker Documentation
- Project Issue Tracker

## 📞 Emergency Procedures

### Rollback Process
1. Keep previous Docker image tags
2. Update ECS service to previous image
3. Monitor application health
4. Restore database from backup if needed

### Disaster Recovery
1. RDS automated failover (Multi-AZ)
2. ECS service replacement in different AZ
3. S3 cross-region replication
4. DNS failover configuration

## 🎯 Next Steps After Deployment

1. **Domain Configuration**: Point your domain to the load balancer
2. **SSL Certificate**: Configure HTTPS with ACM
3. **Monitoring Setup**: Create CloudWatch dashboards
4. **Backup Testing**: Verify backup and restore procedures
5. **Performance Testing**: Load test the application
6. **Security Audit**: Run security scans and audits

---

## 📝 Production Checklist

- [ ] Environment variables configured
- [ ] AWS credentials and permissions verified
- [ ] Domain name purchased and configured
- [ ] SSL certificate requested
- [ ] Database password set securely
- [ ] Auth0 production tenant configured
- [ ] Stripe production account setup
- [ ] Monitoring and alerting configured
- [ ] Backup strategy implemented
- [ ] Security review completed
- [ ] Performance testing completed
- [ ] Documentation updated

---

**🎉 Congratulations! Your MSC & Co platform is now running on production-grade AWS infrastructure!**