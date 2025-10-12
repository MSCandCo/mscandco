#!/bin/bash

# AudioStems Platform Deployment Script
# This script deploys the entire AudioStems platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.${ENVIRONMENT}"

# Logging
LOG_FILE="deploy.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}AudioStems Platform Deployment${NC}"
echo -e "${BLUE}================================${NC}"
echo "Environment: $ENVIRONMENT"
echo "Timestamp: $(date)"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    print_status "Prerequisites check passed."
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment file..."
    
    if [ ! -f "$ENV_FILE" ]; then
        cat > "$ENV_FILE" << EOF
# AudioStems Platform Environment Configuration
# Environment: $ENVIRONMENT

# Database Configuration
POSTGRES_PASSWORD=audiostems_secure_password_$(date +%s)
POSTGRES_DB=audiostems
POSTGRES_USER=audiostems

# Redis Configuration
REDIS_PASSWORD=redis_secure_password_$(date +%s)

# JWT Secrets
JWT_SECRET=jwt_secret_$(openssl rand -hex 32)
ADMIN_JWT_SECRET=admin_jwt_secret_$(openssl rand -hex 32)
APP_KEYS=app_keys_$(openssl rand -hex 32)
API_TOKEN_SALT=api_token_salt_$(openssl rand -hex 32)
TRANSFER_TOKEN_SALT=transfer_token_salt_$(openssl rand -hex 32)

# AWS Configuration (for production)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_DEFAULT_REGION=us-east-1

# Grafana Configuration
GRAFANA_PASSWORD=admin

# MinIO Configuration
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# pgAdmin Configuration
PGADMIN_EMAIL=admin@audiostems.com
PGADMIN_PASSWORD=admin

# SSL Configuration (for production)
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem

# Monitoring Configuration
PROMETHEUS_RETENTION_DAYS=30
GRAFANA_ADMIN_PASSWORD=admin

# AI Service Configuration
AUDITUS_AI_DEVICE=cpu
AUDITUS_AI_MODEL_DIR=/models
AUDITUS_AI_CACHE_DIR=/cache

# Audio Processing Configuration
AUDIO_PROCESSING_MAX_FILE_SIZE=500
AUDIO_PROCESSING_WORKERS=4

# Elasticsearch Configuration
ELASTICSEARCH_HEAP_SIZE=512m

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30

# Security Configuration
ENABLE_SSL=true
ENABLE_RATE_LIMITING=true
ENABLE_WAF=true
ENABLE_MONITORING=true

# Development Configuration
NODE_ENV=development
DEBUG=true
LOG_LEVEL=info
EOF
        
        print_status "Environment file created: $ENV_FILE"
        print_warning "Please review and update the environment file with your specific values."
    else
        print_status "Environment file already exists: $ENV_FILE"
    fi
}

# Function to create SSL certificates (for development)
create_ssl_certificates() {
    print_status "Creating SSL certificates for development..."
    
    mkdir -p nginx/ssl
    
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=AudioStems/CN=localhost"
        
        print_status "SSL certificates created for development."
    else
        print_status "SSL certificates already exist."
    fi
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p nginx/logs
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    mkdir -p auditus-ai/models
    mkdir -p auditus-ai/cache
    mkdir -p audio-processing/temp
    mkdir -p init-scripts
    
    print_status "Directories created."
}

# Function to create database initialization scripts
create_db_init_scripts() {
    print_status "Creating database initialization scripts..."
    
    cat > init-scripts/01-init.sql << EOF
-- AudioStems Database Initialization
-- This script sets up the initial database structure

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'creator', 'admin', 'enterprise');
CREATE TYPE license_type AS ENUM ('standard', 'premium', 'enterprise', 'custom');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE audio_status AS ENUM ('uploading', 'processing', 'completed', 'failed');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_audio_files_creator_id ON audio_files(creator_id);
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_audio_files_search ON audio_files USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_users_search ON users USING gin(to_tsvector('english', name || ' ' || email));

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE audiostems TO audiostems;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO audiostems;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO audiostems;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO audiostems;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO audiostems;
EOF
    
    print_status "Database initialization scripts created."
}

# Function to create monitoring dashboards
create_monitoring_dashboards() {
    print_status "Creating monitoring dashboards..."
    
    # Create Grafana datasource configuration
    cat > monitoring/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF
    
    # Create Grafana dashboard configuration
    cat > monitoring/grafana/dashboards/dashboard.yml << EOF
apiVersion: 1

providers:
  - name: 'AudioStems'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF
    
    print_status "Monitoring dashboards configuration created."
}

# Function to build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build backend image
    print_status "Building Strapi backend..."
    docker-compose build backend
    
    # Build frontend image
    print_status "Building Next.js frontend..."
    docker-compose build frontend
    
    # Build AI service image
    print_status "Building Auditus AI service..."
    docker-compose build auditus-ai
    
    # Build audio processor image
    print_status "Building audio processor..."
    docker-compose build audio-processor
    
    print_status "All Docker images built successfully."
}

# Function to start services
start_services() {
    print_status "Starting AudioStems platform services..."
    
    # Start core services first
    print_status "Starting database and cache services..."
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 30
    
    # Start backend services
    print_status "Starting backend services..."
    docker-compose up -d backend auditus-ai audio-processor
    
    # Wait for backend services
    print_status "Waiting for backend services to be ready..."
    sleep 30
    
    # Start frontend
    print_status "Starting frontend..."
    docker-compose up -d frontend
    
    # Start monitoring services
    print_status "Starting monitoring services..."
    docker-compose up -d prometheus grafana elasticsearch kibana
    
    # Start additional services
    print_status "Starting additional services..."
    docker-compose up -d nginx minio mailhog redis-commander pgadmin
    
    print_status "All services started successfully."
}

# Function to check service health
check_service_health() {
    print_status "Checking service health..."
    
    local services=("postgres" "redis" "backend" "frontend" "auditus-ai" "audio-processor" "nginx")
    local failed_services=()
    
    for service in "${services[@]}"; do
        if docker-compose ps $service | grep -q "Up"; then
            print_status "$service is running"
        else
            print_error "$service is not running"
            failed_services+=("$service")
        fi
    done
    
    if [ ${#failed_services[@]} -eq 0 ]; then
        print_status "All services are healthy!"
    else
        print_error "The following services failed to start: ${failed_services[*]}"
        return 1
    fi
}

# Function to display service URLs
display_service_urls() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}AudioStems Platform URLs${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
    echo -e "${GREEN}Backend API:${NC} http://localhost:1337"
    echo -e "${GREEN}Strapi Admin:${NC} http://localhost:1337/admin"
    echo -e "${GREEN}Auditus AI API:${NC} http://localhost:8000"
    echo -e "${GREEN}Nginx (Proxy):${NC} http://localhost:80"
    echo ""
    echo -e "${YELLOW}Monitoring & Management:${NC}"
    echo -e "${GREEN}Grafana:${NC} http://localhost:3001 (admin/admin)"
    echo -e "${GREEN}Prometheus:${NC} http://localhost:9090"
    echo -e "${GREEN}Kibana:${NC} http://localhost:5601"
    echo -e "${GREEN}Elasticsearch:${NC} http://localhost:9200"
    echo -e "${GREEN}pgAdmin:${NC} http://localhost:5050 (admin@audiostems.com/admin)"
    echo -e "${GREEN}Redis Commander:${NC} http://localhost:8081"
    echo -e "${GREEN}MinIO Console:${NC} http://localhost:9001 (minioadmin/minioadmin)"
    echo -e "${GREEN}MailHog:${NC} http://localhost:8025"
    echo ""
    echo -e "${YELLOW}API Documentation:${NC}"
    echo -e "${GREEN}Auditus AI Docs:${NC} http://localhost:8000/docs"
    echo -e "${GREEN}Strapi API Docs:${NC} http://localhost:1337/documentation"
    echo ""
}

# Function to stop services
stop_services() {
    print_status "Stopping AudioStems platform services..."
    docker-compose down
    print_status "Services stopped."
}

# Function to clean up
cleanup() {
    print_status "Cleaning up..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    print_status "Cleanup completed."
}

# Function to show logs
show_logs() {
    local service=${1:-all}
    if [ "$service" = "all" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f $service
    fi
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    docker-compose restart
    print_status "Services restarted."
}

# Function to update services
update_services() {
    print_status "Updating services..."
    docker-compose pull
    docker-compose up -d
    print_status "Services updated."
}

# Function to backup data
backup_data() {
    print_status "Creating backup..."
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup database
    docker-compose exec -T postgres pg_dump -U audiostems audiostems > "$backup_dir/database.sql"
    
    # Backup volumes
    docker run --rm -v audiostems_postgres_data:/data -v $(pwd)/$backup_dir:/backup alpine tar czf /backup/postgres_data.tar.gz -C /data .
    docker run --rm -v audiostems_redis_data:/data -v $(pwd)/$backup_dir:/backup alpine tar czf /backup/redis_data.tar.gz -C /data .
    
    print_status "Backup created in $backup_dir"
}

# Function to restore data
restore_data() {
    local backup_dir=$1
    if [ -z "$backup_dir" ]; then
        print_error "Please specify backup directory"
        exit 1
    fi
    
    print_status "Restoring from backup: $backup_dir"
    
    # Stop services
    docker-compose down
    
    # Restore database
    docker-compose up -d postgres
    sleep 10
    docker-compose exec -T postgres psql -U audiostems -d audiostems < "$backup_dir/database.sql"
    
    # Restore volumes
    docker run --rm -v audiostems_postgres_data:/data -v $(pwd)/$backup_dir:/backup alpine tar xzf /backup/postgres_data.tar.gz -C /data
    docker run --rm -v audiostems_redis_data:/data -v $(pwd)/$backup_dir:/backup alpine tar xzf /backup/redis_data.tar.gz -C /data
    
    # Start services
    docker-compose up -d
    
    print_status "Restore completed"
}

# Function to show help
show_help() {
    echo "AudioStems Platform Deployment Script"
    echo ""
    echo "Usage: $0 [environment] [command]"
    echo ""
    echo "Environments:"
    echo "  development (default)"
    echo "  staging"
    echo "  production"
    echo ""
    echo "Commands:"
    echo "  deploy     - Deploy the entire platform"
    echo "  start      - Start all services"
    echo "  stop       - Stop all services"
    echo "  restart    - Restart all services"
    echo "  update     - Update all services"
    echo "  logs       - Show logs for all services"
    echo "  logs [service] - Show logs for specific service"
    echo "  health     - Check service health"
    echo "  backup     - Create backup"
    echo "  restore [backup_dir] - Restore from backup"
    echo "  cleanup    - Clean up all containers and volumes"
    echo "  help       - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 development deploy"
    echo "  $0 production start"
    echo "  $0 logs backend"
    echo "  $0 backup"
}

# Main script logic
main() {
    local command=${2:-deploy}
    
    case $command in
        deploy)
            check_prerequisites
            create_env_file
            create_ssl_certificates
            create_directories
            create_db_init_scripts
            create_monitoring_dashboards
            build_images
            start_services
            check_service_health
            display_service_urls
            ;;
        start)
            start_services
            check_service_health
            display_service_urls
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            check_service_health
            ;;
        update)
            update_services
            check_service_health
            ;;
        logs)
            local service=${3:-all}
            show_logs $service
            ;;
        health)
            check_service_health
            ;;
        backup)
            backup_data
            ;;
        restore)
            restore_data $3
            ;;
        cleanup)
            cleanup
            ;;
        help)
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@" 