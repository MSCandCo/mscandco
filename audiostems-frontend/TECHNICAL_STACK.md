# Technical Architecture - MSC & Co Platform

## Frontend Architecture

### Core Technologies
- **Next.js 15.3.5** - React framework with SSR/SSG capabilities
- **React 18** - Component-based UI library
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Accessible UI components

### Key Dependencies
```json
{
  "next": "15.3.5",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "tailwindcss": "^3.4.0",
  "@headlessui/react": "^1.7.17",
  "@heroicons/react": "^2.0.18",
  "react-icons": "^4.12.0",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "swr": "^2.2.4",
  "next-auth": "^4.24.5",
  "lucide-react": "^0.294.0"
}
```

### Authentication System
- **Auth0** - Enterprise authentication provider
- **NextAuth.js** - Next.js authentication wrapper
- **Multi-brand support** - YHWH MSC and Audio MSC
- **Role-based access control** - 5 distinct user roles
- **JWT tokens** - Secure session management

### State Management
- **SWR** - Data fetching and caching
- **React Context** - Global state management
- **Local Storage** - Client-side persistence
- **Session Storage** - Temporary session data

### UI/UX Components
- **Custom Design System** - MSC & Co branded components
- **Responsive Design** - Mobile-first approach
- **Dark/Light Mode** - Theme switching capability
- **Loading States** - Skeleton screens and spinners
- **Error Boundaries** - Graceful error handling

## Backend Architecture

### Core Technologies
- **Strapi 4.25.x** - Headless CMS and API framework
- **Node.js 20** - JavaScript runtime
- **PostgreSQL 15** - Primary database
- **Redis 7** - Caching and session storage

### Database Schema
```sql
-- Core Content Types
- users (Auth0 integration)
- artists (artist profiles)
- songs (music tracks)
- stems (individual track components)
- playlists (curated collections)
- projects (release management)
- genres (music classification)
- monthly-statements (earnings reports)
- download-history (tracking)
- lyrics (song text content)
- export-reports (generated reports)
```

### API Structure
```
/api/
├── auth/           # Authentication endpoints
├── artist/         # Artist management
├── song/           # Song CRUD operations
├── stem/           # Stem management
├── playlist/       # Playlist operations
├── project/        # Project management
├── export/         # Report generation
├── monthly-statement/ # Earnings data
└── download-history/  # Usage tracking
```

### File Management
- **Local Storage** - Development file storage
- **Cloudinary** - Production image/file hosting
- **AWS S3** - Scalable file storage (configured)
- **File Upload** - Multi-format support

### Export System
- **PDF Generation** - jsPDF library
- **Excel Export** - SheetJS library
- **Custom Templates** - Branded report formats
- **Scheduled Reports** - Automated generation

## Deployment Architecture

### Docker Configuration
```yaml
# Multi-container setup
- frontend (Next.js)
- backend (Strapi)
- postgres (Database)
- redis (Cache)
- nginx (Reverse proxy)
- adminer (Database management - dev only)
```

### Container Specifications
- **Frontend**: Node.js 20 Alpine, port 3000
- **Backend**: Node.js 20 Alpine, port 1337
- **PostgreSQL**: 15 Alpine, port 5432
- **Redis**: 7 Alpine, port 6379
- **Nginx**: Alpine, ports 80/443

### Health Monitoring
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

### Resource Limits
```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '1.0'
    reservations:
      memory: 512M
      cpus: '0.5'
```

## Environment Configuration

### Required Environment Variables
```bash
# Auth0 Configuration
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_MANAGEMENT_TOKEN=

# Database Configuration
DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=msc_co_dev
DATABASE_USERNAME=msc_co_user
DATABASE_PASSWORD=msc_co_password

# Strapi Configuration
APP_KEYS=
API_TOKEN_SALT=
ADMIN_JWT_SECRET=
JWT_SECRET=

# File Upload
CLOUDINARY_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

# Email Service
SENDGRID_API_KEY=
EMAIL_FROM=noreply@mscandco.com

# SMS Service
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Stripe Integration
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Security Architecture

### Authentication & Authorization
- **Auth0 OAuth 2.0** - Enterprise-grade authentication
- **JWT Tokens** - Stateless session management
- **Role-based Access Control** - Granular permissions
- **Multi-factor Authentication** - SMS/Email verification
- **Session Management** - Secure token handling

### Data Protection
- **HTTPS/SSL** - Encrypted data transmission
- **Database Encryption** - At-rest data protection
- **Input Validation** - XSS and injection prevention
- **CORS Configuration** - Cross-origin security
- **Rate Limiting** - API abuse prevention

### File Security
- **Upload Validation** - File type and size restrictions
- **Virus Scanning** - Malware protection
- **Access Control** - File permission management
- **Backup Encryption** - Secure data backups

## Performance Optimization

### Frontend Optimization
- **Code Splitting** - Dynamic imports
- **Image Optimization** - Next.js image component
- **Bundle Analysis** - Webpack bundle optimization
- **Caching Strategy** - SWR caching
- **Lazy Loading** - Component-level optimization

### Backend Optimization
- **Database Indexing** - Query performance
- **Redis Caching** - Session and data caching
- **Connection Pooling** - Database efficiency
- **API Response Caching** - Strapi caching
- **File Compression** - Gzip compression

### CDN & Caching
- **Static Asset CDN** - Global content delivery
- **API Response Caching** - Redis-based caching
- **Browser Caching** - HTTP cache headers
- **Database Query Caching** - Query result caching

## Monitoring & Logging

### Application Monitoring
- **Health Checks** - Container health monitoring
- **Error Tracking** - Sentry integration ready
- **Performance Metrics** - Response time tracking
- **Uptime Monitoring** - Service availability

### Logging Strategy
- **Structured Logging** - JSON format logs
- **Log Levels** - Debug, Info, Warn, Error
- **Log Aggregation** - Centralized log collection
- **Log Retention** - Configurable retention policies

## Development Workflow

### Local Development
```bash
# Start development environment
docker-compose up -d

# Access services
Frontend: http://localhost:3000
Backend: http://localhost:1337/admin
Database: localhost:5432
Redis: localhost:6379
```

### Build Process
```bash
# Frontend build
npm run build
npm run start

# Backend build
npm run develop
npm run build
npm run start
```

### Testing Strategy
- **Unit Tests** - Component and function testing
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Full user workflow testing
- **Performance Tests** - Load and stress testing

## Scalability Considerations

### Horizontal Scaling
- **Load Balancing** - Nginx reverse proxy
- **Container Orchestration** - Kubernetes ready
- **Database Replication** - Read replicas
- **Cache Clustering** - Redis cluster

### Vertical Scaling
- **Resource Monitoring** - CPU/Memory tracking
- **Auto-scaling** - Cloud provider integration
- **Database Optimization** - Query optimization
- **CDN Integration** - Global content delivery

## Backup & Recovery

### Database Backups
- **Automated Backups** - Daily database snapshots
- **Point-in-time Recovery** - Transaction log backups
- **Cross-region Replication** - Disaster recovery
- **Backup Encryption** - Secure backup storage

### Application Backups
- **Configuration Backups** - Environment settings
- **File Storage Backups** - User uploads
- **Code Repository** - Version control
- **Documentation** - System documentation

## Future Enhancements

### Planned Features
- **Real-time Notifications** - WebSocket integration
- **Advanced Analytics** - Machine learning insights
- **Mobile App** - React Native application
- **API Rate Limiting** - Advanced throttling
- **Multi-language Support** - Internationalization
- **Advanced Search** - Elasticsearch integration 