# MSC & Co Docker Development Environment

This document provides comprehensive instructions for setting up and running the MSC & Co platform using Docker.

## 🚀 Quick Start

### Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- At least 4GB of available RAM
- At least 10GB of available disk space

### One-Command Setup

```bash
# Clone the repository and navigate to the project directory
git clone <repository-url>
cd audiostems-frontend

# Run the setup script
chmod +x docker-setup.sh
./docker-setup.sh setup

# Start development environment
./docker-setup.sh dev
```

## 📁 Project Structure

```
audiostems-frontend/
├── Dockerfile                          # Frontend container definition
├── docker-compose.yml                  # Development environment
├── docker-compose.prod.yml            # Production environment
├── docker-setup.sh                    # Setup and management script
├── env.docker.template                # Environment variables template
├── .dockerignore                      # Docker ignore file
├── docker/                           # Docker configuration files
│   ├── nginx/
│   │   ├── nginx.conf               # Development nginx config
│   │   ├── nginx.prod.conf          # Production nginx config
│   │   └── conf.d/                  # Additional nginx configs
│   └── postgres/
│       ├── init/                     # Database initialization scripts
│       └── backup/                   # Database backup directory
└── audiostems-backend/               # Backend application
    ├── Dockerfile                    # Backend container definition
    └── .dockerignore                 # Backend docker ignore file
```

## 🏗️ Architecture

### Services Overview

1. **Frontend (Next.js)**
   - Port: 3000
   - Hot reloading enabled
   - Node.js 20 Alpine

2. **Backend (Strapi)**
   - Port: 1337
   - API and admin panel
   - Node.js 20 Alpine

3. **Database (PostgreSQL)**
   - Port: 5432
   - Persistent data storage
   - PostgreSQL 15 Alpine

4. **Cache (Redis)**
   - Port: 6379
   - Session and cache storage
   - Redis 7 Alpine

5. **Reverse Proxy (Nginx)**
   - Port: 80 (HTTP), 443 (HTTPS)
   - Load balancing and SSL termination
   - Nginx Alpine

6. **Database Admin (Adminer)**
   - Port: 8080
   - Web-based database management
   - Development only

## 🔧 Configuration

### Environment Variables

Copy the template and configure your environment:

```bash
cp env.docker.template .env
```

Edit `.env` with your actual values:

```bash
# Database Configuration
POSTGRES_DB=msc_co_dev
POSTGRES_USER=msc_co_user
POSTGRES_PASSWORD=your-secure-password
REDIS_PASSWORD=your-secure-redis-password

# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain
AUTH0_CLIENT_ID=your-client-id
AUTH0_SECRET=your-secret
# ... (see env.docker.template for all variables)
```

### Required Environment Variables

#### Database
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password
- `REDIS_PASSWORD`: Redis password

#### Strapi
- `APP_KEYS`: Comma-separated app keys
- `API_TOKEN_SALT`: API token salt
- `ADMIN_JWT_SECRET`: Admin JWT secret
- `JWT_SECRET`: JWT secret

#### Auth0
- `AUTH0_DOMAIN`: Auth0 domain
- `AUTH0_CLIENT_ID`: Auth0 client ID
- `AUTH0_SECRET`: Auth0 secret
- `AUTH0_BASE_URL`: Base URL for your app
- `AUTH0_ISSUER_BASE_URL`: Auth0 issuer URL
- `AUTH0_CLIENT_SECRET`: Auth0 client secret
- `AUTH0_MANAGEMENT_TOKEN`: Auth0 management API token

## 🚀 Usage

### Development Environment

```bash
# Start development environment
./docker-setup.sh dev

# Or manually
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Environment

```bash
# Start production environment
./docker-setup.sh prod

# Or manually
docker-compose -f docker-compose.prod.yml up -d

# Stop production services
docker-compose -f docker-compose.prod.yml down
```

### Management Commands

```bash
# Check service health
./docker-setup.sh health

# View logs
./docker-setup.sh logs

# Create database backup
./docker-setup.sh backup

# Clean up resources
./docker-setup.sh cleanup

# Stop all services
./docker-setup.sh stop
```

## 🔍 Service URLs

### Development
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:1337
- **Strapi Admin**: http://localhost:1337/admin
- **Database Admin**: http://localhost:8080
- **Nginx Proxy**: http://localhost:80

### Production
- **Frontend**: https://localhost
- **Backend API**: https://localhost/api
- **Strapi Admin**: https://localhost/admin

## 🛠️ Development Workflow

### Hot Reloading

Both frontend and backend support hot reloading:

- **Frontend**: Changes to React components and pages are reflected immediately
- **Backend**: Changes to Strapi controllers and services are reflected immediately

### Database Migrations

Strapi handles database migrations automatically. When you make schema changes:

1. Update your content types in Strapi admin
2. Strapi will automatically create and run migrations
3. Changes are persisted in the PostgreSQL volume

### Adding Dependencies

#### Frontend
```bash
# Add a new dependency
docker-compose exec frontend npm install package-name

# Add a dev dependency
docker-compose exec frontend npm install --save-dev package-name
```

#### Backend
```bash
# Add a new dependency
docker-compose exec backend npm install package-name

# Add a dev dependency
docker-compose exec backend npm install --save-dev package-name
```

## 🔒 Security Features

### Development
- Non-root users in containers
- Read-only filesystems where possible
- Security headers in Nginx
- Rate limiting on API endpoints

### Production
- SSL/TLS encryption
- Security headers
- Rate limiting
- Resource limits
- Read-only containers
- No new privileges policy

## 📊 Monitoring and Logging

### Health Checks
All services include health checks:
- Frontend: `/api/health`
- Backend: `/api/health`
- Database: PostgreSQL readiness check
- Redis: Redis ping check
- Nginx: HTTP health check

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Resource Monitoring
```bash
# View resource usage
docker stats

# View container details
docker-compose ps
```

## 🗄️ Database Management

### Backup
```bash
# Create backup
./docker-setup.sh backup

# Manual backup
docker-compose -f docker-compose.prod.yml --profile backup run --rm backup
```

### Restore
```bash
# Restore from backup (implement based on your needs)
docker-compose exec postgres psql -U msc_co_user -d msc_co_dev < backup_file.sql
```

### Database Access
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U msc_co_user -d msc_co_dev

# Connect to Redis
docker-compose exec redis redis-cli -a redis_password
```

## 🚀 Deployment

### Local Production Testing
```bash
# Start production environment locally
./docker-setup.sh prod

# Test production build
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment

The production configuration is ready for deployment to:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Any Kubernetes cluster

### Environment Variables for Production

Create a `.env.prod` file with production values:

```bash
# Production overrides
AUTH0_BASE_URL=https://your-domain.com
NEXT_PUBLIC_STRAPI=https://your-domain.com/api
POSTGRES_DB=msc_co_prod
# ... other production-specific variables
```

## 🔧 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using a port
lsof -i :3000
lsof -i :1337
lsof -i :5432

# Stop conflicting services
sudo systemctl stop postgresql  # if local PostgreSQL is running
```

#### Permission Issues
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
# Log out and back in
```

#### Memory Issues
```bash
# Increase Docker memory limit
# In Docker Desktop: Settings > Resources > Memory
```

#### Database Connection Issues
```bash
# Check database status
docker-compose exec postgres pg_isready -U msc_co_user

# Restart database
docker-compose restart postgres
```

### Debug Commands

```bash
# Enter container shell
docker-compose exec frontend sh
docker-compose exec backend sh

# View container logs
docker-compose logs frontend
docker-compose logs backend

# Check container health
docker-compose ps
```

## 📈 Performance Optimization

### Development
- Hot reloading enabled
- Volume mounts for fast file access
- Optimized Docker layers

### Production
- Multi-stage builds
- Optimized images
- Resource limits
- Load balancing
- Caching layers

## 🔄 Updates and Maintenance

### Updating Dependencies
```bash
# Update frontend dependencies
docker-compose exec frontend npm update

# Update backend dependencies
docker-compose exec backend npm update

# Rebuild images
docker-compose build --no-cache
```

### Updating Docker Images
```bash
# Pull latest base images
docker-compose pull

# Rebuild with latest images
docker-compose build --no-cache
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Strapi Documentation](https://docs.strapi.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 🤝 Contributing

When contributing to the Docker setup:

1. Test changes in development environment
2. Update documentation
3. Test production deployment
4. Follow security best practices
5. Update version numbers appropriately

## 📄 License

This Docker setup is part of the MSC & Co platform and follows the same license terms. 