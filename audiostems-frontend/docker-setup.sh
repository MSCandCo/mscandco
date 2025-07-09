#!/bin/bash

# MSC & Co Docker Setup Script
# This script sets up the complete Docker development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check for Docker Compose (both standalone and plugin versions)
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env_file() {
    print_status "Checking environment configuration..."
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        if [ -f env.docker.template ]; then
            cp env.docker.template .env
            print_success "Created .env file from template"
            print_warning "Please edit .env file with your actual configuration values"
        else
            print_error "env.docker.template not found. Please create .env file manually."
            exit 1
        fi
    else
        print_success ".env file found"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    # Create Docker directories
    mkdir -p docker/nginx/conf.d
    mkdir -p docker/postgres/init
    mkdir -p docker/postgres/backup
    mkdir -p docker/nginx/ssl
    
    # Create logs directory
    mkdir -p logs
    
    print_success "Directories created"
}

# Generate SSL certificates for development
generate_ssl_certs() {
    print_status "Generating SSL certificates for development..."
    
    if [ ! -f docker/nginx/ssl/cert.pem ] || [ ! -f docker/nginx/ssl/key.pem ]; then
        mkdir -p docker/nginx/ssl
        
        # Generate self-signed certificate
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout docker/nginx/ssl/key.pem \
            -out docker/nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=MSC&Co/CN=localhost"
        
        print_success "SSL certificates generated"
    else
        print_success "SSL certificates already exist"
    fi
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build frontend image
    print_status "Building frontend image..."
    docker build -t msc-co-frontend:latest .
    
    # Build backend image
    print_status "Building backend image..."
    docker build -t msc-co-backend:latest ./audiostems-backend
    
    print_success "Docker images built successfully"
}

# Start development environment
start_development() {
    print_status "Starting development environment..."
    
    # Start services
    docker compose up -d
    
    print_success "Development environment started"
    print_status "Services are starting up..."
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:1337"
    print_status "Adminer: http://localhost:8080"
    print_status "Nginx: http://localhost:80"
}

# Start production environment
start_production() {
    print_status "Starting production environment..."
    
    # Start production services
    docker compose -f docker-compose.prod.yml up -d
    
    print_success "Production environment started"
    print_status "Services are starting up..."
    print_status "Frontend: https://localhost"
    print_status "Backend: https://localhost/api"
}

# Stop all services
stop_services() {
    print_status "Stopping all services..."
    
    docker compose down
    docker compose -f docker-compose.prod.yml down
    
    print_success "All services stopped"
}

# Clean up Docker resources
cleanup() {
    print_status "Cleaning up Docker resources..."
    
    # Stop and remove containers
    docker compose down -v
    docker compose -f docker-compose.prod.yml down -v
    
    # Remove images
    docker rmi msc-co-frontend:latest msc-co-backend:latest 2>/dev/null || true
    
    # Remove unused volumes
    docker volume prune -f
    
    print_success "Cleanup completed"
}

# Show logs
show_logs() {
    print_status "Showing logs..."
    docker compose logs -f
}

# Database backup
backup_database() {
    print_status "Creating database backup..."
    
    docker compose -f docker-compose.prod.yml --profile backup run --rm backup
    
    print_success "Database backup completed"
}

# Database restore
restore_database() {
    if [ -z "$1" ]; then
        print_error "Please provide backup file name"
        exit 1
    fi
    
    print_status "Restoring database from $1..."
    
    # This would need to be implemented based on your backup strategy
    print_warning "Database restore not implemented yet"
}

# Health check
health_check() {
    print_status "Checking service health..."
    
    # Check if services are running
    if docker compose ps | grep -q "Up"; then
        print_success "Services are running"
        
        # Check individual service health
        print_status "Checking frontend health..."
        if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
            print_success "Frontend is healthy"
        else
            print_warning "Frontend health check failed"
        fi
        
        print_status "Checking backend health..."
        if curl -f http://localhost:1337/api/health >/dev/null 2>&1; then
            print_success "Backend is healthy"
        else
            print_warning "Backend health check failed"
        fi
    else
        print_error "Services are not running"
    fi
}

# Show usage
show_usage() {
    echo "MSC & Co Docker Setup Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup       - Initial setup (check dependencies, create files, build images)"
    echo "  dev         - Start development environment"
    echo "  prod        - Start production environment"
    echo "  stop        - Stop all services"
    echo "  logs        - Show logs"
    echo "  health      - Check service health"
    echo "  backup      - Create database backup"
    echo "  cleanup     - Clean up Docker resources"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup    # Initial setup"
    echo "  $0 dev      # Start development"
    echo "  $0 prod     # Start production"
    echo "  $0 stop     # Stop services"
}

# Main script logic
case "${1:-help}" in
    setup)
        print_status "Starting MSC & Co Docker setup..."
        check_docker
        check_env_file
        create_directories
        generate_ssl_certs
        build_images
        print_success "Setup completed successfully!"
        print_status "Run '$0 dev' to start the development environment"
        ;;
    dev)
        check_docker
        check_env_file
        start_development
        ;;
    prod)
        check_docker
        check_env_file
        start_production
        ;;
    stop)
        stop_services
        ;;
    logs)
        show_logs
        ;;
    health)
        health_check
        ;;
    backup)
        backup_database
        ;;
    cleanup)
        cleanup
        ;;
    help|*)
        show_usage
        ;;
esac 