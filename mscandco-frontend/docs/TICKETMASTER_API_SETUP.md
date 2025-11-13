# 🎟️ Ticketmaster API Setup Guide

## Step-by-Step Instructions

### Step 1: Go to Ticketmaster Developer Portal
1. Visit: **https://developer.ticketmaster.com/**
2. Click **"Sign Up"** (top right) if you don't have an account, or **"Log In"** if you do

### Step 2: Create Account (if new)
1. Enter your email: `info@audiostems.co.uk`
2. Create a password
3. Complete registration
4. Verify your email if required

### Step 3: Create an Application
1. After logging in, click **"My Apps"** in the top navigation
2. Click **"Create App"** or **"Register New Application"** button
3. Fill in the form:
   - **App Name**: `MSC & Co Platform`
   - **Description**: `Music distribution platform for artists to manage events and ticket sales`
   - **Website URL**: `https://mscandco.com`
   - **Callback URL**: `https://mscandco.com/api/features/events/ticketmaster/callback` (optional)
4. Click **"Create"** or **"Register"**

### Step 4: Get Your API Key
1. In **"My Apps"**, click on your newly created app
2. Look for **"Consumer Key"** - this is your API key
3. **Copy the entire key** (it will look like a long string of characters)

### Step 5: Test Your API Key (Optional)
You can test it by making a simple API call:
```bash
curl "https://app.ticketmaster.com/discovery/v2/events.json?apikey=YOUR_API_KEY&keyword=music&size=1"
```

---

## What You'll Get

- **API Key**: A long string (your Consumer Key)
- **API Base URL**: `https://app.ticketmaster.com/discovery/v2/`
- **Authentication**: Add `?apikey=YOUR_KEY` to API requests

---

## Next Steps

Once you have your API key:
1. We'll add it to `.env.local` as `TICKETMASTER_API_KEY`
2. We'll add it to Vercel environment variables
3. We'll create the API integration code

---

## API Endpoints We'll Use

- `GET /events.json` - Search events
- `GET /venues.json` - Search venues  
- `GET /attractions.json` - Search attractions (artists)
- `GET /classifications.json` - Get event classifications

---

## Rate Limits

Ticketmaster API has rate limits:
- **Free tier**: Limited requests per day
- **Commercial tier**: Higher limits (requires approval)

We'll implement rate limiting and caching to stay within limits.


