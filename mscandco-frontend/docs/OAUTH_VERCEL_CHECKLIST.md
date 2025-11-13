# ✅ OAuth Credentials - Vercel Setup Checklist

## Current Status

Based on Vercel environment variables check, the following OAuth credentials are **MISSING** and need to be added:

---

## 🔴 Missing OAuth Variables

### Instagram
- [ ] `INSTAGRAM_CLIENT_ID`
- [ ] `INSTAGRAM_CLIENT_SECRET`

### TikTok
- [ ] `TIKTOK_CLIENT_KEY` ⚠️ Note: It's `CLIENT_KEY`, not `CLIENT_ID`
- [ ] `TIKTOK_CLIENT_SECRET`

### Twitter/X
- [ ] `TWITTER_CLIENT_ID`
- [ ] `TWITTER_CLIENT_SECRET`

### Facebook
- [ ] `FACEBOOK_CLIENT_ID`
- [ ] `FACEBOOK_CLIENT_SECRET`

### YouTube
- [ ] `YOUTUBE_CLIENT_ID`
- [ ] `YOUTUBE_CLIENT_SECRET`

---

## 📝 Quick Add Guide

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to**: https://vercel.com/mscandco/mscandco/settings/environment-variables
2. **For each variable above**:
   - Click **"Add New"**
   - **Key**: Enter variable name (e.g., `INSTAGRAM_CLIENT_ID`)
   - **Value**: Paste your credential from `.env.local`
   - **Environments**: Select **ALL** ✅ Production ✅ Preview ✅ Development
   - Click **"Save"**

### Option 2: Via Vercel CLI

Run these commands (replace values with your actual credentials):

```bash
cd "/Users/htay/Documents/MSC & Co/mscandco-frontend"

# Instagram
vercel env add INSTAGRAM_CLIENT_ID production preview development
vercel env add INSTAGRAM_CLIENT_SECRET production preview development

# TikTok
vercel env add TIKTOK_CLIENT_KEY production preview development
vercel env add TIKTOK_CLIENT_SECRET production preview development

# Twitter
vercel env add TWITTER_CLIENT_ID production preview development
vercel env add TWITTER_CLIENT_SECRET production preview development

# Facebook
vercel env add FACEBOOK_CLIENT_ID production preview development
vercel env add FACEBOOK_CLIENT_SECRET production preview development

# YouTube
vercel env add YOUTUBE_CLIENT_ID production preview development
vercel env add YOUTUBE_CLIENT_SECRET production preview development
```

---

## ✅ After Adding Variables

1. **Redeploy** your application:
   ```bash
   vercel --prod
   ```

2. **Verify** variables are accessible:
   - Check Vercel function logs
   - Test OAuth flow in production

---

## 🔍 Verification

After adding all variables, run:
```bash
vercel env ls
```

You should see all 10 OAuth variables listed.

---

## 📋 Complete Variable List

Copy this and fill in your values before adding to Vercel:

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


