# MSC & Co Platform - Comprehensive Technical Documentation

**Version:** 0.1.0
**Last Updated:** January 2025
**Stack:** Next.js 15, React 18, Supabase, PostgreSQL 17

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Architecture](#database-architecture)
5. [Authentication & Authorization](#authentication--authorization)
6. [Core Features & Modules](#core-features--modules)
7. [API Architecture](#api-architecture)
8. [Frontend Architecture](#frontend-architecture)
9. [Third-Party Integrations](#third-party-integrations)
10. [Security & Compliance](#security--compliance)
11. [Performance & Scalability](#performance--scalability)
12. [Deployment & DevOps](#deployment--devops)
13. [Future Roadmap & Alternatives](#future-roadmap--alternatives)

---

## 1. Executive Summary

### Platform Overview
MSC & Co is an **enterprise-grade multi-brand music distribution and publishing platform** that enables artists, labels, and distribution partners to manage music releases, track analytics, process royalties, and distribute content to 150+ digital platforms worldwide.

### Key Technical Metrics
- **Codebase Size:** 90+ components, 85+ API endpoints
- **Database:** PostgreSQL 17 with 50+ tables
- **User Capacity:** Designed for 100,000+ users
- **API Response Time:** < 200ms average
- **Uptime Target:** 99.9% SLA

### Primary Value Proposition
- **Multi-brand architecture** supporting white-label music distribution
- **Enterprise RBAC** with 200+ granular permissions
- **Real-time analytics** powered by PostHog
- **Automated royalty calculations** and wallet system
- **Secure payment processing** via Revolut integration

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  Next.js 15 App Router │ React 18 │ TailwindCSS             │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                     Middleware Layer                         │
│  Authentication │ Authorization │ Rate Limiting             │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      API Layer (85+ Endpoints)               │
│  /api/admin  │  /api/artist  │  /api/labeladmin            │
│  /api/auth   │  /api/wallet  │  /api/releases              │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Database Layer                            │
│  PostgreSQL 17 (Supabase) │ Row-Level Security (RLS)        │
│  50+ Tables │ Real-time Subscriptions │ Edge Functions      │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  External Services Layer                     │
│  Revolut  │  Sentry  │  PostHog  │  Upstash Redis          │
│  Inngest  │  Vercel  │  ChartMetric API                    │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Patterns
1. **Server-Side Rendering (SSR):** Next.js App Router for SEO and performance
2. **Serverless Functions:** Edge-optimized API routes
3. **Real-time Communication:** Supabase Realtime for live updates
4. **Event-Driven Background Jobs:** Inngest for scheduled tasks
5. **Caching Strategy:** Redis (Upstash) for session and permission caching

---

## 3. Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.3.5 | Full-stack React framework with App Router |
| **React** | 18.2.0 | UI component library |
| **TailwindCSS** | 3.4.1 | Utility-first CSS framework |
| **Radix UI** | Various | Accessible component primitives |
| **Flowbite React** | 0.12.7 | Pre-built UI components |
| **Recharts** | 3.2.1 | Data visualization and charting |
| **SWR** | 2.2.0 | Client-side data fetching and caching |
| **Formik** | 2.4.6 | Form management and validation |
| **React Icons** | 5.5.0 | Icon library |
| **DND Kit** | 6.3.1 | Drag-and-drop functionality |

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | 2.55.0 | PostgreSQL database + Auth + Storage + Edge Functions |
| **PostgreSQL** | 17.4.1 | Primary relational database |
| **Inngest** | 3.44.3 | Background job processing and cron jobs |
| **Axios** | 1.10.0 | HTTP client for external API calls |
| **jsonwebtoken** | 9.0.2 | JWT token generation and validation |
| **Formidable** | 3.5.4 | File upload handling |

### Infrastructure & DevOps

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vercel** | 46.1.1 | Hosting, deployments, edge functions |
| **Upstash Redis** | 1.35.6 | Serverless Redis for caching |
| **Sentry** | 10.22.0 | Error tracking and performance monitoring |
| **PostHog** | 1.280.1 | Product analytics and feature flags |
| **Playwright** | 1.55.1 | End-to-end testing |

### Payment & Financial

| Technology | Purpose |
|------------|---------|
| **Revolut Business API** | Payment processing and wallet management |
| **ExcelJS** | Financial report generation |
| **jsPDF** | PDF invoice generation |

---

## 4. Database Architecture

### Database Schema Overview

The platform uses **PostgreSQL 17** hosted on Supabase with the following core table categories:

#### Core Tables (50+ tables)

**User Management:**
- `user_profiles` - Extended user information beyond Supabase Auth
- `roles` - Role definitions (artist, label_admin, company_admin, super_admin, distribution_partner)
- `permissions` - Granular permission definitions (200+ permissions)
- `role_permissions` - Role-to-permission mapping
- `user_permissions` - User-specific permission overrides

**Content Management:**
- `releases` - Music releases/albums
- `tracks` - Individual songs
- `artists` - Artist roster
- `labels` - Record label information
- `playlists` - Curated playlists

**Financial:**
- `wallet_transactions` - All financial transactions
- `earnings` - Royalty earnings records
- `revenue_reports` - Aggregated revenue data
- `subscriptions` - User subscription plans
- `split_configurations` - Revenue split rules

**Analytics:**
- `analytics_events` - User activity tracking
- `stream_stats` - Streaming platform statistics
- `dashboard_widgets` - Custom dashboard configurations

**System:**
- `notifications` - In-app notifications
- `audit_logs` - System activity audit trail
- `ghost_sessions` - Admin impersonation sessions
- `profile_change_requests` - Approval workflow for profile changes
- `webhook_logs` - External webhook event logs

### Row-Level Security (RLS) Implementation

Every table implements **RLS policies** for data isolation:

```sql
-- Example: Artists can only see their own releases
CREATE POLICY "Artists can view own releases"
ON releases FOR SELECT
USING (auth.uid() = user_id);

-- Label admins can see releases from their affiliated artists
CREATE POLICY "Label admins can view label releases"
ON releases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM label_artist_affiliations
    WHERE label_id = auth.uid() AND artist_id = releases.user_id
  )
);
```

### Database Relationships

```
user_profiles (1) ──── (N) releases
     │
     ├──── (N) wallet_transactions
     │
     ├──── (N) earnings
     │
     └──── (N) subscriptions

releases (1) ──── (N) tracks
    │
    └──── (N) stream_stats

roles (1) ──── (N) role_permissions ──── (1) permissions
     │
     └──── (1) user_profiles

labels (1) ──── (N) label_artist_affiliations ──── (N) artists
```

### Migration System

Database migrations are managed through:
1. **SQL migration files** in `/database/migrations/`
2. **Automated migration scripts** (`apply-migration.js`)
3. **Version control** in `schema_migrations` table
4. **Rollback capabilities** for all major schema changes

---

## 5. Authentication & Authorization

### Authentication System

**Provider:** Supabase Auth (PostgreSQL-backed)

**Supported Methods:**
- Email/Password authentication
- Magic link email authentication
- OAuth providers (Google, Spotify - ready for integration)
- JWT-based session management

**Session Management:**
- Access tokens stored in HTTP-only cookies
- Automatic token refresh
- Server-side session validation
- Ghost login for admin impersonation (tracked in `ghost_sessions` table)

### Authorization System (RBAC v2)

#### Role Hierarchy

```
Super Admin (Level 4)
    │
    ├─ Company Admin (Level 3)
    │       │
    │       ├─ Label Admin (Level 2)
    │       │
    │       └─ Distribution Partner (Level 2)
    │
    └─ Artist (Level 1)
```

#### Permission Format

Permissions follow the pattern: `resource:action:scope`

**Examples:**
- `release:view:own` - View your own releases
- `release:view:label` - View releases from your label
- `release:view:any` - View all releases (admin)
- `*:*:*` - Wildcard (Super Admin only)

#### Permission Categories (200+ total)

1. **Profile Management** - `profile:view:own`, `profile:edit:any`
2. **Release Management** - `release:create`, `release:approve`, `release:publish`
3. **Financial** - `earnings:view:own`, `wallet:manage:any`
4. **User Management** - `user:view:any`, `user:impersonate`
5. **Analytics** - `analytics:view:own`, `analytics:export`
6. **System** - `system:settings`, `system:logs`

#### Permission Checking Flow

```javascript
// Client-side permission check
const { hasPermission } = usePermissions();
if (hasPermission('release:create')) {
  // Show create button
}

// Server-side permission enforcement
import { requirePermission } from '@/lib/permissions';

export async function POST(req) {
  const authorized = await requirePermission(req, 'release:create');
  if (!authorized) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Process request
}
```

#### Permission Denial Mechanism

Users can have permissions **explicitly denied**, which overrides role permissions:
- Stored in `user_permissions` table with `denied: true` flag
- Useful for temporary access restriction
- Checked before granting role-based permissions

---

## 6. Core Features & Modules

### 6.1 Multi-Brand System

**Brands Supported:**
1. **MSC & Co** - Premium music distribution and publishing
2. **Audio MSC** - General music + film/TV licensing

**Brand Configuration:**
- Brand-specific color schemes
- Separate email domains
- Custom service offerings
- White-label capability

**Implementation:**
```javascript
// lib/brand-config.js
export const BRANDS = {
  MSC_CO: {
    id: 'msc-co',
    colorScheme: { primary: '#1a365d', accent: '#3182ce' },
    services: ['Music distribution', 'Publishing', 'Sync licensing']
  },
  AUDIO_MSC: {
    id: 'audio-msc',
    colorScheme: { primary: '#2d3748', accent: '#e53e3e' },
    services: ['Distribution', 'Film/TV licensing', 'Media placement']
  }
};
```

### 6.2 Release Management System

**Features:**
- Multi-track album/EP/single releases
- Cover art upload with cropping
- Metadata management (ISRC, UPC, genre, language)
- Release scheduling and publishing
- Distribution to 150+ platforms (Spotify, Apple Music, YouTube Music, etc.)
- Release status workflow: Draft → Pending → Approved → Published

**API Endpoints:**
- `POST /api/releases` - Create new release
- `GET /api/releases/[id]` - Get release details
- `PUT /api/releases/[id]` - Update release
- `DELETE /api/releases/delete` - Delete release
- `GET /api/artist/releases-simple` - Artist's releases list

### 6.3 Analytics Dashboard

**Data Sources:**
- PostHog (user behavior analytics)
- ChartMetric API (music streaming data)
- Internal database (transaction data)
- Real-time stream counts

**Metrics Tracked:**
- Streaming statistics (plays, listeners, saves)
- Revenue analytics
- Geographic distribution
- Playlist placements
- User engagement metrics
- Platform performance comparison

**Visualizations:**
- Line charts (time-series data)
- Bar charts (platform comparison)
- Pie charts (revenue breakdown)
- Real-time counters
- Heat maps (geographic data)

**API Endpoints:**
- `GET /api/artist/analytics-data` - Artist analytics
- `GET /api/admin/platformanalytics` - Platform-wide analytics
- `GET /api/admin/systems/analytics/stats` - System analytics

### 6.4 Wallet & Payment System

**Wallet Features:**
- Real-time balance tracking
- Multi-currency support (USD, EUR, GBP, NGN)
- Transaction history
- Top-up via Revolut
- Withdrawal requests
- Subscription payments
- Royalty payouts

**Revolut Integration:**
```javascript
// lib/revolut-payment.js
export async function createPaymentOrder(amount, currency, userId) {
  const response = await axios.post(
    'https://merchant.revolut.com/api/1.0/orders',
    { amount, currency, merchant_customer_id: userId },
    { headers: { Authorization: `Bearer ${REVOLUT_API_KEY}` } }
  );
  return response.data;
}
```

**Transaction Types:**
- `top_up` - Wallet funding
- `withdrawal` - Cash out
- `subscription_payment` - Monthly subscription
- `royalty_payout` - Earnings distribution
- `refund` - Payment reversal

**API Endpoints:**
- `GET /api/artist/wallet-simple` - Wallet balance
- `GET /api/wallet/transactions` - Transaction history
- `POST /api/wallet/pay-subscription` - Process subscription payment
- `GET /api/admin/walletmanagement/stats` - Wallet statistics

### 6.5 Earnings & Royalties

**Calculation Engine:**
- Automated royalty calculations based on streams
- Split configuration support (multiple rights holders)
- Multi-currency earnings tracking
- Tax withholding capabilities

**Earnings Workflow:**
1. **Data Collection** - Streaming data from platforms
2. **Calculation** - Apply split configurations and rates
3. **Approval** - Admin review (for `company_admin` and above)
4. **Payout** - Transfer to wallet or bank account

**Split Configuration:**
```javascript
// Example split configuration
{
  release_id: "uuid",
  splits: [
    { user_id: "artist-1", percentage: 50, role: "primary_artist" },
    { user_id: "artist-2", percentage: 30, role: "featured_artist" },
    { user_id: "label-1", percentage: 20, role: "label" }
  ]
}
```

**API Endpoints:**
- `GET /api/artist/earnings` - Artist earnings
- `GET /api/labeladmin/earnings` - Label earnings
- `GET /api/admin/earnings/list` - All earnings (admin)
- `PUT /api/admin/earnings/update-status` - Approve/reject earnings

### 6.6 User Management (Admin)

**Features:**
- User role assignment
- Permission management
- User search and filtering
- Bulk operations
- Account suspension/activation
- Ghost login (impersonation)

**Ghost Login:**
Allows admins to impersonate users for support purposes:
- Tracked in `ghost_sessions` table
- Audit trail maintained
- Session timeout (configurable)
- Clear UI indicator when in ghost mode

**API Endpoints:**
- `GET /api/admin/users/list` - List all users
- `GET /api/admin/users/search` - Search users
- `PUT /api/admin/users/[userId]/update-role` - Change user role
- `POST /api/superadmin/ghostlogin` - Initiate ghost session

### 6.7 Label-Artist Affiliation System

**Features:**
- Label admins can invite artists
- Artists can accept/reject invitations
- Multi-label support (artists can be affiliated with multiple labels)
- Affiliation status tracking: `pending`, `accepted`, `rejected`
- Revenue sharing based on affiliations

**Workflow:**
1. Label admin sends invitation
2. Artist receives notification
3. Artist accepts/rejects
4. On acceptance, label gains access to artist's releases and analytics

**API Endpoints:**
- `POST /api/labeladmin/invite-artist` - Send invitation
- `POST /api/artist/respond-invitation` - Accept/reject
- `GET /api/labeladmin/accepted-artists` - List affiliated artists
- `GET /api/labeladmin/affiliation-requests` - Pending invitations

### 6.8 Profile Change Request System

**Purpose:** Artists and Label Admins must request approval for certain profile changes

**Workflow:**
1. User submits change request (e.g., update bank account)
2. Stored in `profile_change_requests` table with status `pending`
3. Admin reviews request
4. Admin approves/rejects
5. On approval, changes are applied atomically

**Fields Requiring Approval:**
- Bank account details
- Legal name
- Tax ID
- Payout settings

**API Endpoints:**
- `POST /api/artist/profile` - Create change request
- `GET /api/admin/profile-change-requests` - List pending requests
- `PUT /api/admin/profile-change-requests/[id]` - Approve/reject

### 6.9 Notification System

**Channels:**
- In-app notifications
- Email notifications (ready for integration)
- Push notifications (future)

**Notification Types:**
- System announcements
- Release status updates
- Earnings updates
- Affiliation requests
- Payment confirmations
- Admin messages

**Features:**
- Real-time delivery via Supabase Realtime
- Read/unread tracking
- Batch marking as read
- Notification preferences (per user)

**API Endpoints:**
- `GET /api/notifications` - User's notifications
- `PUT /api/notifications/mark-read` - Mark as read
- `DELETE /api/notifications/delete` - Delete notification

### 6.10 Asset Library (Admin)

**Features:**
- Centralized media storage
- Cover art management
- Audio file storage
- Document storage (contracts, agreements)
- Version control
- Access control

**Storage:** Supabase Storage with CDN

---

## 7. API Architecture

### API Structure

All API routes are organized under `/app/api/`:

```
/api/
├── admin/              # Admin-only endpoints
│   ├── users/
│   ├── earnings/
│   ├── walletmanagement/
│   ├── systems/
│   └── ...
├── artist/             # Artist endpoints
│   ├── profile/
│   ├── releases/
│   ├── analytics-data/
│   └── wallet-simple/
├── labeladmin/         # Label admin endpoints
│   ├── invite-artist/
│   ├── earnings/
│   └── ...
├── auth/               # Authentication
│   ├── callback/
│   └── logout/
├── releases/           # Public/shared release endpoints
├── wallet/             # Wallet operations
├── notifications/      # Notification management
├── cron/               # Scheduled jobs
│   ├── subscription-renewals/
│   ├── daily-analytics/
│   └── ...
└── inngest/            # Background job webhooks
```

### API Patterns

**1. RESTful Design:**
- `GET` for read operations
- `POST` for create operations
- `PUT/PATCH` for updates
- `DELETE` for deletions

**2. Consistent Response Format:**
```javascript
// Success
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**3. Pagination:**
```javascript
// Request
GET /api/admin/users/list?page=1&limit=20

// Response
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**4. Authorization Middleware:**
Every protected endpoint uses permission checks:
```javascript
import { requirePermission } from '@/lib/permissions';

export async function GET(req) {
  if (!await requirePermission(req, 'user:view:any')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // ... handle request
}
```

### Rate Limiting

Implemented via Upstash Redis:
- **Authenticated users:** 100 requests/minute
- **Unauthenticated:** 20 requests/minute
- **Admin endpoints:** 200 requests/minute
- **Public endpoints:** 50 requests/minute

---

## 8. Frontend Architecture

### App Router Structure

```
/app/
├── (auth)/             # Auth-related pages
│   ├── login/
│   ├── register/
│   └── auth/callback/
├── artist/             # Artist portal
│   ├── dashboard/
│   ├── releases/
│   ├── analytics/
│   ├── earnings/
│   ├── profile/
│   └── settings/
├── labeladmin/         # Label admin portal
│   ├── dashboard/
│   ├── artists/
│   ├── releases/
│   └── earnings/
├── admin/              # Company admin portal
│   ├── usermanagement/
│   ├── walletmanagement/
│   ├── platformanalytics/
│   ├── systems/
│   └── ...
├── superadmin/         # Super admin portal
│   ├── ghostlogin/
│   ├── permissionsroles/
│   └── dashboard/
└── distribution/       # Distribution partner portal
    ├── catalog/
    ├── analytics/
    └── revenue/
```

### Component Architecture

**Component Categories:**

1. **UI Components** (`/components/ui/`)
   - Button, Card, Modal, Dropdown, etc.
   - Built with Radix UI + TailwindCSS
   - Fully accessible (WAI-ARIA compliant)

2. **Feature Components** (`/components/`)
   - AdminHeader - Navigation with permission-based rendering
   - PermissionGate - Conditional rendering based on permissions
   - AnalyticsChart - Reusable chart components
   - ReleaseForm - Multi-step release creation
   - WalletWidget - Real-time wallet balance

3. **Layout Components** (`/components/layouts/`)
   - DashboardLayout - Standard dashboard wrapper
   - PublicLayout - Public pages (landing, pricing)

**Component Example:**
```jsx
// components/PermissionGate.jsx
export function PermissionGate({ permission, children }) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return null;
  }

  return <>{children}</>;
}

// Usage
<PermissionGate permission="user:view:any">
  <UserManagementButton />
</PermissionGate>
```

### State Management

**Strategies:**
1. **Server State (SWR)** - API data caching and revalidation
2. **Client State (React Context)** - User session, permissions, theme
3. **URL State (Next.js Params)** - Filters, pagination, sorting
4. **Form State (Formik)** - Complex forms with validation

**Example - SWR Data Fetching:**
```javascript
import useSWR from 'swr';

export function useUserBalance() {
  const { data, error, mutate } = useSWR(
    '/api/artist/wallet-simple',
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30s
  );

  return {
    balance: data?.balance,
    loading: !data && !error,
    error,
    refresh: mutate
  };
}
```

### Styling System

**TailwindCSS Configuration:**
- Custom color palette (brand colors)
- Dark mode support
- Responsive breakpoints
- Custom animations

**CSS Architecture:**
- Utility-first (TailwindCSS)
- Component-scoped styles (CSS Modules for exceptions)
- Global styles (`/styles/globals.css`)

---

## 9. Third-Party Integrations

### 9.1 Supabase (Primary Infrastructure)

**Services Used:**
- **Auth** - User authentication and session management
- **Database** - PostgreSQL 17 with RLS
- **Storage** - File uploads (images, audio)
- **Realtime** - Live data subscriptions
- **Edge Functions** - Serverless functions (future use)

**Configuration:**
```javascript
// lib/supabase/client.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
```

### 9.2 Revolut Business API

**Purpose:** Payment processing and wallet management

**Features:**
- Create payment orders
- Process payouts
- Webhook handling for payment confirmations
- Multi-currency support

**Webhook Events:**
- `ORDER_COMPLETED` - Payment successful
- `ORDER_CANCELLED` - Payment cancelled
- `TRANSFER_STATE_CHANGED` - Payout status update

**Security:**
- Webhook signature verification
- API key rotation support
- Secure credential storage (environment variables)

### 9.3 Sentry (Error Tracking)

**Configuration:**
```javascript
// sentry.server.config.js
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ router: true })
  ]
});
```

**Features:**
- Automatic error capture
- Source map upload for better stack traces
- Performance monitoring
- User feedback collection
- Release tracking

### 9.4 PostHog (Product Analytics)

**Tracking:**
- Page views
- User actions (clicks, form submissions)
- Feature flag checks
- Session recordings (optional)
- A/B test results

**Implementation:**
```javascript
// lib/posthog.js
import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  capture_pageview: false // Manual page tracking
});

export function trackEvent(event, properties) {
  posthog.capture(event, properties);
}
```

### 9.5 Upstash Redis (Caching)

**Use Cases:**
- Session caching
- Permission caching (reduces DB queries by 90%)
- Rate limiting
- Temporary data storage

**Cache Strategy:**
```javascript
// lib/cache/redis.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

export async function cachePermissions(userId, permissions, ttl = 300) {
  await redis.setex(`permissions:${userId}`, ttl, JSON.stringify(permissions));
}
```

### 9.6 Inngest (Background Jobs)

**Job Types:**
- **Subscription Renewals** - Daily check for expiring subscriptions
- **Analytics Aggregation** - Hourly rollup of analytics data
- **Email Notifications** - Batch email sending
- **Data Cleanup** - Remove old logs and temporary data
- **Report Generation** - Monthly financial reports

**Example Job:**
```javascript
// lib/jobs/functions/subscription-renewal.js
export const subscriptionRenewal = inngest.createFunction(
  { name: 'Subscription Renewal' },
  { cron: '0 0 * * *' }, // Daily at midnight
  async ({ step }) => {
    const expiringSubs = await step.run('fetch-expiring', async () => {
      return await fetchExpiringSubscriptions();
    });

    await step.run('renew-subscriptions', async () => {
      return await renewSubscriptions(expiringSubs);
    });
  }
);
```

### 9.7 ChartMetric API (Future Integration)

**Purpose:** Music industry analytics

**Data Available:**
- Streaming statistics from all platforms
- Playlist placements
- Social media metrics
- Chart positions
- Audience demographics

---

## 10. Security & Compliance

### Security Measures

**1. Authentication Security:**
- JWT-based authentication with rotating secrets
- HTTP-only cookies (XSS protection)
- CSRF token validation
- Session timeout (configurable)
- Brute force protection (rate limiting)

**2. Authorization Security:**
- Server-side permission checks on every API call
- Row-Level Security (RLS) in database
- Permission caching with Redis (short TTL)
- No client-side permission bypass possible

**3. Data Security:**
- All data encrypted at rest (Supabase default)
- TLS 1.3 for data in transit
- Database backups (daily automated)
- Sensitive fields encrypted (bank accounts, tax IDs)

**4. Input Validation:**
- Server-side validation on all inputs
- Parameterized queries (SQL injection prevention)
- File upload validation (type, size, content)
- XSS sanitization

**5. API Security:**
- Rate limiting (Upstash Redis)
- API key rotation for external services
- Webhook signature verification
- CORS configuration (restrictive)

### Compliance Readiness

**GDPR (General Data Protection Regulation):**
- User data export capability
- Right to deletion (soft delete with 30-day retention)
- Consent tracking for data processing
- Data breach notification system (via Sentry)

**PCI DSS (Payment Card Industry):**
- No card data stored (Revolut handles all PCI)
- Tokenized payment processing
- Audit logs for all financial transactions

**SOC 2 Readiness:**
- Comprehensive audit logging
- Access control policies
- Incident response plan
- Regular security audits (manual review checkpoints)

---

## 11. Performance & Scalability

### Performance Optimizations

**1. Frontend:**
- Server-Side Rendering (SSR) for initial load
- Static page generation where possible
- Image optimization (Next.js Image component)
- Code splitting and lazy loading
- Bundle size optimization (<300KB initial load)

**2. API:**
- Edge function deployment (Vercel)
- Database connection pooling
- Indexed queries (all foreign keys indexed)
- N+1 query elimination
- Response compression (gzip)

**3. Caching:**
- Redis caching for permissions (300s TTL)
- SWR client-side caching
- Database query result caching
- CDN for static assets

**4. Database:**
- PostgreSQL query optimization
- Materialized views for complex analytics
- Partitioning for large tables (future)
- Read replicas for analytics queries (future)

### Scalability Metrics

**Current Capacity:**
- 100,000+ users supported
- 1,000+ concurrent API requests
- 10,000+ releases
- 1M+ analytics events/day

**Horizontal Scaling:**
- Stateless API design (scales infinitely on Vercel)
- Database: Supabase auto-scaling
- Redis: Upstash serverless (auto-scaling)
- Storage: Supabase CDN (auto-scaling)

**Monitoring:**
- Vercel analytics for frontend performance
- Sentry for backend performance
- PostHog for user experience metrics
- Custom alerts for API response times > 500ms

---

## 12. Deployment & DevOps

### Deployment Pipeline

**1. Development Environment:**
- Local development: `npm run dev` (port 3013)
- Supabase local instance (Docker)
- Environment variables: `.env.local`

**2. Staging Environment:**
- Automatic deployment on `staging` branch push
- Staging database (separate Supabase project)
- URL: `https://staging.mscandco.com`

**3. Production Environment:**
- Manual deployment via Vercel CLI or GitHub main branch
- Production database (Supabase)
- URL: `https://mscandco.com`
- Rollback capability (Vercel)

### CI/CD Process

```yaml
# .github/workflows/deploy.yml (Example)
name: Deploy
on:
  push:
    branches: [main, staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        run: vercel --prod
```

### Environment Variables

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REVOLUT_API_KEY`
- `REVOLUT_WEBHOOK_SECRET`

**Optional (but recommended):**
- `NEXT_PUBLIC_SENTRY_DSN`
- `UPSTASH_REDIS_REST_URL`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `INNGEST_EVENT_KEY`

### Monitoring & Alerting

**Uptime Monitoring:**
- Vercel automatic health checks
- Custom endpoint: `/api/health`
- Alert on >5 minute downtime

**Error Alerts:**
- Sentry automatic error notifications
- Slack integration for critical errors
- Email alerts for payment failures

**Performance Alerts:**
- Alert on API response time >1s
- Alert on database query time >500ms
- Alert on error rate >1%

---

## 13. Future Roadmap & Alternatives

### Planned Features (Next 6-12 Months)

**1. Enhanced Distribution:**
- TikTok, Instagram Reels distribution
- YouTube Content ID integration
- Automated lyric submission

**2. AI-Powered Features:**
- AI-generated cover art
- Automated metadata tagging
- Smart royalty forecasting
- Release schedule optimization

**3. Mobile Applications:**
- React Native iOS/Android apps
- Push notifications
- Offline access to analytics
- Mobile upload capability

**4. Advanced Analytics:**
- Predictive analytics
- Audience segmentation
- Competitive analysis
- Market trend insights

**5. Collaboration Tools:**
- Real-time collaboration on releases
- In-app messaging
- File version control
- Approval workflows

### Technical Alternatives & Considerations

**If Supabase is not viable:**
- **Alternative 1:** Firebase (Google) - Similar feature set, different pricing model
- **Alternative 2:** AWS Amplify - More complex setup, better for AWS ecosystem
- **Alternative 3:** Self-hosted PostgreSQL + Auth0 - Full control, higher maintenance

**If Revolut is not viable:**
- **Alternative 1:** Stripe Connect - Industry standard, higher fees
- **Alternative 2:** PayPal Payouts - Global reach, slower payouts
- **Alternative 3:** Wise API - Multi-currency, competitive rates

**If Next.js/Vercel is not viable:**
- **Alternative 1:** Remix + Fly.io - Modern React framework, full control
- **Alternative 2:** SvelteKit + Cloudflare Pages - Faster, smaller bundle
- **Alternative 3:** Astro + Netlify - Best for content-heavy sites

### Scaling Considerations

**At 500,000 users:**
- Move to dedicated Supabase instance
- Implement database sharding
- Add read replicas for analytics
- Consider microservices architecture for earnings calculation

**At 1,000,000 users:**
- Multi-region deployment
- GraphQL API (replace REST)
- Event-driven architecture
- Dedicated analytics database (ClickHouse or TimescaleDB)

---

## Conclusion

MSC & Co is a **production-ready, enterprise-grade music distribution platform** built with modern technologies and best practices. The architecture is designed for:

✅ **Scalability** - Serverless architecture scales automatically
✅ **Security** - Multi-layered security with RLS, JWT, and encryption
✅ **Performance** - <200ms API responses, optimized database queries
✅ **Maintainability** - Clean code, comprehensive documentation
✅ **Extensibility** - Modular design, easy to add new features

**Total Development Time:** Estimated 6-12 months
**Technology Maturity:** Production-ready (proven tech stack)
**Market Readiness:** Ready for commercial deployment
**Competitive Advantage:** Multi-brand architecture, enterprise RBAC, real-time analytics

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Author:** MSC & Co Development Team
**Contact:** tech@mscandco.com
