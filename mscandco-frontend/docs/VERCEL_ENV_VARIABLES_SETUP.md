# 🔐 Vercel Environment Variables Setup Guide

## Required OAuth Environment Variables

Add these to your Vercel project settings:

### Instagram
```
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
```

### TikTok
```
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
```

### Twitter/X
```
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

### Facebook
```
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
```

### YouTube
```
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
```

---

## How to Add to Vercel

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your project: **mscandco** (or your project name)

### Step 2: Navigate to Environment Variables
1. Click **"Settings"** (top navigation)
2. Click **"Environment Variables"** (left sidebar)

### Step 3: Add Each Variable
For each variable above:
1. Click **"Add New"**
2. **Key**: Enter the variable name (e.g., `INSTAGRAM_CLIENT_ID`)
3. **Value**: Paste your credential
4. **Environments**: Select **ALL**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

### Step 4: Redeploy
After adding all variables:
1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger automatic deployment

---

## Verification Checklist

- [ ] All 10 OAuth variables added to Vercel
- [ ] All variables set for Production, Preview, and Development
- [ ] Application redeployed after adding variables
- [ ] Test OAuth flow in production to verify credentials work

---

## Quick Copy-Paste Format

Copy this entire block and fill in your values:

```bash
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
```

---

## Troubleshooting

### Variables Not Working?
1. **Check spelling**: Variable names are case-sensitive
2. **Check environments**: Make sure variables are added to the correct environment (Production/Preview/Development)
3. **Redeploy**: Variables only take effect after redeployment
4. **Check logs**: View Vercel function logs to see if variables are accessible

### Testing Locally
Make sure your `.env.local` file has all the same variables. Vercel variables don't apply to local development.

---

## Security Notes

⚠️ **Never commit these values to git!**
- They should only be in `.env.local` (local) and Vercel Environment Variables (production)
- `.env.local` is already in `.gitignore`
- Double-check that secrets aren't accidentally committed


