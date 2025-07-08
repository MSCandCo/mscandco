# AudioStems Platform

Enterprise-grade music licensing platform with advanced audio processing, AI-powered recommendations, and comprehensive AWS infrastructure.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (for containerized deployment)
- AWS CLI (for infrastructure deployment)

### Development Setup

1. **Install dependencies:**
   ```bash
   npm run setup
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

This will start both services:
- **Backend (Strapi):** http://localhost:1337/admin
- **Frontend (Next.js):** http://localhost:3000

### Individual Service Commands

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

## 🏗️ Architecture

### Backend (Strapi)
- **Location:** `audiostems-backend/`
- **Port:** 1337
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Features:**
  - Content management for songs, stems, artists
  - User authentication & permissions
  - Stripe integration for payments
  - S3 file uploads
  - REST & GraphQL APIs

### Frontend (Next.js)
- **Location:** `audiostems-frontend/`
- **Port:** 3000
- **Features:**
  - Modern React with TypeScript
  - Tailwind CSS for styling
  - Audio player with waveform visualization
  - User dashboard & analytics
  - Responsive design

### Infrastructure (AWS)
- **Location:** `infrastructure/aws/`
- **Components:**
  - Multi-AZ Aurora PostgreSQL cluster
  - Redis caching layer
  - CloudFront CDN
  - Application Load Balancer
  - EKS Kubernetes cluster
  - CloudWatch monitoring

## 🎵 Audio Processing

### Microservices
- **Audio Processing:** `audio-processing/`
- **AI Intelligence:** `auditus-ai/`

### Features
- High-quality audio stem separation
- AI-powered music tagging
- Real-time waveform generation
- Automated metadata extraction

## 🔧 Development Commands

```bash
# Install all dependencies
npm run setup

# Start both services
npm run dev

# Build for production
npm run build

# Start production servers
npm run start

# Clean all node_modules
npm run clean
```

## 🌐 Production Deployment

### AWS Infrastructure
```bash
cd infrastructure/aws/database
terraform init
terraform plan
terraform apply
```

### Docker Deployment
```bash
docker-compose up -d
```

## 📊 Monitoring & Analytics

- **CloudWatch:** Application metrics and logs
- **Prometheus:** Custom metrics collection
- **Grafana:** Visualization dashboards

## 🔐 Security Features

- JWT authentication
- Role-based access control
- API rate limiting
- SSL/TLS encryption
- AWS WAF protection

## 🎯 Business Features

- **Advanced Analytics:** Real-time revenue tracking
- **Royalty Distribution:** Automated payment processing
- **Enterprise Auth:** SSO integration
- **API Integrations:** Third-party service connections
- **Compliance:** GDPR, SOC 2, PCI DSS

## 📁 Project Structure

```
├── audiostems-backend/     # Strapi CMS
├── audiostems-frontend/    # Next.js frontend
├── audio-processing/       # Audio processing service
├── auditus-ai/           # AI intelligence service
├── infrastructure/        # AWS Terraform configs
├── monitoring/           # Prometheus & Grafana
└── docs/                # Documentation
```

## 🚦 Status

✅ **Development Environment:** Running successfully
✅ **Backend API:** Strapi CMS operational
✅ **Frontend:** Next.js application running
✅ **AWS Database:** Aurora PostgreSQL deployed
🔄 **Audio Processing:** In development
🔄 **AI Services:** In development

## 📞 Support

For development issues or questions, check the logs:
- Backend: `audiostems-backend/logs/`
- Frontend: Browser developer tools
- Infrastructure: AWS CloudWatch

## 🔄 Recent Updates

- ✅ Fixed npm command issues from root directory
- ✅ Resolved port conflicts (1337, 3000)
- ✅ Updated Next.js to latest version
- ✅ Created unified development scripts
- ✅ Deployed production Aurora PostgreSQL cluster
- ✅ Implemented concurrent service management 