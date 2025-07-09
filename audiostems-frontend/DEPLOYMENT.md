# MSC & Co Production Deployment Guide

This guide provides comprehensive instructions for deploying the MSC & Co platform to production environments.

## 🚀 Quick Deployment

### Prerequisites

- Docker and Docker Compose installed
- Domain name configured
- SSL certificates ready
- Environment variables configured
- At least 4GB RAM and 20GB storage

### One-Command Deployment

```bash
# Setup production environment
make setup
cp env.docker.template .env
# Edit .env with production values

# Deploy to production
make prod
```

## 📋 Pre-Deployment Checklist

### [ ] Environment Configuration
- [ ] All environment variables set in `.env`
- [ ] Production database credentials configured
- [ ] SSL certificates prepared
- [ ] Domain names configured

### [ ] Security Configuration
- [ ] Strong passwords for all services
- [ ] SSL certificates installed
- [ ] Firewall rules configured
- [ ] Security headers enabled

### [ ] Infrastructure
- [ ] Sufficient resources allocated
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Logging configured

## 🌐 Cloud Platform Deployments

### AWS ECS/Fargate

#### 1. Prepare AWS Resources

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name msc-co-cluster

# Create ECR repositories
aws ecr create-repository --repository-name msc-co-frontend
aws ecr create-repository --repository-name msc-co-backend
```

#### 2. Build and Push Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and tag images
docker build -t msc-co-frontend:latest .
docker build -t msc-co-backend:latest ./audiostems-backend

# Tag for ECR
docker tag msc-co-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/msc-co-frontend:latest
docker tag msc-co-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/msc-co-backend:latest

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/msc-co-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/msc-co-backend:latest
```

#### 3. Create Task Definitions

```json
{
  "family": "msc-co-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/msc-co-frontend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/msc-co-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Run

#### 1. Build and Deploy

```bash
# Build images
docker build -t gcr.io/PROJECT_ID/msc-co-frontend .
docker build -t gcr.io/PROJECT_ID/msc-co-backend ./audiostems-backend

# Push to Container Registry
docker push gcr.io/PROJECT_ID/msc-co-frontend
docker push gcr.io/PROJECT_ID/msc-co-backend

# Deploy to Cloud Run
gcloud run deploy msc-co-frontend \
  --image gcr.io/PROJECT_ID/msc-co-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production

gcloud run deploy msc-co-backend \
  --image gcr.io/PROJECT_ID/msc-co-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

### Azure Container Instances

#### 1. Deploy with Azure CLI

```bash
# Create resource group
az group create --name msc-co-rg --location eastus

# Deploy frontend
az container create \
  --resource-group msc-co-rg \
  --name msc-co-frontend \
  --image msc-co-frontend:latest \
  --dns-name-label msc-co-frontend \
  --ports 3000 \
  --environment-variables NODE_ENV=production

# Deploy backend
az container create \
  --resource-group msc-co-rg \
  --name msc-co-backend \
  --image msc-co-backend:latest \
  --dns-name-label msc-co-backend \
  --ports 1337 \
  --environment-variables NODE_ENV=production
```

## 🐳 Docker Swarm Deployment

### 1. Initialize Swarm

```bash
# Initialize swarm
docker swarm init

# Create overlay network
docker network create --driver overlay msc-co-network
```

### 2. Deploy Stack

```bash
# Deploy the stack
docker stack deploy -c docker-compose.prod.yml msc-co
```

### 3. Scale Services

```bash
# Scale frontend to 3 replicas
docker service scale msc-co_frontend=3

# Scale backend to 2 replicas
docker service scale msc-co_backend=2
```

## ☸️ Kubernetes Deployment

### 1. Create Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: msc-co
```

### 2. Create ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: msc-co-config
  namespace: msc-co
data:
  NODE_ENV: "production"
  DATABASE_HOST: "postgres-service"
  REDIS_HOST: "redis-service"
```

### 3. Create Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: msc-co-secrets
  namespace: msc-co
type: Opaque
data:
  POSTGRES_PASSWORD: <base64-encoded-password>
  REDIS_PASSWORD: <base64-encoded-password>
  JWT_SECRET: <base64-encoded-secret>
```

### 4. Deploy Services

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: msc-co-frontend
  namespace: msc-co
spec:
  replicas: 3
  selector:
    matchLabels:
      app: msc-co-frontend
  template:
    metadata:
      labels:
        app: msc-co-frontend
    spec:
      containers:
      - name: frontend
        image: msc-co-frontend:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: msc-co-config
        - secretRef:
            name: msc-co-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 🔒 Security Configuration

### SSL/TLS Setup

#### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to Docker
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/nginx/ssl/key.pem
```

#### Auto-renewal

```bash
# Add to crontab
sudo crontab -e

# Add this line
0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f docker-compose.prod.yml restart nginx
```

### Security Headers

```nginx
# Add to nginx configuration
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

## 📊 Monitoring and Logging

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'msc-co-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/api/metrics'

  - job_name: 'msc-co-backend'
    static_configs:
      - targets: ['backend:1337']
    metrics_path: '/api/metrics'
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "MSC & Co Platform",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v1
      with:
        username: ${{ secrets.DOCKER_HUB_USERNAME }}
        password: ${{ secrets.DOCKER_HUB_TOKEN }}
    
    - name: Build and push images
      run: |
        docker build -t username/msc-co-frontend:${{ github.sha }} .
        docker build -t username/msc-co-backend:${{ github.sha }} ./audiostems-backend
        docker push username/msc-co-frontend:${{ github.sha }}
        docker push username/msc-co-backend:${{ github.sha }}
    
    - name: Deploy to production
      run: |
        echo ${{ secrets.SSH_PRIVATE_KEY }} > key.pem
        chmod 600 key.pem
        ssh -i key.pem -o StrictHostKeyChecking=no user@server "cd /opt/msc-co && docker-compose pull && docker-compose up -d"
```

### GitLab CI

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t registry.gitlab.com/group/project/frontend:$CI_COMMIT_SHA .
    - docker build -t registry.gitlab.com/group/project/backend:$CI_COMMIT_SHA ./audiostems-backend
    - docker push registry.gitlab.com/group/project/frontend:$CI_COMMIT_SHA
    - docker push registry.gitlab.com/group/project/backend:$CI_COMMIT_SHA

deploy:
  stage: deploy
  script:
    - ssh user@server "cd /opt/msc-co && docker-compose pull && docker-compose up -d"
```

## 🗄️ Database Management

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="msc_co_prod"

# Create backup
docker-compose exec -T postgres pg_dump -U msc_co_user $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to cloud storage
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://msc-co-backups/
```

### Restore Strategy

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Download from cloud storage
aws s3 cp s3://msc-co-backups/$BACKUP_FILE .

# Restore database
gunzip -c $BACKUP_FILE | docker-compose exec -T postgres psql -U msc_co_user -d msc_co_prod

echo "Database restored from $BACKUP_FILE"
```

## 🔧 Maintenance

### Health Checks

```bash
#!/bin/bash
# health-check.sh

# Check frontend
if ! curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "Frontend health check failed"
    docker-compose restart frontend
fi

# Check backend
if ! curl -f http://localhost:1337/api/health >/dev/null 2>&1; then
    echo "Backend health check failed"
    docker-compose restart backend
fi

# Check database
if ! docker-compose exec postgres pg_isready -U msc_co_user >/dev/null 2>&1; then
    echo "Database health check failed"
    docker-compose restart postgres
fi
```

### Log Rotation

```bash
# /etc/logrotate.d/msc-co
/var/log/msc-co/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /opt/msc-co/docker-compose.prod.yml restart nginx
    endscript
}
```

## 📈 Performance Optimization

### Nginx Optimization

```nginx
# nginx.conf optimizations
worker_processes auto;
worker_connections 2048;
keepalive_timeout 65;
client_max_body_size 100M;

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript;

# Caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Optimization

```sql
-- PostgreSQL optimizations
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
```

## 🚨 Troubleshooting

### Common Issues

#### High Memory Usage
```bash
# Check memory usage
docker stats

# Restart services
docker-compose restart

# Scale down if needed
docker-compose up -d --scale frontend=2 --scale backend=1
```

#### Database Connection Issues
```bash
# Check database status
docker-compose exec postgres pg_isready -U msc_co_user

# Check connection pool
docker-compose exec postgres psql -U msc_co_user -c "SELECT * FROM pg_stat_activity;"
```

#### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in docker/nginx/ssl/cert.pem -text -noout

# Renew certificates
sudo certbot renew

# Restart nginx
docker-compose restart nginx
```

### Emergency Procedures

#### Rollback Deployment
```bash
# Rollback to previous version
docker-compose down
docker tag msc-co-frontend:previous msc-co-frontend:latest
docker tag msc-co-backend:previous msc-co-backend:latest
docker-compose up -d
```

#### Database Recovery
```bash
# Stop services
docker-compose stop

# Restore from backup
gunzip -c backup_20231201_120000.sql.gz | docker-compose exec -T postgres psql -U msc_co_user -d msc_co_prod

# Start services
docker-compose up -d
```

## 📞 Support

For deployment issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Check resource usage: `docker stats`
4. Review health checks: `make health`

Contact the development team for critical issues. 