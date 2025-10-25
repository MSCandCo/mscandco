# MSC & Co Platform - Technical Documentation
## Enterprise-Grade Music Distribution & Publishing Platform

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Status:** Production-Ready (Phase 1 Complete)

---

## 📋 Executive Summary

MSC & Co is a comprehensive, enterprise-grade music distribution and publishing platform built with modern web technologies, designed for scalability, security, and AI-readiness. The platform serves artists, label administrators, distribution partners, and platform administrators with role-based access control and real-time data synchronization.

### Key Metrics
- **Codebase:** 100% Next.js App Router (migrated from Pages Router)
- **Database:** PostgreSQL with Row-Level Security (RLS)
- **Authentication:** Supabase Auth with JWT
- **API Routes:** 80+ RESTful endpoints
- **User Roles:** 5 (Artist, Label Admin, Distribution Partner, Company Admin, Super Admin)
- **Permissions:** 150+ granular permissions
- **Real-time Features:** WebSocket-based notifications and updates

---

## 🏗️ Architecture Overview

### Technology Stack

#### **Frontend**
- **Framework:** Next.js 15.5.2 (App Router)
- **Language:** JavaScript/React 18.2.0
- **Styling:** Tailwind CSS 3.4.1
- **UI Components:** 
  - Radix UI (Headless components)
  - Lucide React (Icons)
  - React Icons
  - Flowbite React
- **State Management:** React Context + SWR for data fetching
- **Forms:** Formik + Yup validation
- **Charts:** Chart.js, Recharts, React-Chartjs-2

#### **Backend & Database**
- **Database:** PostgreSQL (Supabase)
- **ORM:** Supabase Client (direct SQL queries)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (S3-compatible)
- **Real-time:** Supabase Realtime (WebSockets)

#### **Enterprise Services**
1. **Error Tracking:** Sentry (US region)
   - Client-side error tracking
   - Server-side monitoring
   - Performance monitoring
   - Session replay
   - Release tracking

2. **Caching:** Upstash Redis
   - Serverless Redis
   - Query result caching
   - Rate limiting
   - Session storage

3. **Analytics:** PostHog
   - Product analytics
   - Session recording
   - Feature flags
   - A/B testing
   - Event autocapture

4. **Background Jobs:** Inngest
   - AI processing jobs
   - Email sending
   - Analytics aggregation
   - Subscription renewals

5. **Scheduled Tasks:** Vercel Cron
   - Daily analytics (midnight)
   - Subscription renewals (6 AM daily)
   - Data cleanup (weekly)
   - Report generation (weekly)

6. **Real-time:** Supabase Realtime
   - Notifications
   - Release updates
   - Earnings updates
   - Messages

#### **Deployment**
- **Hosting:** Vercel (Edge Network)
- **CDN:** Vercel Edge Network
- **CI/CD:** GitHub Actions + Vercel
- **Environment:** Production, Staging, Development

---

## 🗄️ Database Schema

### Core Tables

#### **1. user_profiles**
Primary user information table with RLS policies.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('artist', 'label_admin', 'distribution_partner', 'company_admin', 'super_admin')),
  
  -- Personal Information
  first_name TEXT,
  last_name TEXT,
  artist_name TEXT,
  phone TEXT,
  country TEXT,
  city TEXT,
  address TEXT,
  postal_code TEXT,
  
  -- Profile Details
  bio TEXT,
  primary_genre TEXT,
  secondary_genres TEXT[],
  profile_picture_url TEXT,
  cover_image_url TEXT,
  
  -- Social Media
  website_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  
  -- Settings
  preferred_currency TEXT DEFAULT 'GBP',
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  
  -- Analytics Data (JSONB)
  analytics_data JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);
```

#### **2. releases**
Music release management.

```sql
CREATE TABLE releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES user_profiles(id),
  
  -- Release Information
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  release_type TEXT CHECK (release_type IN ('single', 'ep', 'album', 'compilation')),
  genre TEXT,
  subgenre TEXT,
  language TEXT,
  
  -- Dates
  release_date DATE,
  original_release_date DATE,
  
  -- Media
  artwork_url TEXT,
  audio_file_url TEXT,
  
  -- Metadata
  upc TEXT UNIQUE,
  isrc TEXT,
  label_name TEXT,
  copyright_holder TEXT,
  copyright_year INTEGER,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'revision', 'completed', 'live', 'takedown')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);
```

#### **3. earnings_log**
Single source of truth for all financial transactions.

```sql
CREATE TABLE earnings_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES user_profiles(id),
  
  -- Financial Data
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  
  -- Transaction Details
  earning_type TEXT NOT NULL,
  platform TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  
  -- Metadata
  payment_date DATE,
  notes TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **4. subscriptions**
User subscription management.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  
  -- Subscription Details
  tier TEXT NOT NULL CHECK (tier IN ('artist_starter', 'artist_pro', 'label_starter', 'label_pro')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  
  -- Pricing
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  
  -- Billing Periods
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Auto-renewal
  auto_renew BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ
);
```

#### **5. label_artist_affiliations**
Label admin and artist relationships.

```sql
CREATE TABLE label_artist_affiliations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label_admin_id UUID NOT NULL REFERENCES user_profiles(id),
  artist_id UUID NOT NULL REFERENCES user_profiles(id),
  
  -- Revenue Split
  label_percentage DECIMAL(5, 2) NOT NULL CHECK (label_percentage >= 0 AND label_percentage <= 100),
  artist_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (100 - label_percentage) STORED,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  terminated_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(label_admin_id, artist_id)
);
```

#### **6. shared_earnings**
Split earnings between label admins and artists.

```sql
CREATE TABLE shared_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliation_id UUID NOT NULL REFERENCES label_artist_affiliations(id),
  
  -- Amounts
  total_amount DECIMAL(12, 2) NOT NULL,
  label_amount DECIMAL(12, 2) NOT NULL,
  artist_amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  
  -- Details
  platform TEXT,
  earning_type TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **7. permissions**
Granular permission system.

```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permission_key TEXT UNIQUE NOT NULL,
  permission_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  
  -- Access Control
  denied BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **8. role_permissions**
Role-permission mapping.

```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(role, permission_id)
);
```

#### **9. notifications**
Real-time notification system.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  
  -- Content
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  
  -- Status
  read BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
```

#### **10. affiliation_requests**
Label admin invitation system.

```sql
CREATE TABLE affiliation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label_admin_id UUID NOT NULL REFERENCES user_profiles(id),
  artist_email TEXT NOT NULL,
  
  -- Request Details
  label_percentage DECIMAL(5, 2) NOT NULL,
  message TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);
```

### Additional Tables
- `wallet_transactions` - Legacy wallet transaction history
- `profile_change_requests` - User profile update requests
- `artist_requests` - Artist onboarding requests
- `revenue_reports` - Distribution revenue reports
- `webhook_logs` - External webhook tracking

---

## 🔐 Security Architecture

### Authentication Flow

1. **User Registration**
   ```
   User → Register Form → Supabase Auth → Email Verification → Profile Creation → Dashboard
   ```

2. **User Login**
   ```
   User → Login Form → Supabase Auth → JWT Token → Session Cookie → Dashboard
   ```

3. **Session Management**
   - JWT tokens stored in HTTP-only cookies
   - Automatic token refresh (1 hour expiry)
   - Server-side session validation on every request

### Row-Level Security (RLS)

All tables have RLS policies enforcing:
- Users can only read/write their own data
- Label admins can read affiliated artists' data
- Admins can read all data
- Service role bypasses RLS for system operations

Example RLS Policy:
```sql
-- Artists can only see their own releases
CREATE POLICY "Artists can view own releases"
ON releases FOR SELECT
TO authenticated
USING (artist_id = auth.uid());

-- Label admins can see affiliated artists' releases
CREATE POLICY "Label admins can view affiliated releases"
ON releases FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM label_artist_affiliations
    WHERE artist_id = releases.artist_id
    AND label_admin_id = auth.uid()
    AND status = 'active'
  )
);
```

### Permission System

**Permission Structure:**
```
{category}:{resource}:{action}
```

Examples:
- `releases:access` - Can access releases page
- `analytics:advanced:view` - Can view advanced analytics
- `admin:users:manage` - Can manage users

**Permission Checking:**
```javascript
import { checkPermission } from '@/lib/rbac/permissions'

const hasAccess = await checkPermission(userId, 'releases:access')
if (!hasAccess) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

---

## 🎯 User Roles & Permissions

### 1. Artist
**Purpose:** Individual musicians managing their own releases

**Core Permissions:**
- Dashboard access
- Release management (create, edit, delete own releases)
- Analytics (basic)
- Earnings view
- Profile management
- Messages
- Settings

**Subscription Tiers:**
- **Artist Starter:** 5 releases, 2 collaborators
- **Artist Pro:** Unlimited releases, 10 collaborators, advanced analytics

### 2. Label Admin
**Purpose:** Manage multiple artists under a label

**Core Permissions:**
- All Artist permissions
- Invite artists
- View affiliated artists' data
- Manage roster
- Split earnings configuration
- Label analytics (aggregated)

**Subscription Tiers:**
- **Label Starter:** 20 releases, 5 artists
- **Label Pro:** Unlimited releases, unlimited artists

### 3. Distribution Partner
**Purpose:** Manage distribution and revenue reporting

**Core Permissions:**
- Distribution Hub access
- Revenue reporting
- Platform management
- Catalog management
- Analytics dashboard

### 4. Company Admin
**Purpose:** Platform administration and support

**Core Permissions:**
- User management
- Earnings management
- Analytics management
- Asset library
- Support tools

### 5. Super Admin
**Purpose:** Full platform control

**Core Permissions:**
- All permissions
- Permission management
- Role management
- System configuration
- Ghost login (impersonate users)

---

## 📡 API Architecture

### API Route Structure

```
/api
├── artist/              # Artist-specific endpoints
│   ├── analytics-data/  # Analytics data
│   ├── profile/         # Profile management
│   ├── releases-simple/ # Releases list
│   ├── wallet-simple/   # Earnings data
│   └── settings/        # Settings management
├── labeladmin/          # Label admin endpoints
│   ├── accepted-artists/
│   ├── earnings/
│   ├── invite-artist/
│   └── releases/
├── admin/               # Admin endpoints
│   ├── users/
│   ├── earnings/
│   ├── systems/         # System management
│   └── walletmanagement/
├── auth/                # Authentication
│   └── logout/
├── notifications/       # Notifications
├── releases/            # Release management
├── wallet/              # Wallet operations
├── cron/                # Scheduled tasks
└── inngest/             # Background jobs
```

### API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "code": "ERROR_CODE"
}
```

### Authentication

All API routes require authentication via JWT token:

```javascript
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Proceed with authenticated request
}
```

---

## 🎨 Frontend Architecture

### Component Structure

```
components/
├── layouts/              # Layout components
│   ├── AdminHeader.js    # Admin navigation
│   ├── StandardHeader.js # User navigation
│   └── Footer.js
├── providers/            # React Context providers
│   ├── SupabaseProvider.js
│   ├── PostHogProvider.js
│   └── RealtimeProvider.js
├── ui/                   # Reusable UI components
│   ├── LoadingSpinner.js
│   ├── CurrencySelector.js
│   └── Modal.js
├── analytics/            # Analytics components
│   └── CleanManualDisplay.js
├── shared/               # Shared components
│   ├── Avatar.js
│   ├── ConfirmationModal.js
│   └── NotificationModal.js
└── modals/               # Modal components
    └── PayoutRequestModal.js
```

### Page Structure (App Router)

```
app/
├── (auth)/
│   ├── login/
│   ├── register/
│   └── auth/callback/
├── artist/
│   ├── dashboard/
│   ├── releases/
│   ├── analytics/
│   ├── earnings/
│   ├── roster/
│   ├── messages/
│   ├── profile/
│   └── settings/
├── labeladmin/
│   ├── artists/
│   ├── releases/
│   ├── analytics/
│   ├── earnings/
│   ├── roster/
│   └── settings/
├── admin/
│   ├── usermanagement/
│   ├── permissions/
│   ├── systems/
│   └── walletmanagement/
└── api/                  # API routes
```

### State Management

**Global State:**
- User session (Supabase Context)
- Permissions (RBAC Context)
- Real-time updates (Realtime Context)

**Local State:**
- Component-specific state (useState)
- Form state (Formik)
- Data fetching (SWR)

**Example:**
```javascript
import { useUser } from '@/components/providers/SupabaseProvider'
import { usePermissions } from '@/lib/rbac/usePermissions'

export default function MyComponent() {
  const { user, session } = useUser()
  const { hasPermission } = usePermissions()
  
  if (!hasPermission('releases:access')) {
    return <div>Access Denied</div>
  }
  
  return <div>Content</div>
}
```

---

## 🚀 Deployment & DevOps

### Environment Variables

**Required:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

### Deployment Process

1. **Development → Staging**
   ```bash
   git push origin staging
   # Vercel auto-deploys to staging environment
   ```

2. **Staging → Production**
   ```bash
   git push origin main
   # Vercel auto-deploys to production
   ```

3. **Database Migrations**
   ```bash
   # Run SQL migrations in Supabase dashboard
   # Or use Supabase CLI
   supabase db push
   ```

### Monitoring

**Dashboards:**
- Sentry: https://sentry.io (Error tracking)
- Upstash: https://console.upstash.com (Redis metrics)
- PostHog: https://app.posthog.com (Analytics)
- Inngest: https://app.inngest.com (Background jobs)
- Vercel: https://vercel.com (Deployment & performance)

---

## 🧪 Testing

### Test Coverage

- **E2E Tests:** Playwright (80+ test scenarios)
- **Unit Tests:** Jest (in progress)
- **Integration Tests:** API route testing

### Running Tests

```bash
# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

---

## 📊 Performance Metrics

### Current Performance

- **Page Load Time:** < 2s (average)
- **API Response Time:** < 500ms (average)
- **Database Query Time:** < 100ms (average)
- **Cache Hit Rate:** 85%
- **Error Rate:** < 0.1%

### Scalability Targets

- **Concurrent Users:** 10,000+
- **API Requests/sec:** 1,000+
- **Database Connections:** 100+ (pooled)
- **Storage:** Unlimited (S3-compatible)

---

## 🔮 Future Roadmap

### Phase 2: AI Integration (Q1 2026)
- AI-powered lyrics analysis
- Automated artwork generation
- Genre classification
- Mood detection
- Similar artist recommendations

### Phase 3: Advanced Features (Q2 2026)
- Multi-language support
- Advanced royalty splitting
- Blockchain integration for rights management
- NFT minting for releases
- Social features (artist collaboration)

### Phase 4: Mobile Apps (Q3 2026)
- iOS app (React Native)
- Android app (React Native)
- Mobile-first analytics
- Push notifications

---

## 📚 Technical References

### Key Technologies
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Sentry Documentation](https://docs.sentry.io)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [PostHog Documentation](https://posthog.com/docs)
- [Inngest Documentation](https://www.inngest.com/docs)

### Code Standards
- ESLint configuration
- Prettier formatting
- TypeScript (migration in progress)
- Component naming conventions
- API route patterns

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch
2. Implement feature with tests
3. Submit PR with detailed description
4. Code review
5. Merge to staging
6. QA testing
7. Merge to production

### Code Review Checklist
- [ ] Code follows style guide
- [ ] Tests pass
- [ ] No console errors
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Documentation updated

---

## 📞 Support & Maintenance

### Support Channels
- Technical Support: tech@mscandco.com
- Bug Reports: GitHub Issues
- Feature Requests: GitHub Discussions

### Maintenance Schedule
- **Daily:** Automated backups
- **Weekly:** Security updates
- **Monthly:** Performance optimization
- **Quarterly:** Major feature releases

---

**Document Version:** 1.0.0  
**Last Updated:** October 25, 2025  
**Maintained By:** MSC & Co Engineering Team

