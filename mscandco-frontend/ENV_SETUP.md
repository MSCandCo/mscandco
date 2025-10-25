# 🔐 Environment Variables Setup

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# ================================
# MSC & CO PLATFORM - ENVIRONMENT VARIABLES
# ================================

# --------------------------------
# Supabase (Database & Auth)
# --------------------------------
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_DB_PASSWORD=your_database_password

# --------------------------------
# Sentry (Error Tracking)
# --------------------------------
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# --------------------------------
# Upstash Redis (Caching)
# --------------------------------
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# --------------------------------
# PostHog (Analytics)
# --------------------------------
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# --------------------------------
# Inngest (Background Jobs)
# --------------------------------
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# --------------------------------
# Vercel Cron (Scheduled Jobs)
# --------------------------------
CRON_SECRET=your_cron_secret

# --------------------------------
# Environment
# --------------------------------
NEXT_PUBLIC_VERCEL_ENV=development
NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA=local
```

## Setup Instructions

### 1. Sentry (Error Tracking)

1. Go to [sentry.io](https://sentry.io) and create an account
2. **Choose your region:**
   - **EU** (Recommended for GDPR compliance and if your Supabase is in EU)
   - **US** (Faster if you're in North America)
3. Create a new project (Next.js)
4. Copy the DSN from the project settings
5. Generate an auth token in User Settings > Auth Tokens
6. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   SENTRY_ORG=your-org-name
   SENTRY_PROJECT=your-project-name
   SENTRY_AUTH_TOKEN=your-auth-token
   SENTRY_REGION=eu  # or 'us' (for GDPR compliance, use 'eu')
   ```

### 2. Upstash Redis (Caching)

1. Go to [upstash.com](https://upstash.com) and create an account
2. Create a new Redis database (choose a region close to your users)
3. Copy the REST URL and token from the database details
4. Add to `.env.local`:
   ```
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

### 3. PostHog (Analytics)

1. Go to [posthog.com](https://posthog.com) and create an account
2. Create a new project
3. Copy the Project API Key from Project Settings
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

### 4. Inngest (Background Jobs)

1. Go to [inngest.com](https://inngest.com) and create an account
2. Create a new app
3. Copy the Event Key and Signing Key from the app settings
4. Add to `.env.local`:
   ```
   INNGEST_EVENT_KEY=your-event-key
   INNGEST_SIGNING_KEY=your-signing-key
   ```

### 5. Vercel Cron (Scheduled Jobs)

1. Generate a random secret:
   ```bash
   openssl rand -base64 32
   ```
2. Add to `.env.local`:
   ```
   CRON_SECRET=your-random-secret
   ```
3. Add the same secret to Vercel environment variables

## Vercel Deployment

When deploying to Vercel:

1. Go to your project settings
2. Add all environment variables from `.env.local`
3. Make sure to add them to all environments (Production, Preview, Development)
4. Redeploy your application

## Testing Locally

After adding all environment variables:

```bash
npm run dev
```

Check the console for initialization messages:
- ✅ Sentry initialized
- ✅ Upstash Redis client initialized
- ✅ PostHog initialized
- 🔌 Supabase Realtime connected

## Troubleshooting

### Sentry not working
- Check that `NEXT_PUBLIC_SENTRY_DSN` is correct
- Verify auth token has `project:write` permission

### Redis not working
- Verify REST URL and token are correct
- Check Upstash dashboard for connection errors

### PostHog not tracking
- Check browser console for PostHog initialization
- Verify API key is correct
- Check PostHog dashboard for events

### Inngest jobs not running
- Verify event key and signing key are correct
- Check Inngest dashboard for job execution logs
- Make sure `/api/inngest` endpoint is accessible

