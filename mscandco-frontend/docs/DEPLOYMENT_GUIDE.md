# Deployment Guide

## Overview

This guide covers deploying the MSC & Co platform to production using Vercel, Supabase, and various integrated services.

## Prerequisites

Before deploying, ensure you have:

- [ ] Vercel account with appropriate plan
- [ ] Supabase project (production instance)
- [ ] GitHub repository access
- [ ] Domain name configured
- [ ] SSL certificate (automatic via Vercel)
- [ ] Access to all third-party service accounts

## Architecture Overview

```
Production Environment
├── Frontend & API: Vercel Edge Network
├── Database: Supabase (PostgreSQL)
├── Authentication: Supabase Auth
├── Storage: Supabase Storage
├── Email: Resend via Supabase Edge Functions
├── Payments: Revolut Business API
├── Monitoring: Sentry + PostHog
└── Background Jobs: Inngest
```

## Step-by-Step Deployment

### 1. Supabase Setup

#### Create Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project:
   - **Name**: `mscandco-production`
   - **Database Password**: Strong password (save securely)
   - **Region**: Choose closest to target audience
   - **Plan**: Pro or above for production

#### Configure Database

```bash
# Connect to Supabase project
npx supabase link --project-ref your-project-ref

# Push database schema
npx supabase db push

# Or run migrations manually
node database/run-migration.js
```

#### Enable Required Extensions

```sql
-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
```

#### Configure Row-Level Security (RLS)

```bash
# Run RLS setup script
node database/setup-rls.js
```

Or apply manually via SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- See database/rls-policies.sql for complete policy definitions
```

#### Set Up Storage Buckets

```bash
# Create storage buckets
npx supabase storage create-bucket profile-pictures --public
npx supabase storage create-bucket release-covers --public
npx supabase storage create-bucket audio-files --private
npx supabase storage create-bucket contracts --private
npx supabase storage create-bucket email-templates --public
```

Configure bucket policies:

```sql
-- Profile pictures: Public read, authenticated write
CREATE POLICY "Public can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload own profile picture"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Similar policies for other buckets...
```

#### Configure Auth Settings

1. Go to **Authentication > Settings**
2. Configure:
   - **Site URL**: `https://mscandco.com`
   - **Redirect URLs**:
     - `https://mscandco.com/auth/callback`
     - `https://mscandco.com/auth/confirm`
   - **JWT Expiry**: 3600 seconds (1 hour)
   - **Refresh Token Expiry**: 604800 seconds (7 days)

3. **Email Templates** (Supabase Auth):
   - Confirmation email
   - Password reset
   - Magic link
   - Email change confirmation

   Use branded templates from `email-templates/auth/`

#### Deploy Edge Functions

```bash
# Deploy email delivery function
npx supabase functions deploy send-email --project-ref your-project-ref

# Deploy webhook handler
npx supabase functions deploy webhook-handler --project-ref your-project-ref

# Set secrets
npx supabase secrets set RESEND_API_KEY=your-resend-key
npx supabase secrets set REVOLUT_WEBHOOK_SECRET=your-webhook-secret
```

### 2. Vercel Deployment

#### Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import from GitHub:
   - Repository: `mscandco-frontend`
   - Framework Preset: **Next.js**
   - Root Directory: `./`

#### Configure Build Settings

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```bash
npm install
```

**Development Command:**
```bash
npm run dev
```

#### Environment Variables

Add all environment variables in Vercel Dashboard > Settings > Environment Variables:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URLs
NEXT_PUBLIC_BASE_URL=https://mscandco.com
NEXTAUTH_URL=https://mscandco.com

# Revolut Payment Integration
REVOLUT_ENVIRONMENT=live
REVOLUT_API_KEY=your-production-api-key
REVOLUT_WEBHOOK_SECRET=your-webhook-secret
REVOLUT_MERCHANT_ID=your-merchant-id

# Admin Configuration
SUPER_ADMIN_USER_ID=your-super-admin-uuid

# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=msc-co
SENTRY_PROJECT=mscandco-frontend
SENTRY_AUTH_TOKEN=your-auth-token

# Upstash Redis
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Inngest Background Jobs
INNGEST_EVENT_KEY=your-event-key
INNGEST_SIGNING_KEY=your-signing-key
INNGEST_APP_ID=mscandco-production

# Vercel Cron Secret
CRON_SECRET=generate-random-secret-here

# Email (Resend)
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=noreply@mscandco.com
```

**Important**: Set different values for Production, Preview, and Development environments.

#### Domain Configuration

1. **Add Custom Domain**:
   - Go to **Settings > Domains**
   - Add: `mscandco.com`
   - Add: `www.mscandco.com` (redirect to apex)

2. **DNS Configuration**:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**: Automatically provisioned by Vercel

#### Deploy

```bash
# Deploy from local machine
vercel --prod

# Or push to main branch (auto-deployment)
git push origin main
```

### 3. Email Configuration (Resend)

#### Domain Verification

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add domain: `mscandco.com`
3. Add DNS records provided:

```
Type: TXT
Name: @
Value: [verification code]

Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@mscandco.com

Type: TXT
Name: [provided]
Value: [DKIM record]
```

4. Verify domain

#### Configure Sending

1. **From Address**: `noreply@mscandco.com`
2. **Reply-To**: `support@mscandco.com`
3. **Rate Limits**: Adjust based on plan

#### Upload Email Templates

```bash
# Templates are stored in Supabase Storage
# Upload via Supabase dashboard or script:
node scripts/upload-email-templates.js
```

### 4. Payment Integration (Revolut)

#### Production API Setup

1. Log in to [Revolut Business](https://business.revolut.com)
2. Go to **Developer > API**
3. Create Production API key:
   - **Name**: MSC & Co Production
   - **Permissions**: Read/Write for Merchant API
4. Save API key securely

#### Webhook Configuration

1. Go to **Webhooks** in Revolut Dashboard
2. Add webhook:
   - **URL**: `https://mscandco.com/api/webhooks/revolut`
   - **Events**:
     - `payment_succeeded`
     - `payment_failed`
     - `payout_completed`
     - `payout_failed`
   - **Secret**: Generate and save securely

3. Test webhook:
```bash
curl -X POST https://mscandco.com/api/webhooks/revolut \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: test-signature" \
  -d '{"event": "test"}'
```

### 5. Monitoring Setup

#### Sentry Configuration

1. Create project in [Sentry](https://sentry.io)
2. Configure:
   - **Platform**: Next.js
   - **Project Name**: mscandco-frontend
3. Update `sentry.client.config.js` and `sentry.server.config.js`
4. Deploy with source maps:

```bash
# Already configured in next.config.js
# Source maps upload automatically during build
```

#### PostHog Setup

1. Create project in [PostHog](https://posthog.com)
2. Get project API key
3. Configure feature flags (optional)
4. Set up dashboards:
   - User activity
   - Feature usage
   - Conversion funnels

### 6. Background Jobs (Inngest)

#### Production Setup

1. Create production app in [Inngest Cloud](https://app.inngest.com)
2. Get event key and signing key
3. Configure webhook:
   - **URL**: `https://mscandco.com/api/inngest`

4. Deploy functions:

```javascript
// app/api/inngest/route.js
import { inngest } from '@/lib/inngest/client';
import { sendEmail } from '@/lib/inngest/functions/send-email';
import { processRoyalties } from '@/lib/inngest/functions/process-royalties';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendEmail,
    processRoyalties,
    // ... other functions
  ],
});
```

#### Test Functions

```bash
# Trigger test event
curl -X POST https://mscandco.com/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "app/test", "data": {}}'
```

### 7. Caching (Upstash Redis)

#### Setup

1. Create database in [Upstash Console](https://console.upstash.com)
2. Configure:
   - **Region**: Choose closest to Vercel region
   - **Type**: Global (multi-region) for best performance

3. Get credentials and add to Vercel environment variables

#### Usage

```javascript
// lib/redis.js
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache API responses
const cacheKey = `analytics:${userId}:${date}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return cached;
}

const data = await fetchAnalytics();
await redis.set(cacheKey, data, { ex: 3600 }); // Cache for 1 hour
return data;
```

## Post-Deployment Checklist

### Database
- [ ] All migrations applied successfully
- [ ] RLS policies enabled and tested
- [ ] Database backup configured
- [ ] Performance indexes created
- [ ] Connection pooling configured

### Application
- [ ] All environment variables set correctly
- [ ] Build successful without errors
- [ ] No console errors in production
- [ ] Source maps uploaded to Sentry
- [ ] Analytics tracking working

### Security
- [ ] HTTPS enabled and forced
- [ ] Security headers configured
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] API endpoints protected
- [ ] File upload size limits set

### Integrations
- [ ] Supabase Auth working
- [ ] Email delivery tested
- [ ] Payment webhooks receiving
- [ ] Background jobs running
- [ ] Monitoring active

### Performance
- [ ] Core Web Vitals passing
- [ ] Image optimization working
- [ ] CDN caching configured
- [ ] API response times acceptable
- [ ] Database queries optimized

### Compliance
- [ ] Privacy policy accessible
- [ ] Terms of service accessible
- [ ] Cookie consent implemented
- [ ] GDPR compliance
- [ ] Data retention policies

## Monitoring & Maintenance

### Health Checks

Create monitoring endpoints:

```javascript
// app/api/health/route.js
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    storage: await checkStorage(),
  };

  const healthy = Object.values(checks).every(c => c.status === 'ok');

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
```

Monitor with:
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://pingdom.com)
- Vercel's built-in monitoring

### Logging

```javascript
// lib/logger.js
import * as Sentry from '@sentry/nextjs';

export const logger = {
  info: (message, data) => {
    console.log(message, data);
    // Send to logging service if needed
  },

  error: (message, error, context) => {
    console.error(message, error);
    Sentry.captureException(error, { contexts: { custom: context } });
  },

  warn: (message, data) => {
    console.warn(message, data);
  },
};
```

### Database Backups

Supabase provides automatic backups. Configure:

1. Go to **Database > Backups**
2. Enable **Point-in-Time Recovery** (PITR)
3. Set retention period (7-30 days)
4. Test restoration process

Manual backup:

```bash
# Backup database
pg_dump -h db.project.supabase.co \
  -U postgres \
  -d postgres \
  --format=custom \
  --file=backup-$(date +%Y%m%d).dump
```

### Rollback Procedure

If deployment fails:

```bash
# Rollback via Vercel CLI
vercel rollback

# Or via Vercel Dashboard:
# Deployments > Previous deployment > Promote to Production
```

For database rollback:

```bash
# Restore from backup
pg_restore -h db.project.supabase.co \
  -U postgres \
  -d postgres \
  --clean \
  backup-20241029.dump
```

## Scaling Considerations

### Database Scaling

- **Vertical**: Upgrade Supabase plan for more resources
- **Horizontal**: Read replicas for read-heavy workloads
- **Connection Pooling**: Use PgBouncer (included in Supabase)

### Application Scaling

Vercel automatically scales based on traffic:
- **Serverless Functions**: Auto-scaling
- **Edge Network**: Global CDN
- **Concurrent Builds**: Based on plan

### Performance Optimization

1. **Enable ISR** for semi-static pages:
```javascript
export const revalidate = 3600; // Revalidate every hour
```

2. **Use Edge Functions** for low-latency:
```javascript
export const runtime = 'edge';
```

3. **Implement Caching**:
```javascript
// Cache expensive queries
const cached = await redis.get(cacheKey);
if (cached) return cached;

const data = await expensiveQuery();
await redis.set(cacheKey, data, { ex: 3600 });
```

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Check build logs
vercel logs

# Test build locally
npm run build

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Database Connection Issues

```javascript
// Check connection
const { data, error } = await supabase.from('user_profiles').select('count');
if (error) console.error('Database error:', error);
```

#### Email Delivery Issues

1. Check Resend dashboard for bounces/complaints
2. Verify DNS records are correct
3. Test with different email providers
4. Check spam score: [mail-tester.com](https://www.mail-tester.com)

#### Performance Issues

```bash
# Check Core Web Vitals
# Use Lighthouse in Chrome DevTools

# Check API performance
# Use Vercel Analytics or PostHog

# Profile database queries
EXPLAIN ANALYZE SELECT * FROM releases WHERE artist_id = 'uuid';
```

## Security Updates

### Regular Maintenance

```bash
# Update dependencies monthly
npm update

# Check for security vulnerabilities
npm audit

# Update to latest Next.js (quarterly)
npm install next@latest react@latest react-dom@latest
```

### Security Headers

Configured in `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Internal Runbook**: Contact DevOps team
- **Emergency Contact**: tech@mscandco.com
