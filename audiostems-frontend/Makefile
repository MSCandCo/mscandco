# MSC & Co Docker Environment Makefile
# Provides easy commands for managing the Docker development environment

.PHONY: help setup dev prod stop logs health backup cleanup build rebuild clean

# Default target
help: ## Show this help message
	@echo "MSC & Co Docker Environment Management"
	@echo "====================================="
	@echo ""
	@echo "Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Examples:"
	@echo "  make setup    # Initial setup"
	@echo "  make dev      # Start development"
	@echo "  make prod     # Start production"
	@echo "  make stop     # Stop all services"

# Initial setup
setup: ## Initial setup (check dependencies, create files, build images)
	@echo "🚀 Setting up MSC & Co Docker environment..."
	@chmod +x docker-setup.sh
	@./docker-setup.sh setup

# Development environment
dev: ## Start development environment
	@echo "🛠️  Starting development environment..."
	@./docker-setup.sh dev

# Production environment
prod: ## Start production environment
	@echo "🚀 Starting production environment..."
	@./docker-setup.sh prod

# Stop all services
stop: ## Stop all services
	@echo "🛑 Stopping all services..."
	@./docker-setup.sh stop

# View logs
logs: ## Show logs
	@echo "📋 Showing logs..."
	@./docker-setup.sh logs

# Health check
health: ## Check service health
	@echo "🏥 Checking service health..."
	@./docker-setup.sh health

# Database backup
backup: ## Create database backup
	@echo "💾 Creating database backup..."
	@./docker-setup.sh backup

# Cleanup Docker resources
cleanup: ## Clean up Docker resources
	@echo "🧹 Cleaning up Docker resources..."
	@./docker-setup.sh cleanup

# Build images
build: ## Build Docker images
	@echo "🔨 Building Docker images..."
	docker-compose build

# Rebuild images (no cache)
rebuild: ## Rebuild Docker images (no cache)
	@echo "🔨 Rebuilding Docker images..."
	docker-compose build --no-cache

# Clean Docker resources
clean: ## Clean Docker resources (images, containers, volumes)
	@echo "🧹 Cleaning Docker resources..."
	docker system prune -a -f --volumes

# Quick development start
quick-dev: ## Quick development start (assumes setup is done)
	@echo "⚡ Quick development start..."
	docker-compose up -d

# Quick production start
quick-prod: ## Quick production start (assumes setup is done)
	@echo "⚡ Quick production start..."
	docker-compose -f docker-compose.prod.yml up -d

# Show service status
status: ## Show service status
	@echo "📊 Service status:"
	@docker-compose ps

# Show resource usage
stats: ## Show resource usage
	@echo "📈 Resource usage:"
	@docker stats --no-stream

# Enter frontend container
frontend-shell: ## Enter frontend container shell
	@echo "🐳 Entering frontend container..."
	docker-compose exec frontend sh

# Enter backend container
backend-shell: ## Enter backend container shell
	@echo "🐳 Entering backend container..."
	docker-compose exec backend sh

# Enter database container
db-shell: ## Enter database container shell
	@echo "🐳 Entering database container..."
	docker-compose exec postgres psql -U msc_co_user -d msc_co_dev

# Enter Redis container
redis-shell: ## Enter Redis container shell
	@echo "🐳 Entering Redis container..."
	docker-compose exec redis redis-cli -a redis_password

# Restart all services
restart: ## Restart all services
	@echo "🔄 Restarting all services..."
	docker-compose restart

# Restart specific service
restart-%: ## Restart specific service (e.g., make restart-frontend)
	@echo "🔄 Restarting $*..."
	docker-compose restart $*

# Show logs for specific service
logs-%: ## Show logs for specific service (e.g., make logs-frontend)
	@echo "📋 Showing logs for $*..."
	docker-compose logs -f $*

# Update dependencies
update-deps: ## Update dependencies
	@echo "📦 Updating dependencies..."
	@docker-compose exec frontend npm update
	@docker-compose exec backend npm update
	@echo "✅ Dependencies updated"

# Install new frontend dependency
install-frontend-%: ## Install new frontend dependency (e.g., make install-frontend-lodash)
	@echo "📦 Installing frontend dependency: $*"
	@docker-compose exec frontend npm install $*

# Install new backend dependency
install-backend-%: ## Install new backend dependency (e.g., make install-backend-express)
	@echo "📦 Installing backend dependency: $*"
	@docker-compose exec backend npm install $*

# Run frontend tests
test-frontend: ## Run frontend tests
	@echo "🧪 Running frontend tests..."
	@docker-compose exec frontend npm test

# Run backend tests
test-backend: ## Run backend tests
	@echo "🧪 Running backend tests..."
	@docker-compose exec backend npm test

# Database migration
migrate: ## Run database migrations
	@echo "🗄️  Running database migrations..."
	@docker-compose exec backend npm run strapi database:migrate

# Database seed
seed: ## Seed database with initial data
	@echo "🌱 Seeding database..."
	@docker-compose exec backend npm run strapi database:seed

# Show environment info
env-info: ## Show environment information
	@echo "ℹ️  Environment information:"
	@echo "Frontend URL: http://localhost:3000"
	@echo "Backend URL: http://localhost:1337"
	@echo "Admin Panel: http://localhost:1337/admin"
	@echo "Database Admin: http://localhost:8080"
	@echo "Nginx Proxy: http://localhost:80"

# Production environment info
prod-info: ## Show production environment information
	@echo "ℹ️  Production environment information:"
	@echo "Frontend URL: https://localhost"
	@echo "Backend URL: https://localhost/api"
	@echo "Admin Panel: https://localhost/admin"

# Check Docker resources
check-resources: ## Check Docker resource usage
	@echo "📊 Docker resource usage:"
	@docker system df
	@echo ""
	@echo "Container status:"
	@docker-compose ps

# Optimize Docker images
optimize: ## Optimize Docker images
	@echo "🔧 Optimizing Docker images..."
	@docker system prune -f
	@docker image prune -f
	@echo "✅ Optimization complete"

# Show all running containers
ps: ## Show all running containers
	@echo "📋 Running containers:"
	@docker ps

# Show all containers (including stopped)
ps-all: ## Show all containers (including stopped)
	@echo "📋 All containers:"
	@docker ps -a

# Show Docker networks
networks: ## Show Docker networks
	@echo "🌐 Docker networks:"
	@docker network ls

# Show Docker volumes
volumes: ## Show Docker volumes
	@echo "💾 Docker volumes:"
	@docker volume ls

# Show Docker images
images: ## Show Docker images
	@echo "🐳 Docker images:"
	@docker images

# Full system information
info: ## Show full system information
	@echo "ℹ️  System information:"
	@echo "Docker version:"
	@docker --version
	@echo ""
	@echo "Docker Compose version:"
	@docker-compose --version
	@echo ""
	@echo "Available memory:"
	@free -h
	@echo ""
	@echo "Available disk space:"
	@df -h 