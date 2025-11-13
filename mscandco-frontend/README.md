# MSC & Co - AI-Native Music Distribution Platform

**The world's first AI-native, blockchain-verified, carbon-neutral music distribution platform**

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit http://localhost:3013

## 📚 Documentation

All documentation is organized in the `/docs/` directory:

### Essential Documentation
- **[Technical Documentation](docs/architecture/ULTIMATE_TECHNICAL_DOCUMENTATION.md)** - Complete technical reference
- **[Business Documentation](docs/business/ULTIMATE_BUSINESS_DOCUMENTATION.md)** - Business model, pricing, features
- **[Deployment Guide](docs/deployment/DEPLOYMENT_VERIFICATION_COMPLETE.md)** - Latest deployment status

### Architecture & Development
- [Database Structure](docs/architecture/DATABASE_STRUCTURE_REPORT.md)
- [Role System](docs/architecture/COMPLETE_ROLE_SYSTEM_DOCUMENTATION.md)
- [Page Listing by Role](docs/architecture/COMPLETE_PAGE_LISTING_BY_ROLE.md)

### Features
- [Cleared Integration (Sample Clearance)](docs/features/CLEARED_INTEGRATION_SUMMARY.md)
- [Enterprise Stack](docs/features/ENTERPRISE_STACK.md)
- [12 Features Summary](docs/features/12_FEATURES_COMPLETION_SUMMARY.md)

### Setup Guides
- [Environment Variables](docs/setup/ENV_SETUP.md)
- [Email Setup](docs/setup/EMAIL_SETUP_GUIDE.md)
- [Supabase CLI](docs/setup/SETUP_SUPABASE_CLI.md)
- [Revolut Integration](docs/setup/REVOLUT_INTEGRATION_SETUP.md)
- [Claude Code Guide](docs/setup/CLAUDE_CODE_INSTRUCTIONS.md)

### Deployment
- [Production Deployment Guide](docs/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Deployment Checklist](docs/deployment/DEPLOYMENT_CHECKLIST.md)
- [Staging Deployment](docs/deployment/STAGING_DEPLOYMENT_GUIDE.md)

## 🎯 Core Features

### Industry-First Features
1. 🛡️ **Sample Clearance Protection** - Pre-publication lawsuit prevention
2. 🌍 **Carbon Offset Tracking** - Environmental impact monitoring
3. ⛓️ **Blockchain Registration** - Immutable proof of ownership
4. 🤖 **AI Hit Prediction** - ML-powered success forecasting

### Distribution
- Global distribution to 150+ platforms
- Automated splits and royalty management
- Real-time analytics and insights
- Release scheduling and planning

### Artist Tools
- AI artwork generation
- Lyrics analysis and suggestions
- Playlist pitching automation
- Social media scheduling
- Fan engagement analytics
- Merchandise integration
- Learning & development platform

### Business Features
- Multi-tier pricing (Free, Pro, MPP Partner, MSC Business)
- Label management tools
- White-label options
- Revenue share management
- Investment fund applications

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Revolut, Stripe
- **AI**: OpenAI GPT-4
- **Analytics**: PostHog
- **Error Tracking**: Sentry
- **Hosting**: Vercel
- **Email**: Supabase (Resend)

## 🗂️ Project Structure

```
/app              - Next.js 15 App Router pages
  /api            - API routes
  /artist         - Artist dashboard
  /labeladmin     - Label admin dashboard
  /superadmin     - Super admin dashboard
  /admin          - System admin pages
/components       - React components
/lib              - Utilities and services
/docs             - Documentation
/scripts          - Maintenance scripts
/tests            - Test files
/supabase         - Database migrations
```

## 🔐 Environment Variables

See [ENV_SETUP.md](docs/setup/ENV_SETUP.md) for complete list.

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional (for features):
- `CLEARED_API_KEY` - Sample clearance
- `REVOLUT_API_KEY` - Payments
- `OPENAI_API_KEY` - AI features
- Social media OAuth keys

## 🧪 Testing

```bash
# Run test script
node test-cleared.js

# E2E tests
npm run test:e2e
```

## 📦 Deployment

```bash
# Deploy to Vercel
vercel --prod

# Apply database migrations
supabase db push
```

See [DEPLOYMENT_VERIFICATION_COMPLETE.md](docs/deployment/DEPLOYMENT_VERIFICATION_COMPLETE.md) for detailed deployment guide.

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/mscandco/mscandco-frontend/issues)
- **Email**: support@mscandco.com
- **Docs**: See `/docs/` directory

## 📄 License

Proprietary - © 2025 MSC & Co

---

**Production URL**: https://mscandco.vercel.app
**Status**: 🟢 Live & Operational
