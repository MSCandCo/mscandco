# AudioStems 🎵

> **Enterprise-Grade Music Licensing Platform**  
> The next-generation sync licensing platform designed to surpass industry leaders like Musicbed, Epidemic Sound, and Artlist.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/Audiostems/audiostems-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/Audiostems/audiostems-backend/actions/workflows/ci.yml)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-Infrastructure-orange.svg)](https://aws.amazon.com/)
[![Strapi](https://img.shields.io/badge/Strapi-4.17.1-purple.svg)](https://strapi.io/)
[![Next.js](https://img.shields.io/badge/Next.js-13.5.6-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Features

### Core Platform
- **Multi-Region AWS Infrastructure** - Enterprise-grade scalability
- **Advanced Audio Processing** - FLAC, 320kbps MP3, waveform generation
- **AI-Powered Recommendations** - Auditus Intelligence for smart music discovery
- **Real-Time Analytics** - Comprehensive business insights
- **Enterprise Authentication** - SSO, role-based access control
- **Advanced Licensing** - Custom terms, automated royalty distribution

### Technical Stack
- **Backend**: Strapi CMS with PostgreSQL & Redis
- **Frontend**: Next.js with Tailwind CSS
- **AI Services**: Python FastAPI with PyTorch
- **Infrastructure**: AWS EKS, Aurora, CloudFront, S3
- **Monitoring**: Prometheus, Grafana, CloudWatch
- **CI/CD**: GitHub Actions with automated testing

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- Python 3.9+
- AWS CLI (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Audiostems/audiostems-backend.git
   cd audiostems-backend
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Or run services individually**

   **Backend (Strapi)**
   ```bash
   cd audiostems-backend
   npm install
   npm run develop
   # Access admin panel: http://localhost:1337/admin
   ```

   **Frontend (Next.js)**
   ```bash
   cd audiostems-frontend
   npm install
   npm run dev
   # Access frontend: http://localhost:3000
   ```

   **AI Services**
   ```bash
   cd auditus-ai
   pip install -r requirements.txt
   python src/api.py
   # AI service: http://localhost:8000
   ```

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Services   │
│   (Next.js)     │◄──►│   (Strapi)      │◄──►│   (FastAPI)     │
│   Port: 3000    │    │   Port: 1337    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Infrastructure │
                    │   (AWS)         │
                    └─────────────────┘
```

### AWS Infrastructure

- **EKS Cluster** - Container orchestration
- **Aurora PostgreSQL** - Primary database with read replicas
- **ElastiCache Redis** - Caching and session storage
- **S3 + CloudFront** - Static assets and CDN
- **ALB + WAF** - Load balancing and security
- **CloudWatch** - Monitoring and alerting

### Microservices

1. **Strapi Backend** - Content management and API
2. **Next.js Frontend** - User interface and client-side logic
3. **Auditus AI** - Music analysis and recommendations
4. **Audio Processing** - File conversion and waveform generation

## 🛠️ Development

### Project Structure

```
audiostems-backend/
├── audiostems-backend/     # Strapi CMS backend
├── audiostems-frontend/    # Next.js frontend
├── auditus-ai/            # AI recommendation service
├── audio-processing/       # Audio processing pipeline
├── infrastructure/         # AWS Terraform configs
├── monitoring/            # Prometheus & Grafana
├── docs/                 # Documentation
└── docker-compose.yml    # Local development
```

### Environment Variables

Create `.env.local` files in each service directory:

**Backend (.env.development)**
```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret
```

**Frontend (.env.local)**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
STRAPI_API_URL=http://localhost:1337
```

### Database Setup

The platform uses SQLite for local development and PostgreSQL for production:

```bash
# Local development (SQLite)
npm run develop

# Production (PostgreSQL)
npm run build
npm run start
```

## 🚀 Deployment

### AWS Deployment

1. **Configure AWS credentials**
   ```bash
   aws configure
   ```

2. **Deploy infrastructure**
   ```bash
   cd infrastructure/aws
   terraform init
   terraform plan
   terraform apply
   ```

3. **Deploy applications**
   ```bash
   ./deploy.sh
   ```

### Docker Deployment

```bash
# Build and push images
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml push

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 API Documentation

### Strapi API Endpoints

- **Content Types**: `/api/songs`, `/api/stems`, `/api/artists`
- **Authentication**: `/api/auth/local`, `/api/auth/google`
- **Users**: `/api/users`, `/api/users/me`
- **Media**: `/api/upload`

### AI Service Endpoints

- **Analysis**: `POST /api/analyze`
- **Recommendations**: `GET /api/recommendations`
- **Tagging**: `POST /api/tag`

### Frontend API Routes

- **Authentication**: `/api/auth/[...nextauth]`
- **Proxy**: `/api/req/[...path]`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **Backend**: ESLint + Prettier
- **Frontend**: ESLint + Prettier + TypeScript
- **Python**: Black + Flake8
- **Testing**: Jest + Cypress

## 📊 Monitoring

### Health Checks

- **Backend**: `http://localhost:1337/health`
- **Frontend**: `http://localhost:3000/api/health`
- **AI Service**: `http://localhost:8000/health`

### Metrics

- **Application**: Prometheus + Grafana
- **Infrastructure**: CloudWatch
- **Logs**: CloudWatch Logs

## 🔒 Security

- **Authentication**: JWT + OAuth2
- **Authorization**: Role-based access control
- **Data Protection**: Encryption at rest and in transit
- **Compliance**: GDPR, SOC2 ready
- **Security Headers**: CSP, HSTS, X-Frame-Options

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/Audiostems/audiostems-backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Audiostems/audiostems-backend/discussions)
- **Email**: support@audiostems.com

## 🙏 Acknowledgments

- **Strapi** - Headless CMS
- **Next.js** - React framework
- **AWS** - Cloud infrastructure
- **OpenAI** - AI capabilities
- **FFmpeg** - Audio processing

---

**AudioStems** - Revolutionizing music licensing for the digital age 🎵 