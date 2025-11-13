# MSC & Co Enterprise Features - Environment Variables Setup

## Required API Keys & Configuration

Add these environment variables to your `.env.local` file:

```bash
# =============================================================================
# EXISTING VARIABLES (Keep these)
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# =============================================================================
# FEATURE 1: AI ARTWORK GENERATION (DALL-E 3)
# =============================================================================
OPENAI_API_KEY=sk-...  # Get from https://platform.openai.com/api-keys
# Cost: ~$0.04 per image (DALL-E 3 standard quality)
# Credits system recommended to manage costs

# =============================================================================
# FEATURE 2: PLAYLIST PITCHING
# =============================================================================
# Email sending for pitch campaigns
SMTP_HOST=smtp.gmail.com  # Or your SMTP provider
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-app-specific-password  # Not your regular password!
SMTP_FROM_NAME=MSC & Co Platform

# For Gmail: Enable 2FA and create App Password
# https://support.google.com/accounts/answer/185833

# Tracking
NEXT_PUBLIC_URL=https://yourdomain.com  # For email tracking pixels

# =============================================================================
# FEATURE 3: SOCIAL MEDIA AUTOMATION (OAuth)
# =============================================================================

## Instagram OAuth
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
# Get from: https://developers.facebook.com/apps/
# 1. Create Facebook App
# 2. Add Instagram Basic Display product
# 3. Get OAuth credentials

## TikTok OAuth
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
# Get from: https://developers.tiktok.com/apps/
# Required scopes: user.info.basic, video.upload, video.list

## Twitter/X OAuth 2.0
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
# Get from: https://developer.twitter.com/en/portal/dashboard
# OAuth 2.0 with PKCE

## Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
# Same as Instagram (Facebook owns Instagram)

## YouTube OAuth
YOUTUBE_CLIENT_ID=your_google_oauth_client_id
YOUTUBE_CLIENT_SECRET=your_google_oauth_client_secret
# Get from: https://console.cloud.google.com/apis/credentials
# Enable YouTube Data API v3

# =============================================================================
# FEATURE 4: FAN ENGAGEMENT (No additional keys required)
# =============================================================================
# Uses existing Spotify/Apple Music streaming data APIs
# ML algorithms run server-side

# =============================================================================
# FEATURE 5: LIVE PERFORMANCE ANALYTICS
# =============================================================================

## Ticketmaster API
TICKETMASTER_API_KEY=your_ticketmaster_api_key
TICKETMASTER_API_SECRET=your_ticketmaster_secret
# Get from: https://developer.ticketmaster.com/
# Partner API access required for event creation

## Eventbrite API (Alternative)
EVENTBRITE_PRIVATE_TOKEN=your_eventbrite_token
EVENTBRITE_ORGANIZATION_ID=your_org_id
# Get from: https://www.eventbrite.com/platform/api#/introduction/authentication
# Create private token for your organization

# =============================================================================
# FEATURE 6: MERCHANDISE INTEGRATION
# =============================================================================

## Printful API (Print-on-Demand)
PRINTFUL_API_KEY=your_printful_api_key
# Get from: https://www.printful.com/dashboard/store
# Settings → API → Generate Access Token
# Free to integrate, pay only for fulfilled orders

## Shopify (Optional - for storefront)
SHOPIFY_SHOP_NAME=your-shop-name
SHOPIFY_ADMIN_API_ACCESS_TOKEN=your_shopify_token
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token
# Get from: https://yourshop.myshopify.com/admin/settings/apps
# Create private app with admin and storefront API access

## Stripe (Payment processing)
STRIPE_SECRET_KEY=sk_test_...  # Use sk_live_ for production
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Use pk_live_ for production
STRIPE_WEBHOOK_SECRET=whsec_...
# Get from: https://dashboard.stripe.com/apikeys

# =============================================================================
# ADVANCED AI LEARNING (Already implemented)
# =============================================================================
# Uses existing OpenAI API key (same as artwork generation)

# =============================================================================
# OPTIONAL: Rate Limiting & Monitoring
# =============================================================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100  # Per 15 minutes per user
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes

# Sentry (Error tracking)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# =============================================================================
# FEATURE FLAGS (Enable/Disable features)
# =============================================================================
ENABLE_AI_ARTWORK=true
ENABLE_PLAYLIST_PITCHING=true
ENABLE_SOCIAL_MEDIA=true
ENABLE_FAN_ENGAGEMENT=true
ENABLE_LIVE_PERFORMANCES=true
ENABLE_MERCHANDISE=true
ENABLE_AI_LEARNING=true
```

## Setup Priority Guide

### Phase 1: Core Features (Start Here)
```bash
# 1. AI Artwork Generation
OPENAI_API_KEY=sk-...

# 2. Playlist Pitching Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=app-password
```

### Phase 2: Social Media (OAuth setup required)
```bash
# Start with one platform at a time
INSTAGRAM_CLIENT_ID=...
INSTAGRAM_CLIENT_SECRET=...
```

### Phase 3: Monetization Features
```bash
# Merchandise
PRINTFUL_API_KEY=...
STRIPE_SECRET_KEY=...

# Live Performances
TICKETMASTER_API_KEY=...
# OR
EVENTBRITE_PRIVATE_TOKEN=...
```

## Cost Estimates

### Per Feature:
- **AI Artwork**: ~$0.04 per image (DALL-E 3)
- **Playlist Pitching**: Free (uses your SMTP)
- **Social Media**: Free (OAuth only)
- **Fan Engagement**: Free (ML calculations server-side)
- **Live Performance**: Free (Ticketmaster/Eventbrite free API)
- **Merchandise**: Free (Printful charges per order fulfilled)

### Monthly Estimates:
- Light usage (100 images, 50 campaigns): ~$10/month
- Medium usage (500 images, 200 campaigns): ~$40/month
- Heavy usage (2000 images, 1000 campaigns): ~$150/month

## Security Best Practices

1. **Never commit `.env.local` to git**
   ```bash
   # Already in .gitignore
   .env.local
   .env*.local
   ```

2. **Use different keys for development and production**

3. **Rotate API keys regularly** (every 90 days recommended)

4. **Use Vercel Environment Variables for production**
   ```bash
   # In Vercel dashboard:
   # Settings → Environment Variables
   # Add all keys as "Production" environment
   ```

5. **Encrypt sensitive keys in database**
   ```javascript
   // Social media tokens are stored encrypted
   // Using AES-256-GCM encryption
   ```

## Verification Checklist

Run this command to verify your setup:

```bash
node -e "
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const required = [
  'OPENAI_API_KEY',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASSWORD'
];
const missing = required.filter(k => !env.includes(k));
if (missing.length) {
  console.log('❌ Missing:', missing.join(', '));
} else {
  console.log('✅ All core environment variables configured!');
}
"
```

## Testing API Keys

### Test OpenAI (AI Artwork):
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Test Printful (Merchandise):
```bash
curl -X GET "https://api.printful.com/store/products" \
  -H "Authorization: Bearer $PRINTFUL_API_KEY"
```

### Test Ticketmaster:
```bash
curl "https://app.ticketmaster.com/discovery/v2/events.json?apikey=$TICKETMASTER_API_KEY"
```

## Troubleshooting

### OpenAI "Insufficient Quota"
- Add payment method: https://platform.openai.com/account/billing
- Set usage limits to prevent overcharges

### SMTP "Authentication Failed"
- Gmail: Enable 2FA and use App Password
- Outlook: Enable "Less secure app access"
- SendGrid/Mailgun: Use API keys instead

### OAuth "Invalid Redirect URI"
- Add `http://localhost:3000/api/features/social/oauth/callback` for dev
- Add `https://yourdomain.com/api/features/social/oauth/callback` for prod

### Printful "Unauthorized"
- Regenerate API key in dashboard
- Ensure no extra spaces in `.env.local`

## Support

- OpenAI: https://help.openai.com
- Printful: https://www.printful.com/help
- Ticketmaster: https://developer-support.ticketmaster.com
- Email issues: Check SMTP provider docs

## Next Steps

1. ✅ Database migrations applied
2. ✅ MCP server updated (v3.0.0)
3. → Add environment variables
4. → Test each feature individually
5. → Deploy to production

---

**Generated by Claude Code** - MSC & Co Enterprise Features v3.0.0
