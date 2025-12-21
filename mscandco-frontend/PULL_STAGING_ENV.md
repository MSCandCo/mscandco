# How to Pull Staging Environment Variables to Localhost

Since environment variables aren't set in Vercel CLI, you'll need to copy them from the Vercel Dashboard:

## Option 1: Copy from Vercel Dashboard (Recommended)

1. Go to https://vercel.com/mscandco/mscandco-frontend/settings/environment-variables
2. Select the **Production** or **Preview** environment (whichever has staging config)
3. Copy each environment variable and add it to your local `.env.local` file

## Option 2: Use Vercel CLI to View Variables

```bash
cd mscandco-frontend
vercel env ls --environment=production
vercel env ls --environment=preview
```

## Required Environment Variables for Local Development

Based on the codebase, you'll need these at minimum:

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3013
NEXT_PUBLIC_SITE_URL=http://localhost:3013
NEXT_PUBLIC_API_URL=http://localhost:3013/api
NEXT_PUBLIC_APP_URL=http://localhost:3013

# Optional but Recommended
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Payment Integration (if using)
REVOLUT_API_KEY=your-revolut-key
REVOLUT_WEBHOOK_SECRET=your-webhook-secret

# Other integrations (optional, enable as needed)
OPENAI_API_KEY=your-openai-key
EVENTBRITE_API_KEY=your-eventbrite-key
# ... etc
```

## After Setting Up .env.local

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. The app should now connect to the same Supabase instance as staging

## Note

Your `.env.local` file is in `.gitignore` so it won't be committed. Make sure to keep it secure and never commit sensitive keys.

