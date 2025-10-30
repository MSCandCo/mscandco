# MSC & Co - AI-Native Music Distribution Platform

**The first and only AI-native music distribution platform.** A comprehensive, enterprise-grade music distribution and publishing platform supporting multiple brands under the MSC & Co umbrella, built with Next.js 15 (App Router), Supabase, AI integration, and modern web technologies.

## 🎯 Platform Overview

MSC & Co is the world's first AI-native music distribution platform that empowers artists, labels, and publishers to distribute their music globally while managing releases, analytics, royalties, and business operations through intelligent AI-powered insights.

### Brand Architecture

- **MSC & Co** - Parent company and main platform
- **MSC & Co MSC** - Gospel and Christian music distribution & publishing
- **Audio MSC** - General music distribution & licensing for film/TV/media

## ✨ Core Features

### 🎨 Multi-Brand Support
- Brand selection during artist onboarding
- Brand-specific features and services
- Separate branding in emails, dashboards, and project views
- Dynamic theming and brand customization

### 👥 Role-Based Access Control (RBAC)
- Comprehensive permission system with granular controls
- Support for multiple role types: Artist, Label Admin, Admin, SuperAdmin
- Permission inheritance and override capabilities
- Ghost mode for admin user impersonation

### 🎵 Artist Portal
- Complete artist profile management with change request workflow
- Project and release management
- Real-time analytics and royalty tracking
- Contract management and digital signature support
- Wallet integration with Revolut

### 📊 Distribution Services
- Global music distribution to 150+ platforms
- Professional publishing and royalty collection
- Sync licensing opportunities
- Real-time analytics and revenue tracking
- Automated royalty splits and payouts

### 🤖 AI-Native Features
- **Apollo AI Assistant** - Intelligent platform guidance and support
- **AI-Powered Analytics** - Predictive insights and growth recommendations
- **Smart Release Strategy** - AI-optimized release timing and marketing
- **Audience Intelligence** - AI-driven demographic and behavioral analysis
- **Revenue Predictions** - Machine learning-powered earnings forecasts
- **Context-Aware Help** - Natural language support and recommendations

### 📧 Enterprise Email System
- 10+ professional email templates
- Supabase-native email with Resend integration
- Branded authentication emails
- Transactional and marketing email support

## 🏗️ Technical Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18.2
- **Styling**: TailwindCSS with custom brand theming
- **Component Libraries**:
  - Radix UI (accessible components)
  - Flowbite React
  - Heroicons
- **State Management**: React Context + SWR for data fetching
- **Forms**: Formik with validation
- **Charts**: Chart.js, Recharts

### Backend & Infrastructure
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with email/password
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime subscriptions
- **Background Jobs**: Inngest
- **Payments**: Revolut Business API
- **Email**: Resend + Supabase Edge Functions

### DevOps & Monitoring
- **Hosting**: Vercel
- **Error Tracking**: Sentry
- **Analytics**: PostHog
- **Caching**: Upstash Redis
- **Testing**: Playwright (E2E)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mscandco-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` with required variables:
```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3013

# Revolut Payment Integration (OPTIONAL)
REVOLUT_ENVIRONMENT=sandbox
REVOLUT_API_KEY=your-api-key
REVOLUT_WEBHOOK_SECRET=your-webhook-secret

# Admin Configuration
SUPER_ADMIN_USER_ID=your-user-id

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=your-dsn
SENTRY_AUTH_TOKEN=your-auth-token

# PostHog (Analytics)
NEXT_PUBLIC_POSTHOG_KEY=your-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Inngest (Background Jobs)
INNGEST_EVENT_KEY=your-event-key
INNGEST_SIGNING_KEY=your-signing-key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3013](http://localhost:3013) in your browser.

## 📁 Project Structure

```
mscandco-frontend/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── admin/          # Admin API endpoints
│   │   ├── artist/         # Artist API endpoints
│   │   ├── auth/           # Authentication endpoints
│   │   ├── distribution/   # Distribution service endpoints
│   │   └── wallet/         # Wallet/payment endpoints
│   ├── admin/              # Admin dashboard pages
│   ├── artist/             # Artist portal pages
│   ├── labeladmin/         # Label admin pages
│   ├── superadmin/         # Super admin pages
│   └── auth/               # Authentication pages
├── components/              # React components
│   ├── admin/              # Admin-specific components
│   ├── artist/             # Artist-specific components
│   ├── auth/               # Authentication components
│   ├── layouts/            # Layout components
│   └── ui/                 # Reusable UI components
├── lib/                     # Utility libraries
│   ├── supabase/           # Supabase client configurations
│   │   ├── client.js       # Browser client
│   │   ├── server.js       # Server component client
│   │   ├── service-role.js # Service role client
│   │   └── middleware.js   # Auth middleware
│   ├── rbac/               # RBAC implementation
│   ├── permissions.js      # Permission utilities
│   └── api-auth.js         # API authentication helpers
├── email-templates/         # Email template HTML/React
├── database/               # Database scripts and migrations
├── docs/                   # Documentation
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
├── styles/                 # Global styles
└── supabase/              # Supabase configuration
    └── functions/         # Edge Functions
```

## 🔐 Permission System

The platform implements a comprehensive RBAC system with:

- **Permission Format**: `resource:action:scope` (e.g., `user:read:own`)
- **Wildcard Support**: `*:*:*` for super admin, `user:*:*` for all user permissions
- **Permission Inheritance**: Roles inherit permissions, users can have overrides
- **Deny Permissions**: Explicit permission denial for fine-grained control

### Role Hierarchy
1. **SuperAdmin** - Full platform access (`*:*:*`)
2. **Admin** - Administrative functions, user management
3. **Label Admin** - Manage their label's artists and releases
4. **Artist** - Manage own profile, releases, and earnings

See `docs/RBAC_IMPLEMENTATION.md` for detailed documentation.

## 🎨 Brand Configuration

Multi-brand support is configured in `lib/brand-config.js`:

```javascript
{
  "msc": {
    name: "MSC & Co MSC",
    primaryColor: "#1e40af",
    features: ["distribution", "publishing", "gospel-focus"],
    // ...
  },
  "audio": {
    name: "Audio MSC",
    primaryColor: "#7c3aed",
    features: ["distribution", "sync-licensing", "film-tv"],
    // ...
  }
}
```

## 🧪 Development

### Running Tests
```bash
# E2E tests with Playwright
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

### Code Quality
```bash
# Linting
npm run lint

# Build check
npm run build
```

### Adding New Features
1. Create feature branch from `main`
2. Implement with App Router conventions
3. Add permission checks if needed
4. Update documentation
5. Add tests
6. Submit pull request to `mscandco` branch

## 🚢 Deployment

### Vercel Deployment
The platform is optimized for Vercel:

```bash
# Deploy to production
vercel --prod

# Environment variables
# Configure in Vercel dashboard or via CLI
```

### Environment Configuration
- **Development**: `http://localhost:3013`
- **Staging**: `staging.mscandco.com`
- **Production**: `mscandco.com`

### Database Migrations
```bash
# Run database migrations via scripts
node database/run-migration.js
```

## 📚 Documentation

- [RBAC Implementation](docs/RBAC_IMPLEMENTATION.md)
- [Security Fixes](docs/SECURITY_FIXES_FINAL.md)
- [Deployment Checklist](docs/RBAC_DEPLOYMENT_CHECKLIST.md)
- [Public Routes Security](docs/PUBLIC_ROUTES_SECURITY_REVIEW.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the code style and conventions
4. Add tests for new functionality
5. Update documentation as needed
6. Commit your changes with descriptive messages
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request to `mscandco` branch

### Commit Message Format
Follow Conventional Commits:
```
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
style(scope): formatting changes
refactor(scope): code refactoring
test(scope): add tests
chore(scope): maintenance tasks
```

## 📄 License

This project is proprietary software owned by MSC & Co. All rights reserved.

## 💬 Support

- **Email**: support@mscandco.com
- **Documentation**: docs.mscandco.com
- **Issues**: Internal issue tracker

## 🙏 Acknowledgments

Built with modern web technologies and best practices for scalability, security, and developer experience.
