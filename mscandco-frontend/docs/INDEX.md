# MSC & Co Platform Documentation Index

**Last Updated:** October 29, 2024
**Platform Version:** 1.0.0
**Documentation Version:** 1.0

## Overview

This documentation repository contains comprehensive technical and business documentation for the MSC & Co music distribution platform.

## Documentation Structure

### 📚 Getting Started

| Document | Description | Audience |
|----------|-------------|----------|
| [README.md](../README.md) | Quick start guide and platform overview | All users |
| [BUSINESS_OVERVIEW.md](BUSINESS_OVERVIEW.md) | Business model, market strategy, and competitive analysis | Business stakeholders |
| [USER_GUIDE.md](USER_GUIDE.md) | Complete user manual for artists and label admins | End users |

### 🏗️ Technical Documentation

#### Architecture & Design

| Document | Description | Audience |
|----------|-------------|----------|
| [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) | Complete technical architecture, tech stack, and design patterns | Developers, Architects |
| [APP_ROUTER_MIGRATION.md](APP_ROUTER_MIGRATION.md) | Next.js App Router migration guide and patterns | Frontend developers |

#### Development

| Document | Description | Audience |
|----------|-------------|----------|
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Complete API reference for all endpoints | Developers, API consumers |
| [PERMISSION_QUICK_REFERENCE.md](PERMISSION_QUICK_REFERENCE.md) | Permission system reference and implementation guide | Developers |

#### Security & Access Control

| Document | Description | Audience |
|----------|-------------|----------|
| [RBAC_IMPLEMENTATION.md](RBAC_IMPLEMENTATION.md) | Role-Based Access Control implementation details | Developers, Security team |
| [SECURITY_FIXES_FINAL.md](SECURITY_FIXES_FINAL.md) | Security audit results and fixes applied | Security team, DevOps |
| [PUBLIC_ROUTES_SECURITY_REVIEW.md](PUBLIC_ROUTES_SECURITY_REVIEW.md) | Public route security analysis | Security team |

### 🚀 Operations

#### Deployment & Infrastructure

| Document | Description | Audience |
|----------|-------------|----------|
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Complete deployment procedures and environment setup | DevOps, System administrators |
| [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md) | Email infrastructure, templates, and delivery | DevOps, Developers |
| [SUPABASE_EMAIL_CONFIGURATION.md](SUPABASE_EMAIL_CONFIGURATION.md) | Supabase email authentication redirect URLs and setup | Developers, DevOps |

#### Project Management

| Document | Description | Audience |
|----------|-------------|----------|
| [RBAC_DEPLOYMENT_CHECKLIST.md](RBAC_DEPLOYMENT_CHECKLIST.md) | RBAC deployment verification checklist | DevOps, QA |
| [RBAC_PROGRESS_TRACKER.md](RBAC_PROGRESS_TRACKER.md) | RBAC implementation progress tracking | Project managers |
| [RBAC_PHASE3_AUDIT.md](RBAC_PHASE3_AUDIT.md) | Phase 3 audit findings and recommendations | Project managers, Developers |

## Quick Links by Role

### For Developers

**Getting Started:**
1. [README.md](../README.md) - Setup development environment
2. [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) - Understand the architecture
3. [APP_ROUTER_MIGRATION.md](APP_ROUTER_MIGRATION.md) - Learn App Router patterns

**Building Features:**
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API endpoints and usage
- [PERMISSION_QUICK_REFERENCE.md](PERMISSION_QUICK_REFERENCE.md) - Implement permissions
- [RBAC_IMPLEMENTATION.md](RBAC_IMPLEMENTATION.md) - Access control system

**Deployment:**
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Deploy to production
- [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md) - Configure email delivery
- [SUPABASE_EMAIL_CONFIGURATION.md](SUPABASE_EMAIL_CONFIGURATION.md) - Configure Supabase auth emails

### For DevOps/System Administrators

**Infrastructure Setup:**
1. [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Complete deployment process
2. [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md) - Email system configuration
3. [SUPABASE_EMAIL_CONFIGURATION.md](SUPABASE_EMAIL_CONFIGURATION.md) - Supabase auth setup
4. [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) - Architecture overview

**Security:**
- [SECURITY_FIXES_FINAL.md](SECURITY_FIXES_FINAL.md) - Security measures
- [PUBLIC_ROUTES_SECURITY_REVIEW.md](PUBLIC_ROUTES_SECURITY_REVIEW.md) - Route security
- [RBAC_IMPLEMENTATION.md](RBAC_IMPLEMENTATION.md) - Access control

**Maintenance:**
- [RBAC_DEPLOYMENT_CHECKLIST.md](RBAC_DEPLOYMENT_CHECKLIST.md) - Deployment verification
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#monitoring--maintenance) - Monitoring setup

### For Project Managers

**Project Overview:**
1. [BUSINESS_OVERVIEW.md](BUSINESS_OVERVIEW.md) - Business context
2. [RBAC_PROGRESS_TRACKER.md](RBAC_PROGRESS_TRACKER.md) - Implementation progress
3. [RBAC_PHASE3_AUDIT.md](RBAC_PHASE3_AUDIT.md) - Audit findings

**Planning:**
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md#future-architecture-enhancements) - Roadmap
- [BUSINESS_OVERVIEW.md](BUSINESS_OVERVIEW.md#growth-strategy) - Growth strategy
- [RBAC_DEPLOYMENT_CHECKLIST.md](RBAC_DEPLOYMENT_CHECKLIST.md) - Checklists

### For Business Stakeholders

**Understanding the Platform:**
1. [BUSINESS_OVERVIEW.md](BUSINESS_OVERVIEW.md) - Complete business overview
2. [USER_GUIDE.md](USER_GUIDE.md) - User perspective
3. [README.md](../README.md) - Platform introduction

**Strategy & Growth:**
- [BUSINESS_OVERVIEW.md](BUSINESS_OVERVIEW.md#competitive-advantages) - Competitive position
- [BUSINESS_OVERVIEW.md](BUSINESS_OVERVIEW.md#growth-strategy) - Growth plans
- [BUSINESS_OVERVIEW.md](BUSINESS_OVERVIEW.md#service-offerings) - Product offerings

### For End Users (Artists/Labels)

**Getting Started:**
1. [USER_GUIDE.md](USER_GUIDE.md#getting-started) - Account setup
2. [USER_GUIDE.md](USER_GUIDE.md#creating-a-release) - First release
3. [USER_GUIDE.md](USER_GUIDE.md#support--help) - Getting help

**Using the Platform:**
- [USER_GUIDE.md](USER_GUIDE.md#analytics-dashboard) - Understanding analytics
- [USER_GUIDE.md](USER_GUIDE.md#earnings--wallet) - Managing earnings
- [USER_GUIDE.md](USER_GUIDE.md#marketing-tools) - Promotion tools

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18.2
- **Styling**: TailwindCSS
- **Components**: Radix UI, Flowbite React

### Backend
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Email**: Resend via Supabase Edge Functions

### Infrastructure
- **Hosting**: Vercel
- **Monitoring**: Sentry, PostHog
- **Caching**: Upstash Redis
- **Background Jobs**: Inngest
- **Payments**: Revolut Business API

For detailed technology information, see [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md).

## Key Concepts

### Multi-Brand Architecture
MSC & Co operates two specialized brands:
- **MSC & Co MSC**: Gospel and Christian music
- **Audio MSC**: General music and sync licensing

See [BUSINESS_OVERVIEW.md](BUSINESS_OVERVIEW.md#competitive-advantages) for details.

### Permission System
Role-Based Access Control (RBAC) with format: `resource:action:scope`

Example: `release:read:own` = Read own releases

See [PERMISSION_QUICK_REFERENCE.md](PERMISSION_QUICK_REFERENCE.md) for complete reference.

### App Router Architecture
Server Components by default, Client Components with `'use client'`

See [APP_ROUTER_MIGRATION.md](APP_ROUTER_MIGRATION.md) for patterns and best practices.

## API Overview

### Base URLs
- **Development**: `http://localhost:3013/api`
- **Staging**: `https://staging.mscandco.com/api`
- **Production**: `https://mscandco.com/api`

### Authentication
All protected endpoints require Supabase session cookies or Bearer token.

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md#authentication) for complete API reference.

## Development Workflow

### 1. Local Development Setup
```bash
# Clone repository
git clone <repository-url>
cd mscandco-frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

See [README.md](../README.md#getting-started) for detailed setup.

### 2. Creating Features
1. Create feature branch
2. Implement with App Router conventions
3. Add permission checks
4. Write tests
5. Update documentation
6. Submit pull request

See [APP_ROUTER_MIGRATION.md](APP_ROUTER_MIGRATION.md#migration-checklist) for migration checklist.

### 3. Testing
```bash
# Run tests
npm run test:e2e

# Check permissions
node scripts/check-permissions.js
```

### 4. Deployment
```bash
# Deploy to production
vercel --prod
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete deployment process.

## Common Tasks

### Adding a New Permission

1. **Add to database**:
```sql
INSERT INTO permissions (name, description, category)
VALUES ('feature:new:own', 'Access new feature', 'feature');
```

2. **Assign to role**:
```sql
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Artist' AND p.name = 'feature:new:own';
```

3. **Update documentation**: [PERMISSION_QUICK_REFERENCE.md](PERMISSION_QUICK_REFERENCE.md)

See [PERMISSION_QUICK_REFERENCE.md](PERMISSION_QUICK_REFERENCE.md#permission-migration) for details.

### Creating an API Endpoint

1. **Create route handler**: `app/api/endpoint/route.js`
2. **Add authentication check**
3. **Add permission check**
4. **Implement business logic**
5. **Document in** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API patterns.

### Adding an Email Template

1. **Create HTML template**: `email-templates/new-template.html`
2. **Upload to Supabase Storage**
3. **Document template variables**
4. **Test template**

See [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md#creating-new-templates) for details.

## Troubleshooting

### Common Issues

| Issue | Solution | Reference |
|-------|----------|-----------|
| Build failures | Clear cache, check logs | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#troubleshooting) |
| Permission denied | Check RBAC policies, user permissions | [PERMISSION_QUICK_REFERENCE.md](PERMISSION_QUICK_REFERENCE.md#troubleshooting-permissions) |
| Email not sending | Check Edge Function logs, verify DNS | [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md#troubleshooting) |
| Database connection | Verify Supabase credentials, check RLS | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#troubleshooting) |

## Support & Resources

### Internal Resources
- **Code Repository**: GitHub (private)
- **Design Files**: Figma (link in project Slack)
- **Project Management**: [Your PM tool]
- **Team Chat**: Slack #mscandco-dev

### External Resources
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Vercel Docs**: https://vercel.com/docs

### Getting Help

**Technical Questions:**
- Email: tech@mscandco.com
- Slack: #mscandco-dev

**Business Questions:**
- Email: business@mscandco.com

**User Support:**
- Email: support@mscandco.com
- Help Center: https://help.mscandco.com

## Contributing

### Documentation Updates

1. Create branch for documentation changes
2. Update relevant markdown files
3. Update this index if adding new documents
4. Submit pull request
5. Request review from team

### Code Style
- Follow Next.js conventions
- Use ESLint configuration
- Write descriptive commit messages
- Add comments for complex logic

See [README.md](../README.md#contributing) for contribution guidelines.

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2024-10-29 | Initial comprehensive documentation release |
| - | - | Includes all technical and business docs |
| - | - | App Router migration complete |
| - | - | RBAC implementation documented |

## License

This documentation is proprietary and confidential.
© 2024 MSC & Co. All rights reserved.

---

**Need to add new documentation?**
Create the document in the `docs/` folder and update this index with a link and description.

**Found an error?**
Contact the team or create an issue in the repository.

**Documentation outdated?**
Please update the relevant document and update the "Last Updated" date.
