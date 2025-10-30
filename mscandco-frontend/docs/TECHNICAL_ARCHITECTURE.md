# Technical Architecture Documentation

## Overview

MSC & Co is a full-stack web application built on Next.js 15 with the App Router, leveraging Supabase for backend services including authentication, database, storage, and real-time capabilities. The platform is designed for scalability, security, and maintainability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Next.js 15 App Router (React 18.2)                    │ │
│  │  - Server Components (RSC)                             │ │
│  │  - Client Components                                   │ │
│  │  - API Routes (Route Handlers)                         │ │
│  │  - Middleware (Auth & Permissions)                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                              ↕                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  State Management & Data Fetching                      │ │
│  │  - React Context (Global State)                        │ │
│  │  - SWR (Server State & Caching)                        │ │
│  │  - React Hooks (Local State)                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                     Backend Services Layer                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Supabase                                              │ │
│  │  ┌──────────────┬──────────────┬────────────────────┐ │ │
│  │  │ PostgreSQL   │ Auth Service │ Storage Service    │ │ │
│  │  │ - RLS        │ - JWT        │ - File uploads     │ │ │
│  │  │ - Functions  │ - Sessions   │ - Asset hosting    │ │ │
│  │  └──────────────┴──────────────┴────────────────────┘ │ │
│  │  ┌──────────────┬──────────────────────────────────┐ │ │
│  │  │ Realtime     │ Edge Functions                   │ │ │
│  │  │ - WebSocket  │ - Email delivery                 │ │ │
│  │  │ - PubSub     │ - Webhooks                       │ │ │
│  │  └──────────────┴──────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                   External Services Layer                    │
│  ┌──────────────┬──────────────┬────────────┬────────────┐ │
│  │ Revolut API  │ Resend Email │ Inngest    │ PostHog    │ │
│  │ - Payments   │ - Delivery   │ - Jobs     │ - Analytics│ │
│  └──────────────┴──────────────┴────────────┴────────────┘ │
│  ┌──────────────┬──────────────┬────────────────────────┐ │
│  │ Sentry       │ Upstash      │ Vercel                 │ │
│  │ - Errors     │ - Cache      │ - Hosting & Edge      │ │
│  └──────────────┴──────────────┴────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Technologies

### Frontend Stack

#### Next.js 15 (App Router)
- **Server Components**: Default rendering mode for better performance
- **Client Components**: Interactive UI with 'use client' directive
- **Streaming**: Progressive rendering with React Suspense
- **Route Handlers**: RESTful API endpoints in `app/api/`
- **Middleware**: Authentication and permission checks
- **Static/Dynamic Rendering**: Optimized per route

#### React 18.2
- **Server Components**: Zero-bundle JavaScript for data fetching
- **Concurrent Features**: useTransition, useDeferredValue
- **Suspense**: Loading states and code splitting
- **Context API**: Global state management

#### TailwindCSS
- **Utility-First**: Rapid UI development
- **Custom Theme**: Brand colors and design tokens
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: System preference support (planned)

#### UI Component Libraries
- **Radix UI**: Accessible, unstyled primitives
  - Dropdown menus
  - Accordions
  - Tabs
  - Sliders
  - Select inputs
- **Flowbite React**: Pre-styled components
- **Heroicons**: SVG icon library

### Backend Stack

#### Supabase
Comprehensive backend-as-a-service providing:

**PostgreSQL Database**
- ACID compliance
- Row-Level Security (RLS) for data isolation
- Triggers and functions
- Full-text search
- JSON/JSONB support

**Authentication Service**
- Email/password authentication
- JWT-based sessions
- Secure cookie management
- Password reset flows
- Email verification

**Storage Service**
- File uploads (profile pictures, releases, contracts)
- Public and private buckets
- Access control via RLS
- CDN integration

**Realtime Subscriptions**
- WebSocket connections
- Database change listeners
- Presence tracking
- Broadcast channels

**Edge Functions**
- Deno runtime
- Email delivery via Resend
- Webhook handlers
- Background tasks

#### Database Schema

**Core Tables**:
- `user_profiles` - User information and metadata
- `roles` - Role definitions (Artist, Admin, etc.)
- `permissions` - Permission definitions
- `role_permissions` - Role-permission mappings
- `user_permissions` - User-specific permission overrides
- `releases` - Music releases
- `tracks` - Individual songs
- `wallets` - Artist wallet balances
- `transactions` - Payment history
- `analytics` - Platform analytics
- `messages` - Internal messaging

**Key Relationships**:
```sql
user_profiles (1) ←→ (n) releases
user_profiles (1) ←→ (1) wallets
user_profiles (n) ←→ (n) permissions (via user_permissions)
roles (1) ←→ (n) user_profiles
roles (n) ←→ (n) permissions (via role_permissions)
```

### Data Flow Architecture

#### Authentication Flow
```
1. User submits credentials
   ↓
2. app/api/auth/login validates
   ↓
3. Supabase Auth creates session
   ↓
4. JWT stored in httpOnly cookie
   ↓
5. Middleware validates on each request
   ↓
6. User profile fetched from database
   ↓
7. Permissions loaded and cached
```

#### Permission Check Flow
```
1. Request arrives at protected route
   ↓
2. Middleware extracts JWT from cookie
   ↓
3. Supabase validates JWT
   ↓
4. getUserPermissions() called
   ↓
5. User role fetched from user_profiles
   ↓
6. Role permissions fetched from role_permissions
   ↓
7. User overrides fetched from user_permissions
   ↓
8. Permissions merged (role + granted - denied)
   ↓
9. Permission check (with wildcard support)
   ↓
10. Allow/deny access
```

#### Data Fetching Patterns

**Server Component Pattern** (Preferred):
```javascript
// app/dashboard/page.js
import { createServerClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createServerClient();

  // Fetch data on server
  const { data } = await supabase
    .from('releases')
    .select('*');

  return <ReleaseList releases={data} />;
}
```

**Client Component with SWR**:
```javascript
'use client';
import useSWR from 'swr';

export default function Analytics() {
  const { data, error } = useSWR('/api/analytics', fetcher);

  if (error) return <Error />;
  if (!data) return <Loading />;

  return <Chart data={data} />;
}
```

### API Architecture

#### API Routes Structure
```
app/api/
├── admin/           # Admin operations
│   ├── users/
│   ├── analytics/
│   └── permissions/
├── artist/          # Artist operations
│   ├── releases/
│   ├── profile/
│   └── earnings/
├── auth/            # Authentication
│   ├── login/
│   ├── register/
│   ├── callback/
│   └── logout/
├── distribution/    # Distribution services
├── wallet/          # Payment operations
└── webhooks/        # External webhooks
```

#### API Route Handler Pattern
```javascript
// app/api/artist/releases/route.js
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/permissions';

export async function GET(request) {
  // Authenticate
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Authorize
  const hasPermission = await requirePermission(user.id, 'release:read:own');
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch data
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .eq('artist_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

### Security Architecture

#### Row-Level Security (RLS)
PostgreSQL RLS policies enforce data access at the database level:

```sql
-- Artists can only read their own releases
CREATE POLICY "Artists view own releases"
ON releases FOR SELECT
USING (
  auth.uid() = artist_id
);

-- Admins can view all releases
CREATE POLICY "Admins view all releases"
ON releases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('Admin', 'SuperAdmin')
  )
);
```

#### Authentication Security
- **JWT Tokens**: Signed with secret key
- **HttpOnly Cookies**: XSS protection
- **Secure Flag**: HTTPS-only transmission
- **SameSite**: CSRF protection
- **Token Refresh**: Automatic renewal
- **Session Timeout**: Configurable expiry

#### Permission System Security
- **Server-Side Checks**: Never trust client
- **Middleware Validation**: Every protected route
- **API Route Guards**: Double validation
- **Wildcard Support**: Hierarchical permissions
- **Deny Override**: Explicit permission denial

### State Management

#### Global State (React Context)
```javascript
// app/context/UserContext.js
export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);

  return (
    <UserContext.Provider value={{ user, permissions }}>
      {children}
    </UserContext.Provider>
  );
}
```

#### Server State (SWR)
```javascript
const config = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3
};

const { data, error, mutate } = useSWR(
  '/api/endpoint',
  fetcher,
  config
);
```

#### Local State (React Hooks)
- `useState` for component state
- `useReducer` for complex state logic
- `useRef` for mutable references
- `useMemo` for expensive computations
- `useCallback` for function memoization

### Performance Optimizations

#### Server Components
- Zero client-side JavaScript for data fetching
- Direct database access
- Reduced bundle size

#### Image Optimization
- Next.js Image component
- Automatic WebP conversion
- Lazy loading
- Responsive images

#### Code Splitting
- Automatic route-based splitting
- Dynamic imports for heavy components
- Lazy loading for modals and dialogs

#### Caching Strategy
- **Static Pages**: Build-time generation
- **Dynamic Pages**: ISR (Incremental Static Regeneration)
- **API Routes**: Upstash Redis for expensive queries
- **Database**: Materialized views for analytics
- **CDN**: Vercel Edge Network

### Monitoring & Observability

#### Error Tracking (Sentry)
- JavaScript errors
- API errors
- Performance monitoring
- User session replay
- Source maps

#### Analytics (PostHog)
- User behavior tracking
- Feature flags
- A/B testing
- Funnel analysis
- Session recording

#### Application Metrics
- API response times
- Database query performance
- User session duration
- Page load times
- Core Web Vitals

### Deployment Architecture

#### Vercel Platform
- **Edge Network**: Global CDN
- **Serverless Functions**: API routes
- **Edge Middleware**: Authentication
- **Preview Deployments**: PR-based
- **Production Deployments**: Main branch

#### CI/CD Pipeline
```
1. Code push to GitHub
   ↓
2. Vercel webhook triggered
   ↓
3. Build process starts
   ↓
4. Environment variables injected
   ↓
5. Next.js build
   ↓
6. Static assets optimized
   ↓
7. Serverless functions bundled
   ↓
8. Deploy to edge network
   ↓
9. Health checks
   ↓
10. Traffic routing
```

#### Environment Configuration
- **Development**: Local with .env.local
- **Preview**: Branch deployments
- **Staging**: Pre-production testing
- **Production**: Live platform

### Scalability Considerations

#### Horizontal Scaling
- Serverless functions (auto-scaling)
- CDN edge locations worldwide
- Database connection pooling
- Read replicas for heavy queries

#### Vertical Scaling
- Supabase compute upgrades
- Database performance tuning
- Index optimization
- Query optimization

#### Caching Layers
1. **CDN Cache**: Static assets
2. **Redis Cache**: API responses
3. **Browser Cache**: User session data
4. **Database Cache**: Query results

### Future Architecture Enhancements

#### Planned Improvements
- [ ] GraphQL API layer
- [ ] WebSocket for real-time features
- [ ] Microservices for heavy computations
- [ ] Event-driven architecture with message queues
- [ ] Multi-region deployment
- [ ] Progressive Web App (PWA)
- [ ] Mobile apps (React Native)

## Technology Decisions

### Why Next.js 15?
- App Router for better performance
- Server Components reduce JavaScript bundle
- Built-in optimization features
- Excellent developer experience
- Strong TypeScript support

### Why Supabase?
- Open-source alternative to Firebase
- PostgreSQL for data integrity
- Built-in authentication
- Real-time subscriptions
- Row-Level Security
- Generous free tier

### Why Vercel?
- Seamless Next.js integration
- Global edge network
- Automatic preview deployments
- Built-in analytics
- Zero-config deployment

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vercel Documentation](https://vercel.com/docs)
