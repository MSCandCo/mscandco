# 🔐 Complete OAuth Credentials Setup Guide

## 📋 Overview

This guide walks you through getting OAuth credentials for each platform integrated with MSC & Co. You'll need these credentials to enable social media automation features.

## 🎯 Platforms Requiring OAuth

1. **Instagram** (via Facebook)
2. **TikTok**
3. **Twitter/X**
4. **Facebook**
5. **YouTube** (via Google)

---

## 1. 📸 Instagram OAuth Setup

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Click **"Create App"**
3. Select **"Business"** as app type
4. Fill in:
   - **App Name**: MSC & Co Platform (or your preferred name)
   - **App Contact Email**: your-email@domain.com
   - Click **"Create App"**

### Step 2: Add Instagram Product
1. In your app dashboard, click **"Add Product"**
2. Find **"Instagram Basic Display"** and click **"Set Up"**
3. Click **"Create New App"** → **"Instagram Basic Display"**

### Step 3: Configure OAuth Settings
1. Go to **Settings** → **Basic**
2. Add **App Domains**: `yourdomain.com`
3. Add **Privacy Policy URL**: `https://yourdomain.com/privacy`
4. Add **Terms of Service URL**: `https://yourdomain.com/terms`
5. Add **User Data Deletion URL**: `https://yourdomain.com/delete-data`
6. Click **"Save Changes"**

### Step 4: Add OAuth Redirect URIs
1. Go to **Products** → **Instagram Basic Display** → **Basic Display**
2. Under **"Valid OAuth Redirect URIs"**, add:
   ```
   https://yourdomain.com/api/features/social/oauth/callback?platform=instagram
   http://localhost:3000/api/features/social/oauth/callback?platform=instagram
   ```
3. Click **"Save Changes"**

### Step 5: Get Credentials
1. Go to **Settings** → **Basic**
2. Copy **App ID** → This is your `INSTAGRAM_CLIENT_ID`
3. Click **"Show"** next to App Secret → Copy → This is your `INSTAGRAM_CLIENT_SECRET`

### Step 6: Add to .env.local
```bash
INSTAGRAM_CLIENT_ID=your_app_id_here
INSTAGRAM_CLIENT_SECRET=your_app_secret_here
```

### ⚠️ Important Notes
- Instagram Basic Display requires app review for production use
- Test users can be added in **Roles** → **Roles** → **Add Test Users**
- For production, submit for **App Review** (can take 1-2 weeks)

---

## 2. 🎵 TikTok OAuth Setup

### Step 1: Create TikTok Developer Account
1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Click **"Log In"** (use your TikTok account)
3. Click **"Get Started"** → **"Register as a Developer"**
4. Fill in:
   - **Developer Type**: Individual or Business
   - **Use Case**: Select "Music Distribution" or "Social Media Management"
   - **App Name**: MSC & Co Platform
   - **App Description**: Music distribution platform with social media automation
   - Click **"Submit"**

### Step 2: Create App
1. After approval (usually instant), go to **"My Apps"**
2. Click **"Create App"**
3. Fill in:
   - **App Name**: MSC & Co Platform
   - **App Icon**: Upload your logo
   - **App Description**: Music distribution and social media automation
   - **Category**: Select "Entertainment" or "Music"
   - Click **"Create"**

### Step 3: Configure OAuth Settings
1. In your app dashboard, go to **"Basic Information"**
2. Under **"Platform Information"**, add:
   - **Website URL**: `https://yourdomain.com`
   - **Privacy Policy URL**: `https://yourdomain.com/privacy`
   - **Terms of Service URL**: `https://yourdomain.com/terms`

### Step 4: Add Redirect URI
1. Go to **"Platform"** → **"Web"**
2. Under **"Redirect URI"**, add:
   ```
   https://yourdomain.com/api/features/social/oauth/callback?platform=tiktok
   http://localhost:3000/api/features/social/oauth/callback?platform=tiktok
   ```
3. Click **"Save"**

### Step 5: Request Scopes
1. Go to **"Scopes"**
2. Request these scopes:
   - `user.info.basic` - Basic user information
   - `video.upload` - Upload videos
   - `video.list` - List user videos
   - `video.publish` - Publish videos
3. Click **"Submit for Review"** (required for production)

### Step 6: Get Credentials
1. Go to **"Basic Information"**
2. Copy **Client Key** → This is your `TIKTOK_CLIENT_KEY`
3. Copy **Client Secret** → This is your `TIKTOK_CLIENT_SECRET`

### Step 7: Add to .env.local
```bash
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
```

### ⚠️ Important Notes
- TikTok requires app review for production use
- Test mode allows limited API calls
- Video upload requires additional permissions

---

## 3. 🐦 Twitter/X OAuth Setup

### Step 1: Create Twitter Developer Account
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Click **"Sign Up"** or **"Log In"**
3. Complete developer account application:
   - **Use Case**: Select "Making a bot" or "Exploring the API"
   - **App Name**: MSC & Co Platform
   - **App Description**: Music distribution platform with social media automation
   - **Website URL**: `https://yourdomain.com`
   - Click **"Submit"**

### Step 2: Create App
1. After approval, go to **"Projects & Apps"** → **"Overview"**
2. Click **"Create App"** or **"Create Project"**
3. Fill in:
   - **App Name**: MSC & Co Platform
   - **App Environment**: Production
   - Click **"Next"**

### Step 3: Configure OAuth 2.0 Settings
1. Go to **"User authentication settings"**
2. Click **"Set up"**
3. Configure:
   - **App permissions**: Read and Write (or Read only if just posting)
   - **Type of App**: Web App, Automated App or Bot
   - **App info**:
     - **Callback URI / Redirect URL**: 
       ```
       https://yourdomain.com/api/features/social/oauth/callback?platform=twitter
       http://localhost:3000/api/features/social/oauth/callback?platform=twitter
       ```
     - **Website URL**: `https://yourdomain.com`
4. Click **"Save"**

### Step 4: Get Credentials
1. Go to **"Keys and tokens"**
2. Under **"OAuth 2.0 Client ID and Client Secret"**:
   - Copy **Client ID** → This is your `TWITTER_CLIENT_ID`
   - Copy **Client Secret** → This is your `TWITTER_CLIENT_SECRET`
3. Under **"OAuth 2.0 Bearer Token"** (optional):
   - Copy Bearer Token if you need it

### Step 5: Add to .env.local
```bash
TWITTER_CLIENT_ID=your_client_id_here
TWITTER_CLIENT_SECRET=your_client_secret_here
```

### ⚠️ Important Notes
- Twitter uses OAuth 2.0 with PKCE
- Requires elevated access for write permissions
- Rate limits apply based on access level

---

## 4. 👥 Facebook OAuth Setup

### Step 1: Use Existing Facebook App
Since Instagram uses Facebook, you can use the same app:
1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Select your existing app (created for Instagram)

### Step 2: Add Facebook Login Product
1. In your app dashboard, click **"Add Product"**
2. Find **"Facebook Login"** and click **"Set Up"**
3. Select **"Web"** as platform

### Step 3: Configure OAuth Settings
1. Go to **Settings** → **Basic**
2. Ensure these are set:
   - **App Domains**: `yourdomain.com`
   - **Privacy Policy URL**: `https://yourdomain.com/privacy`
   - **Terms of Service URL**: `https://yourdomain.com/terms`

### Step 4: Add Redirect URIs
1. Go to **Facebook Login** → **Settings**
2. Under **"Valid OAuth Redirect URIs"**, add:
   ```
   https://yourdomain.com/api/features/social/oauth/callback?platform=facebook
   http://localhost:3000/api/features/social/oauth/callback?platform=facebook
   ```
3. Click **"Save Changes"**

### Step 5: Get Credentials
1. Go to **Settings** → **Basic**
2. Copy **App ID** → This is your `FACEBOOK_APP_ID`
3. Click **"Show"** next to App Secret → Copy → This is your `FACEBOOK_APP_SECRET`

### Step 6: Add to .env.local
```bash
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
```

### ⚠️ Important Notes
- Same app can be used for both Instagram and Facebook
- Requires app review for certain permissions
- Test mode available for development

---

## 5. 📺 YouTube OAuth Setup (via Google)

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Fill in:
   - **Project Name**: MSC & Co Platform
   - **Organization**: (optional)
   - Click **"Create"**

### Step 2: Enable YouTube Data API
1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"YouTube Data API v3"**
3. Click on it → Click **"Enable"**

### Step 3: Create OAuth 2.0 Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen:
   - **User Type**: External (or Internal if using Google Workspace)
   - **App Name**: MSC & Co Platform
   - **User support email**: your-email@domain.com
   - **Developer contact**: your-email@domain.com
   - **Scopes**: Add `https://www.googleapis.com/auth/youtube.upload`
   - Click **"Save and Continue"** through all steps
   - Click **"Back to Dashboard"**

### Step 4: Create OAuth Client
1. Go back to **"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
2. Select **"Web application"**
3. Fill in:
   - **Name**: MSC & Co Platform
   - **Authorized JavaScript origins**:
     ```
     https://yourdomain.com
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     https://yourdomain.com/api/features/social/oauth/callback?platform=youtube
     http://localhost:3000/api/features/social/oauth/callback?platform=youtube
     ```
4. Click **"Create"**

### Step 5: Get Credentials
1. A popup will show your credentials:
   - Copy **Client ID** → This is your `YOUTUBE_CLIENT_ID`
   - Copy **Client Secret** → This is your `YOUTUBE_CLIENT_SECRET`
2. Click **"OK"**

### Step 6: Add to .env.local
```bash
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
```

### ⚠️ Important Notes
- OAuth consent screen requires verification for production
- YouTube API has quota limits (10,000 units/day by default)
- Request quota increase if needed

---

## 📝 Complete .env.local Template

```bash
# =============================================================================
# SOCIAL MEDIA OAUTH CREDENTIALS
# =============================================================================

# Instagram (via Facebook)
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret

# TikTok
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Twitter/X
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Facebook
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# YouTube (via Google)
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret

# Base URL (required for OAuth callbacks)
NEXT_PUBLIC_URL=https://yourdomain.com
```

---

## ✅ Verification Checklist

After setting up each platform:

- [ ] Instagram: App created, redirect URI added, credentials copied
- [ ] TikTok: App created, scopes requested, credentials copied
- [ ] Twitter: App created, OAuth 2.0 configured, credentials copied
- [ ] Facebook: App created (or using Instagram app), credentials copied
- [ ] YouTube: Google Cloud project created, API enabled, credentials created
- [ ] All credentials added to `.env.local`
- [ ] `NEXT_PUBLIC_URL` set correctly

---

## 🧪 Testing OAuth Flow

### Test Each Platform:
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to social media settings in your app

3. Click "Connect" for each platform

4. You should be redirected to the platform's OAuth page

5. After authorization, you should be redirected back to your app

### Common Issues:

**"Invalid Redirect URI"**
- Check that redirect URIs match exactly (including protocol, domain, path)
- Ensure no trailing slashes
- Check for typos

**"App Not Approved"**
- Some platforms require app review for production
- Use test mode for development
- Add test users where applicable

**"Invalid Client ID/Secret"**
- Double-check credentials are copied correctly
- Ensure no extra spaces
- Regenerate if needed

---

## 🔒 Security Best Practices

1. **Never commit `.env.local` to git**
   - Already in `.gitignore`

2. **Use different credentials for dev/prod**
   - Development: `localhost:3000` redirect URIs
   - Production: Your domain redirect URIs

3. **Rotate credentials regularly**
   - Every 90 days recommended
   - Immediately if compromised

4. **Store secrets securely**
   - Use Vercel Environment Variables for production
   - Encrypt sensitive tokens in database

5. **Monitor API usage**
   - Set up alerts for unusual activity
   - Track quota limits

---

## 📚 Additional Resources

- [Facebook Developers Docs](https://developers.facebook.com/docs/)
- [TikTok Developers Docs](https://developers.tiktok.com/doc/)
- [Twitter API Docs](https://developer.twitter.com/en/docs)
- [YouTube Data API Docs](https://developers.google.com/youtube/v3)

---

## 🆘 Support

If you encounter issues:

1. Check platform-specific error messages
2. Verify redirect URIs match exactly
3. Ensure app is in correct mode (development/production)
4. Check API quotas/limits
5. Review platform developer documentation

---

**Last Updated**: January 2025
**Platform Versions**: Latest as of setup date

