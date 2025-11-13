# 🎪 Eventbrite API Setup Guide

## Step-by-Step Instructions

### Step 1: Go to Eventbrite Developer Portal
1. Visit: **https://www.eventbrite.com/platform/api/**
2. Click **"Get Started"** or **"Log In"** (top right)

### Step 2: Create Account (if new)
1. Click **"Sign Up"**
2. Enter your email: `info@audiostems.co.uk`
3. Create a password
4. Complete registration
5. Verify your email if required

### Step 3: Get Your API Key
1. After logging in, go to: **https://www.eventbrite.com/myaccount/apps/**
2. Or navigate: **Account Settings** → **Developer** → **API Keys**
3. Click **"Create API Key"** or **"Generate Token"**
4. Fill in:
   - **Application Name**: `MSC & Co Platform`
   - **Description**: `Music distribution platform for artists to manage events`
5. Click **"Create"** or **"Generate"**

### Step 4: Get Your OAuth Token (Personal Access Token)
1. After creating the API key, you'll see:
   - **API Key** (Public Key) - This is your `EVENTBRITE_API_KEY`
   - **Private Token** (OAuth Token) - This is your `EVENTBRITE_OAUTH_TOKEN`
2. **Copy both** - You'll need both values

### Alternative: Personal Access Token Method
If you see "Personal Access Token" instead:
1. Go to: **https://www.eventbrite.com/myaccount/apps/**
2. Click **"Create Token"** or **"Generate Personal Token"**
3. Copy the token (this is your OAuth token)

---

## What You'll Get

- **API Key**: Public key (starts with something like `ABC123...`)
- **OAuth Token**: Private token (long string, starts with something like `ABC123...` or `Bearer ABC123...`)

**Note**: Eventbrite uses OAuth 2.0, but for server-to-server API calls, you'll use the Personal Access Token (OAuth Token) in the Authorization header.

---

## API Details

- **API Base URL**: `https://www.eventbriteapi.com/v3/`
- **Authentication**: OAuth 2.0 Bearer Token
- **Header Format**: `Authorization: Bearer YOUR_OAUTH_TOKEN`

---

## Next Steps

Once you have your credentials:
1. We'll add them to `.env.local` as:
   - `EVENTBRITE_API_KEY`
   - `EVENTBRITE_OAUTH_TOKEN`
2. We'll add them to Vercel environment variables
3. We'll create the API integration code

---

## API Endpoints We'll Use

- `GET /users/me/` - Get authenticated user info
- `GET /events/` - List events
- `POST /events/` - Create event
- `GET /events/{id}/` - Get event details
- `PUT /events/{id}/` - Update event
- `GET /events/{id}/attendees/` - Get attendees
- `GET /venues/` - List venues
- `POST /venues/` - Create venue

---

## Rate Limits

Eventbrite API has rate limits:
- **Free tier**: 2,000 requests per hour
- **Commercial tier**: Higher limits

We'll implement rate limiting and caching to stay within limits.


