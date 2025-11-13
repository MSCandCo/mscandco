# 🎨 Printful API Setup Guide

## Step-by-Step Instructions

### Step 1: Go to Printful Website
1. Visit: **https://www.printful.com/**
2. Click **"Sign Up"** (top right) if you don't have an account, or **"Log In"** if you do

### Step 2: Create Account (if new)
1. Click **"Sign Up"**
2. Enter your email: `info@audiostems.co.uk`
3. Create a password
4. Complete registration
5. Verify your email if required

### Step 3: Complete Store Setup (if new)
1. After logging in, you may be prompted to set up your store
2. Fill in basic information:
   - Store name: `MSC & Co Platform`
   - Country: Select your country
   - Currency: Select currency (GBP recommended)
3. Complete the setup wizard

### Step 4: Get Your API Key
1. After logging in, go to: **https://www.printful.com/dashboard/api**
2. Or navigate: **Dashboard** → **Settings** → **API** (left sidebar)
3. You'll see a section called **"API Access"** or **"API Keys"**
4. Click **"Generate API key"** or **"Create API key"**
5. **Copy the API key** - It will look like: `key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ **Important**: Copy it immediately - you won't be able to see it again!

### Step 5: Store Your API Key Securely
- The API key starts with `key-` followed by a long string
- Save it somewhere safe - you'll need it for our integration

---

## What You'll Get

- **API Key**: A long string starting with `key-` (e.g., `key-ABC123...`)
- **API Base URL**: `https://api.printful.com/`
- **Authentication**: API key in Authorization header (`Authorization: Bearer YOUR_API_KEY`)

---

## API Details

- **API Base URL**: `https://api.printful.com/`
- **Authentication**: Bearer Token (API Key)
- **Header Format**: `Authorization: Bearer key-YOUR_API_KEY`

---

## Next Steps

Once you have your API key:
1. We'll add it to `.env.local` as `PRINTFUL_API_KEY`
2. We'll add it to Vercel environment variables
3. We'll create the API integration code

---

## API Endpoints We'll Use

- `GET /stores` - List stores
- `GET /products` - List products (catalog)
- `GET /sync-products` - List synced products
- `POST /sync-products` - Sync a product
- `POST /orders` - Create order
- `GET /orders/{id}` - Get order status
- `GET /orders` - List orders
- `GET /files` - Upload file
- `GET /shipping/rates` - Get shipping rates

---

## Rate Limits

Printful API has rate limits:
- **Free tier**: 120 requests per minute
- **Commercial tier**: Higher limits

We'll implement rate limiting and caching to stay within limits.

---

## Important Notes

- ⚠️ **API keys are secret** - Never commit them to git
- ⚠️ **You can only see the API key once** - Copy it immediately
- ⚠️ **Test mode available** - Printful has a sandbox/test environment for testing


