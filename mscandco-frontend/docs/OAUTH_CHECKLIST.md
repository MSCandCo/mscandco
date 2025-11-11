# ✅ OAuth Credentials Quick Checklist

Use this checklist to track your progress getting OAuth credentials for each platform.

## 📋 Platform Status

### 1. Instagram (via Facebook)
- [ ] Facebook Developer account created
- [ ] Facebook App created
- [ ] Instagram Basic Display product added
- [ ] OAuth redirect URI added
- [ ] App ID copied → `INSTAGRAM_CLIENT_ID`
- [ ] App Secret copied → `INSTAGRAM_CLIENT_SECRET`
- [ ] Added to `.env.local`
- [ ] Tested OAuth flow

### 2. TikTok
- [ ] TikTok Developer account created
- [ ] TikTok App created
- [ ] OAuth redirect URI added
- [ ] Scopes requested (user.info.basic, video.upload, video.list)
- [ ] Client Key copied → `TIKTOK_CLIENT_KEY`
- [ ] Client Secret copied → `TIKTOK_CLIENT_SECRET`
- [ ] Added to `.env.local`
- [ ] Tested OAuth flow

### 3. Twitter/X
- [ ] Twitter Developer account created
- [ ] Twitter App created
- [ ] OAuth 2.0 configured
- [ ] Redirect URI added
- [ ] Client ID copied → `TWITTER_CLIENT_ID`
- [ ] Client Secret copied → `TWITTER_CLIENT_SECRET`
- [ ] Added to `.env.local`
- [ ] Tested OAuth flow

### 4. Facebook
- [ ] Using same app as Instagram (or separate app created)
- [ ] Facebook Login product added
- [ ] OAuth redirect URI added
- [ ] App ID copied → `FACEBOOK_APP_ID`
- [ ] App Secret copied → `FACEBOOK_APP_SECRET`
- [ ] Added to `.env.local`
- [ ] Tested OAuth flow

### 5. YouTube (via Google)
- [ ] Google Cloud account created
- [ ] Google Cloud project created
- [ ] YouTube Data API v3 enabled
- [ ] OAuth consent screen configured
- [ ] OAuth client created (Web application)
- [ ] Redirect URI added
- [ ] Client ID copied → `YOUTUBE_CLIENT_ID`
- [ ] Client Secret copied → `YOUTUBE_CLIENT_SECRET`
- [ ] Added to `.env.local`
- [ ] Tested OAuth flow

## 🔧 Environment Variables

Verify all credentials are in `.env.local`:

```bash
# Instagram
INSTAGRAM_CLIENT_ID=...
INSTAGRAM_CLIENT_SECRET=...

# TikTok
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...

# Twitter
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...

# Facebook
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...

# YouTube
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...

# Base URL
NEXT_PUBLIC_URL=https://yourdomain.com
```

## 🧪 Testing

- [ ] All platforms tested in development
- [ ] OAuth redirects working correctly
- [ ] Access tokens being saved to database
- [ ] Social media posting functionality tested

## 📚 Documentation

- [ ] Read full guide: `docs/OAUTH_CREDENTIALS_SETUP.md`
- [ ] Platform-specific requirements understood
- [ ] App review processes initiated (where required)

## 🚀 Production Ready

- [ ] All apps submitted for review (if required)
- [ ] Production redirect URIs configured
- [ ] Credentials added to Vercel environment variables
- [ ] Production OAuth flow tested

---

**Quick Links:**
- Full Guide: `mscandco-frontend/docs/OAUTH_CREDENTIALS_SETUP.md`
- OAuth Callback: `mscandco-frontend/app/api/features/social/oauth/callback/route.js`

