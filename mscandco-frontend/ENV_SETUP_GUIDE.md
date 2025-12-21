# Quick Start: Copy Staging Environment to Localhost

Since Vercel CLI doesn't show your environment variables (they might be encrypted), here's how to get them:

## Method 1: Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/mscandco/mscandco-frontend/settings/environment-variables
   ```

2. **For each environment variable:**
   - Click the "eye" icon to reveal the value
   - Copy the variable name and value
   - Add it to your `.env.local` file

3. **Create `.env.local` file:**
   ```bash
   cd mscandco-frontend
   cp .env.local.template .env.local
   # Then edit .env.local with values from Vercel dashboard
   ```

## Method 2: Browser Console (If staging site is running)

1. Open your staging site in the browser
2. Open Developer Console (F12)
3. Check `window.__NEXT_DATA__.env` or Network tab for API calls
4. Look for environment variables in the responses

## Method 3: Required Minimum Variables

At minimum, you need these 4 variables to get started:

```bash
# Required for authentication and database
NEXT_PUBLIC_SUPABASE_URL=     # From Vercel staging
NEXT_PUBLIC_SUPABASE_ANON_KEY= # From Vercel staging  
SUPABASE_SERVICE_ROLE_KEY=     # From Vercel staging (keep secret!)

# Required for local URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3013
NEXT_PUBLIC_SITE_URL=http://localhost:3013
NEXT_PUBLIC_API_URL=http://localhost:3013/api
NEXT_PUBLIC_APP_URL=http://localhost:3013
```

## After Setting Up .env.local

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Verify it's working:**
   - The app should start on http://localhost:3013
   - Try logging in with your staging credentials
   - Check browser console for any errors

## Security Note

- `.env.local` is in `.gitignore` - it won't be committed
- Never commit `.env.local` to git
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret - it has admin access
