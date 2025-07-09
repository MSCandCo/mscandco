# MSC & Co Deployment Guide

## Environment Variables Required

### Auth0 Configuration
```bash
# Required for authentication
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_SECRET=your-secret-key
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_MANAGEMENT_TOKEN=your-management-token
```

### Database Configuration
```bash
# PostgreSQL settings
DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=msc_co_prod
DATABASE_USERNAME=msc_co_user
DATABASE_PASSWORD=secure-password
DATABASE_SSL=false
DATABASE_SCHEMA=public
```

### Strapi Configuration
```bash
# Strapi app keys (generate unique values)
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret
```

### File Upload Configuration
```bash
# Cloudinary (recommended for production)
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_KEY=your-cloudinary-key
CLOUDINARY_SECRET=your-cloudinary-secret

# AWS S3 (alternative)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```

### Email Service
```bash
# SendGrid configuration
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@mscandco.com
```

### SMS Service (Optional)
```bash
# Twilio configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### Stripe Integration (Optional)
```bash
# Payment processing
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

## Docker Commands

### Development Environment
```bash
# Start development environment
make setup
# or
./docker-setup.sh dev

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Production Environment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale frontend=3
```

### Maintenance Commands
```bash
# View container status
docker-compose ps

# Restart specific service
docker-compose restart frontend
docker-compose restart backend

# View service logs
docker logs msc-co-frontend
docker logs msc-co-backend

# Access container shell
docker exec -it msc-co-frontend sh
docker exec -it msc-co-backend sh
```

## Database Schema

### Core Content Types

#### Users (Auth0 Integration)
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "role": "enum(super_admin, company_admin, distribution_partner_admin, artist, distributor)",
  "brand": "enum(yhwh_msc, audio_msc)",
  "profile": "relation(oneToOne, artist)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### Artists
```json
{
  "id": "string",
  "name": "string",
  "bio": "text",
  "avatar": "media",
  "user": "relation(manyToOne, user)",
  "songs": "relation(oneToMany, song)",
  "projects": "relation(oneToMany, project)",
  "earnings": "relation(oneToMany, monthly-statement)"
}
```

#### Songs
```json
{
  "id": "string",
  "title": "string",
  "artist": "relation(manyToOne, artist)",
  "genre": "relation(manyToOne, genre)",
  "audio_file": "media",
  "duration": "integer",
  "bpm": "integer",
  "key": "string",
  "lyrics": "relation(oneToOne, lyric)",
  "stems": "relation(oneToMany, stem)",
  "playlists": "relation(manyToMany, playlist)",
  "downloads": "relation(oneToMany, download-history)"
}
```

#### Stems
```json
{
  "id": "string",
  "name": "string",
  "song": "relation(manyToOne, song)",
  "audio_file": "media",
  "type": "enum(vocals, drums, bass, guitar, keys, other)",
  "duration": "integer"
}
```

#### Playlists
```json
{
  "id": "string",
  "title": "string",
  "description": "text",
  "cover": "media",
  "songs": "relation(manyToMany, song)",
  "created_by": "relation(manyToOne, user)",
  "is_public": "boolean"
}
```

#### Projects
```json
{
  "id": "string",
  "title": "string",
  "description": "text",
  "artist": "relation(manyToOne, artist)",
  "songs": "relation(manyToMany, song)",
  "status": "enum(draft, in_progress, completed, released)",
  "release_date": "date",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### Monthly Statements
```json
{
  "id": "string",
  "artist": "relation(manyToOne, artist)",
  "month": "integer",
  "year": "integer",
  "total_earnings": "decimal",
  "streaming_revenue": "decimal",
  "performance_revenue": "decimal",
  "publishing_revenue": "decimal",
  "mechanical_revenue": "decimal",
  "licensing_revenue": "decimal",
  "sync_revenue": "decimal",
  "total_streams": "integer",
  "total_downloads": "integer",
  "growth_percentage": "decimal"
}
```

## API Endpoints

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/logout         # User logout
GET  /api/auth/session        # Get current session
POST /api/auth/verify-email   # Email verification
POST /api/auth/verify-sms     # SMS verification
```

### Artist Management
```
GET    /api/artists           # List all artists
POST   /api/artists           # Create artist
GET    /api/artists/:id       # Get artist details
PUT    /api/artists/:id       # Update artist
DELETE /api/artists/:id       # Delete artist
GET    /api/artists/me        # Get current user's artist profile
```

### Song Management
```
GET    /api/songs             # List all songs
POST   /api/songs             # Create song
GET    /api/songs/:id         # Get song details
PUT    /api/songs/:id         # Update song
DELETE /api/songs/:id         # Delete song
GET    /api/songs/search      # Search songs
```

### Stem Management
```
GET    /api/stems             # List all stems
POST   /api/stems             # Create stem
GET    /api/stems/:id         # Get stem details
PUT    /api/stems/:id         # Update stem
DELETE /api/stems/:id         # Delete stem
```

### Playlist Management
```
GET    /api/playlists         # List all playlists
POST   /api/playlists         # Create playlist
GET    /api/playlists/:id     # Get playlist details
PUT    /api/playlists/:id     # Update playlist
DELETE /api/playlists/:id     # Delete playlist
POST   /api/playlists/:id/songs # Add song to playlist
DELETE /api/playlists/:id/songs/:songId # Remove song from playlist
```

### Project Management
```
GET    /api/projects          # List all projects
POST   /api/projects          # Create project
GET    /api/projects/:id      # Get project details
PUT    /api/projects/:id      # Update project
DELETE /api/projects/:id      # Delete project
```

### Analytics & Reporting
```
GET    /api/monthly-statements        # List earnings statements
GET    /api/monthly-statements/user   # Get user's earnings
GET    /api/download-history          # List download history
GET    /api/download-history/user     # Get user's downloads
```

### Export System
```
POST   /api/export/creations/pdf      # Export creations as PDF
POST   /api/export/creations/excel    # Export creations as Excel
POST   /api/export/earnings/pdf       # Export earnings as PDF
POST   /api/export/earnings/excel     # Export earnings as Excel
```

## Production Deployment Steps

### 1. Environment Setup
```bash
# Create production environment file
cp .env.example .env.production

# Edit environment variables
nano .env.production

# Set production values for all required variables
```

### 2. Database Setup
```bash
# Create production database
docker exec -it msc-co-postgres psql -U msc_co_user -d postgres
CREATE DATABASE msc_co_prod;
GRANT ALL PRIVILEGES ON DATABASE msc_co_prod TO msc_co_user;
\q

# Run database migrations
docker exec -it msc-co-backend npm run strapi database:migrate
```

### 3. SSL Certificate Setup
```bash
# Using Let's Encrypt
sudo certbot certonly --standalone -d your-domain.com
sudo certbot certonly --standalone -d www.your-domain.com

# Update nginx configuration
sudo nano /etc/nginx/sites-available/msc-and-co
```

### 4. Domain Configuration
```nginx
# Nginx configuration
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /admin {
        proxy_pass http://localhost:1337;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5. Monitoring Setup
```bash
# Install monitoring tools
sudo apt-get install htop iotop nethogs

# Set up log rotation
sudo nano /etc/logrotate.d/msc-and-co

# Configure application monitoring
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v /path/to/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

### 6. Backup Strategy
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec msc-co-postgres pg_dump -U msc_co_user msc_co_prod > backup_$DATE.sql
gzip backup_$DATE.sql
aws s3 cp backup_$DATE.sql.gz s3://your-backup-bucket/

# File backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf uploads_backup_$DATE.tar.gz /path/to/uploads/
aws s3 cp uploads_backup_$DATE.tar.gz s3://your-backup-bucket/
```

## Performance Optimization

### Frontend Optimization
```javascript
// Next.js configuration
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@headlessui/react', 'react-icons'],
  },
  compress: true,
  poweredByHeader: false,
}
```

### Backend Optimization
```javascript
// Strapi configuration
module.exports = {
  server: {
    port: 1337,
    host: '0.0.0.0',
  },
  database: {
    connection: {
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100,
      },
    },
  },
  cache: {
    enabled: true,
    type: 'redis',
    max: 32767,
    ttl: 3600000,
  },
}
```

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_songs_artist ON songs(artist_id);
CREATE INDEX idx_songs_genre ON songs(genre_id);
CREATE INDEX idx_downloads_song ON download_history(song_id);
CREATE INDEX idx_downloads_date ON download_history(created_at);
CREATE INDEX idx_earnings_artist ON monthly_statements(artist_id);
CREATE INDEX idx_earnings_month_year ON monthly_statements(month, year);
```

## Security Checklist

### Authentication Security
- [ ] Auth0 configured with proper scopes
- [ ] JWT tokens have appropriate expiration
- [ ] Role-based access control implemented
- [ ] Multi-factor authentication enabled
- [ ] Session management secure

### Data Security
- [ ] Database encrypted at rest
- [ ] HTTPS enabled for all traffic
- [ ] Input validation implemented
- [ ] SQL injection protection
- [ ] XSS protection enabled

### Infrastructure Security
- [ ] Firewall configured
- [ ] SSH key-based authentication
- [ ] Regular security updates
- [ ] Monitoring and alerting
- [ ] Backup encryption

## Troubleshooting

### Common Issues

#### Frontend Not Loading
```bash
# Check container status
docker-compose ps

# View frontend logs
docker logs msc-co-frontend

# Restart frontend
docker-compose restart frontend
```

#### Backend API Errors
```bash
# Check backend logs
docker logs msc-co-backend

# Verify database connection
docker exec -it msc-co-postgres psql -U msc_co_user -d msc_co_prod

# Restart backend
docker-compose restart backend
```

#### Database Connection Issues
```bash
# Check database status
docker exec -it msc-co-postgres pg_isready -U msc_co_user

# View database logs
docker logs msc-co-postgres

# Restart database
docker-compose restart postgres
```

#### Memory Issues
```bash
# Check memory usage
docker stats

# Increase memory limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G
```

### Performance Issues

#### Slow Page Loads
```bash
# Check frontend bundle size
npm run build
npm run analyze

# Optimize images
npm run optimize-images

# Enable compression
# Add to nginx configuration
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

#### Slow API Responses
```bash
# Check database query performance
docker exec -it msc-co-postgres psql -U msc_co_user -d msc_co_prod
EXPLAIN ANALYZE SELECT * FROM songs WHERE artist_id = 1;

# Add database indexes
# See Database Optimization section above
```

## Maintenance Procedures

### Regular Maintenance
```bash
# Weekly database backup
0 2 * * 0 /path/to/backup-script.sh

# Monthly security updates
0 3 1 * * apt-get update && apt-get upgrade -y

# Daily log rotation
0 0 * * * /usr/sbin/logrotate /etc/logrotate.d/msc-and-co

# Weekly performance monitoring
0 4 * * 1 /path/to/performance-check.sh
```

### Emergency Procedures
```bash
# Database recovery
docker exec -it msc-co-postgres psql -U msc_co_user -d msc_co_prod < backup_20241201_120000.sql

# Service restart
docker-compose down
docker-compose up -d

# Rollback deployment
git checkout previous-version
docker-compose build
docker-compose up -d
```

This deployment guide provides comprehensive instructions for deploying the MSC & Co platform to production with proper security, performance, and maintenance considerations. 