#!/bin/bash

# AudioStems AWS Database Deployment Script (Simplified)
# This script uses existing VPC and minimal resources

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="audiostems"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TF_DIR="$SCRIPT_DIR"

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
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Terraform is installed
    if ! command -v terraform &> /dev/null; then
        error "Terraform is not installed. Please install it first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Check if terraform.tfvars exists
    if [ ! -f "$TF_DIR/terraform.tfvars" ]; then
        warning "terraform.tfvars not found. Creating from example..."
        if [ -f "$TF_DIR/terraform.tfvars.example" ]; then
            cp "$TF_DIR/terraform.tfvars.example" "$TF_DIR/terraform.tfvars"
            warning "Please edit terraform.tfvars with your specific values before continuing."
            exit 1
        else
            error "terraform.tfvars.example not found. Please create terraform.tfvars manually."
            exit 1
        fi
    fi
    
    success "Prerequisites check passed"
}

# Initialize Terraform
init_terraform() {
    log "Initializing Terraform..."
    cd "$TF_DIR"
    
    if terraform init; then
        success "Terraform initialized successfully"
    else
        error "Failed to initialize Terraform"
        exit 1
    fi
}

# Plan Terraform deployment
plan_deployment() {
    log "Planning Terraform deployment..."
    cd "$TF_DIR"
    
    if terraform plan -var-file=terraform.tfvars -out=tfplan; then
        success "Terraform plan created successfully"
    else
        error "Failed to create Terraform plan"
        exit 1
    fi
}

# Apply Terraform deployment
apply_deployment() {
    log "Applying Terraform deployment..."
    cd "$TF_DIR"
    
    if terraform apply tfplan; then
        success "Terraform deployment applied successfully"
    else
        error "Failed to apply Terraform deployment"
        exit 1
    fi
}

# Get database connection details
get_connection_details() {
    log "Getting database connection details..."
    cd "$TF_DIR"
    
    echo ""
    echo "=== Database Connection Details ==="
    echo "Endpoint: $(terraform output -raw database_endpoint)"
    echo "Port: $(terraform output -raw database_port)"
    echo "Database: $(terraform output -raw database_name)"
    echo "Username: $(terraform output -raw database_username)"
    echo ""
    echo "=== Next Steps ==="
    echo "1. Update your Strapi .env file with these connection details"
    echo "2. Test the database connection"
    echo "3. Run Strapi database migrations"
    echo ""
}

# Test database connection
test_connection() {
    log "Testing database connection..."
    
    ENDPOINT=$(cd "$TF_DIR" && terraform output -raw database_endpoint)
    DATABASE=$(cd "$TF_DIR" && terraform output -raw database_name)
    USERNAME=$(cd "$TF_DIR" && terraform output -raw database_username)
    
    # Check if psql is available
    if command -v psql &> /dev/null; then
        warning "To test the database connection, run:"
        echo "psql -h $ENDPOINT -U $USERNAME -d $DATABASE -p 5432"
    else
        warning "psql not found. Install PostgreSQL client to test connection."
    fi
}

# Main deployment function
deploy() {
    log "Starting AudioStems database deployment (simplified)..."
    
    check_prerequisites
    init_terraform
    plan_deployment
    
    echo ""
    warning "About to deploy the following resources:"
    echo "- RDS PostgreSQL instance (using existing VPC)"
    echo "- Security group for database access"
    echo "- Database subnet group"
    echo ""
    
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Deployment cancelled"
        exit 0
    fi
    
    apply_deployment
    get_connection_details
    test_connection
    
    success "Database deployment completed successfully!"
}

# Destroy function
destroy() {
    log "Starting database destruction..."
    cd "$TF_DIR"
    
    warning "This will destroy all database resources and data!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Destruction cancelled"
        exit 0
    fi
    
    if terraform destroy -auto-approve; then
        success "Database resources destroyed successfully"
    else
        error "Failed to destroy database resources"
        exit 1
    fi
}

# Show status
status() {
    log "Checking deployment status..."
    cd "$TF_DIR"
    
    if terraform show &> /dev/null; then
        echo ""
        echo "=== Deployment Status ==="
        terraform output
        echo ""
    else
        error "No Terraform state found. Run 'deploy' first."
        exit 1
    fi
}

# Show help
show_help() {
    echo "AudioStems AWS Database Deployment Script (Simplified)"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    Deploy the database infrastructure"
    echo "  destroy   Destroy the database infrastructure"
    echo "  status    Show current deployment status"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy    # Deploy the database"
    echo "  $0 status    # Check deployment status"
    echo "  $0 destroy   # Destroy the database"
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "destroy")
        destroy
        ;;
    "status")
        status
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac 