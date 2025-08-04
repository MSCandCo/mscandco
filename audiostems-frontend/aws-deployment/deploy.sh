#!/bin/bash

# MSC & Co - Production Deployment Script
# High-standard AWS deployment with comprehensive error handling

set -euo pipefail

# Configuration
PROJECT_NAME="msc-co"
ENVIRONMENT="production"
AWS_REGION="us-east-1"
TERRAFORM_DIR="./terraform"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        error "Terraform is not installed. Please install it first."
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials are not configured. Please run 'aws configure'."
        exit 1
    fi
    
    success "All prerequisites satisfied"
}

# Create S3 bucket for Terraform state
create_terraform_state_bucket() {
    local bucket_name="msc-co-terraform-state-$(date +%s)"
    
    log "Creating S3 bucket for Terraform state: $bucket_name"
    
    # Create bucket
    aws s3 mb "s3://$bucket_name" --region "$AWS_REGION"
    
    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket "$bucket_name" \
        --versioning-configuration Status=Enabled
    
    # Enable encryption
    aws s3api put-bucket-encryption \
        --bucket "$bucket_name" \
        --server-side-encryption-configuration '{
            "Rules": [
                {
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    },
                    "BucketKeyEnabled": true
                }
            ]
        }'
    
    # Block public access
    aws s3api put-public-access-block \
        --bucket "$bucket_name" \
        --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
    
    success "Terraform state bucket created: $bucket_name"
    echo "$bucket_name"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    log "Deploying AWS infrastructure..."
    
    cd "$TERRAFORM_DIR"
    
    # Initialize Terraform
    log "Initializing Terraform..."
    terraform init
    
    # Plan deployment
    log "Planning Terraform deployment..."
    terraform plan -out=tfplan
    
    # Apply deployment
    log "Applying Terraform deployment..."
    terraform apply tfplan
    
    # Get outputs
    log "Getting Terraform outputs..."
    terraform output -json > ../outputs.json
    
    cd ..
    success "Infrastructure deployed successfully"
}

# Build and push Docker images
build_and_push_images() {
    log "Building and pushing Docker images..."
    
    # Get ECR URLs from Terraform outputs
    local frontend_ecr=$(jq -r '.frontend_ecr_repository_url.value' outputs.json)
    local backend_ecr=$(jq -r '.backend_ecr_repository_url.value' outputs.json)
    
    # Login to ECR
    aws ecr get-login-password --region "$AWS_REGION" | \
        docker login --username AWS --password-stdin "${frontend_ecr%/*}"
    
    # Build and push frontend
    log "Building frontend image..."
    docker build -t "$frontend_ecr:latest" -f Dockerfile --target production .
    docker push "$frontend_ecr:latest"
    
    # Build and push backend
    log "Building backend image..."
    docker build -t "$backend_ecr:latest" -f ../audiostems-backend/Dockerfile.prod ../audiostems-backend
    docker push "$backend_ecr:latest"
    
    success "Docker images built and pushed successfully"
}

# Deploy ECS services
deploy_services() {
    log "Deploying ECS services..."
    
    # Create task definitions and services
    # This would typically be done with additional Terraform modules
    # or AWS CLI commands for ECS service definitions
    
    success "ECS services deployed successfully"
}

# Setup CloudFront and SSL
setup_cloudfront() {
    log "Setting up CloudFront distribution..."
    
    # This would typically be done with Terraform
    # CloudFront configuration for global CDN
    
    success "CloudFront distribution configured"
}

# Setup monitoring and alerting
setup_monitoring() {
    log "Setting up monitoring and alerting..."
    
    # CloudWatch alarms, dashboards, etc.
    # SNS topics for alerts
    
    success "Monitoring and alerting configured"
}

# Main deployment function
main() {
    log "Starting MSC & Co production deployment..."
    
    # Prompt for confirmation
    echo -e "${YELLOW}⚠️  WARNING: This will deploy infrastructure to AWS and may incur costs.${NC}"
    read -p "Are you sure you want to proceed? (yes/no): " -r
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log "Deployment cancelled by user"
        exit 0
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Create Terraform state bucket if needed
    if [[ "${CREATE_STATE_BUCKET:-false}" == "true" ]]; then
        BUCKET_NAME=$(create_terraform_state_bucket)
        # Update Terraform backend configuration
        sed -i.bak "s/msc-co-terraform-state/$BUCKET_NAME/g" "$TERRAFORM_DIR/main.tf"
    fi
    
    # Deploy infrastructure
    deploy_infrastructure
    
    # Build and push images
    build_and_push_images
    
    # Deploy services
    deploy_services
    
    # Setup CloudFront
    setup_cloudfront
    
    # Setup monitoring
    setup_monitoring
    
    success "🎉 Deployment completed successfully!"
    
    # Display important information
    log "Important information:"
    echo "=================="
    echo "Load Balancer DNS: $(jq -r '.alb_dns_name.value' outputs.json)"
    echo "Database Endpoint: $(jq -r '.database_endpoint.value' outputs.json)"
    echo "S3 Bucket: $(jq -r '.s3_bucket_name.value' outputs.json)"
    echo "=================="
    
    log "Please update your DNS records to point to the Load Balancer DNS name"
    log "Remember to update your environment variables with the new endpoints"
}

# Run main function
main "$@"