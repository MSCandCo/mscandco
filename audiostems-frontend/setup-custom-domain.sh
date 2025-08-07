#!/bin/bash
# MSC & Co Platform - Custom Domain Setup Script
# Automates the custom domain configuration process

set -e

echo "🌐 MSC & Co Custom Domain Setup"
echo "==============================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required environment variables are set
check_env_vars() {
    print_info "Checking environment variables..."
    
    if [ -z "$BASE_DOMAIN" ]; then
        print_error "BASE_DOMAIN is not set. Please configure your domain in env.staging.template"
        exit 1
    fi
    
    if [ -z "$HOSTED_ZONE_ID" ]; then
        print_error "HOSTED_ZONE_ID is not set. Please get your Route 53 Hosted Zone ID"
        exit 1
    fi
    
    print_status "Environment variables validated"
}

# Check AWS CLI configuration
check_aws_config() {
    print_info "Checking AWS configuration..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        exit 1
    fi
    
    if ! aws sts get-caller-identity --profile msc-co-deployment &> /dev/null; then
        print_error "AWS credentials not configured for profile 'msc-co-deployment'"
        print_info "Run: aws configure --profile msc-co-deployment"
        exit 1
    fi
    
    print_status "AWS CLI configured correctly"
}

# Install required serverless plugins
install_plugins() {
    print_info "Installing Serverless plugins..."
    
    if [ ! -f "package.json" ]; then
        npm init -y
    fi
    
    npm install --save-dev serverless-domain-manager
    npm install --save-dev serverless-offline
    
    print_status "Serverless plugins installed"
}

# Check if domain exists in Route 53
check_domain() {
    print_info "Checking if domain exists in Route 53..."
    
    DOMAIN_CHECK=$(aws route53 get-hosted-zone --id "$HOSTED_ZONE_ID" --profile msc-co-deployment 2>/dev/null || echo "NOT_FOUND")
    
    if [ "$DOMAIN_CHECK" = "NOT_FOUND" ]; then
        print_error "Hosted Zone ID $HOSTED_ZONE_ID not found"
        print_info "Please check your Route 53 Hosted Zone ID"
        exit 1
    fi
    
    print_status "Domain configuration verified"
}

# Deploy the custom domain
deploy_custom_domain() {
    print_info "Deploying MSC & Co with custom domain..."
    
    export AWS_PROFILE=msc-co-deployment
    
    # Create the domain (this may take 20-40 minutes for SSL certificate)
    print_warning "Creating SSL certificate and custom domain (this may take 20-40 minutes)..."
    serverless create_domain --config serverless-custom-domain.yml --stage staging
    
    # Deploy the service
    print_info "Deploying the service..."
    serverless deploy --config serverless-custom-domain.yml --stage staging
    
    print_status "Deployment complete!"
}

# Test the custom domain
test_deployment() {
    print_info "Testing custom domain deployment..."
    
    DOMAIN_URL="https://${STAGING_DOMAIN:-staging-mscco.$BASE_DOMAIN}"
    
    print_info "Waiting for DNS propagation..."
    sleep 30
    
    # Test health endpoint
    if curl -s -f "$DOMAIN_URL/health" > /dev/null; then
        print_status "Custom domain is working! 🎉"
        print_info "Your MSC & Co platform is now available at:"
        echo -e "${GREEN}🌐 $DOMAIN_URL${NC}"
    else
        print_warning "Custom domain might still be propagating..."
        print_info "Try visiting $DOMAIN_URL in a few minutes"
    fi
}

# Main execution
main() {
    echo "🚀 Starting custom domain setup..."
    echo ""
    
    # Load environment variables if file exists
    if [ -f "env.staging.template" ]; then
        print_info "Loading environment variables..."
        export $(grep -v '^#' env.staging.template | xargs)
    fi
    
    check_env_vars
    check_aws_config
    install_plugins
    check_domain
    deploy_custom_domain
    test_deployment
    
    echo ""
    echo "🎉 Custom Domain Setup Complete!"
    echo "================================"
    echo ""
    echo "Your MSC & Co platform URLs:"
    echo "🌐 Custom Domain: https://${STAGING_DOMAIN:-staging-mscco.$BASE_DOMAIN}"
    echo "🏥 Health Check: https://${STAGING_DOMAIN:-staging-mscco.$BASE_DOMAIN}/health"
    echo "📊 Dashboard: https://${STAGING_DOMAIN:-staging-mscco.$BASE_DOMAIN}/dashboard"
    echo ""
    echo "Next steps:"
    echo "1. Update Auth0 callback URLs"
    echo "2. Update Stripe webhook URLs"
    echo "3. Configure monitoring and alerts"
    echo ""
}

# Run the main function
main "$@"