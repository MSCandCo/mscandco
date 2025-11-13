# Revolut Payment Integration Setup Guide

This guide will help you set up the complete Revolut payment integration with webhooks for MSC & Co.

## 🚀 Quick Start

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# Revolut Payment Integration
REVOLUT_API_SECRET=sk_NA2MAJJTlnVFT2BwY6AEAgRtjOsHeGsCoWTWVeF9959PLKCUJ27srQlJjEH8w8Fu
REVOLUT_API_PUBLIC=pk_yo8FCmj0NxGAK9Zz0iI3SD1XKW1Dg2yHJ6Y7DDAbWu8IaX1D
REVOLUT_WEBHOOK_URL=http://localhost:3013/api/webhooks/revolut
REVOLUT_BASE_URL=https://sandbox-merchant.revolut.com
REVOLUT_WEBHOOK_SECRET=your_webhook_secret_from_setup_script
REVOLUT_WEBHOOK_ID=your_webhook_id_from_setup_script

# Base URL (required for redirect URLs)
NEXT_PUBLIC_BASE_URL=http://localhost:3013
```

### 2. Install Dependencies

```bash
npm install dotenv
```

### 3. Setup Webhook

Run the webhook setup script to register your webhook with Revolut:

```bash
node scripts/setup-revolut-webhook.js
```

This will:
- Register a webhook endpoint with Revolut
- Subscribe to payment events (ORDER_COMPLETED, ORDER_AUTHORISED, ORDER_CANCELLED)
- Generate a signing secret for webhook verification
- Save webhook details to `webhook-info.json`
- Display the `REVOLUT_WEBHOOK_SECRET` to add to your `.env.local`

### 4. Update Environment Variables

After running the setup script, add the webhook secret to your `.env.local`:

```bash
REVOLUT_WEBHOOK_SECRET=the_secret_from_setup_script
REVOLUT_WEBHOOK_ID=the_webhook_id_from_setup_script
```

### 5. Restart Development Server

```bash
npm run dev
```

## 📋 Files Created

### Core Integration Files

1. **`scripts/setup-revolut-webhook.js`** - Webhook registration script
2. **`lib/revolut-payment.js`** - Payment helper with currency conversion
3. **`pages/api/webhooks/revolut.js`** - Webhook handler with signature verification
4. **`pages/api/revolut/create-payment.js`** - Updated payment creation API

### Payment Result Pages

1. **`pages/billing/success.js`** - Payment successful page
2. **`pages/billing/failed.js`** - Payment failed page  
3. **`pages/billing/cancelled.js`** - Payment cancelled page

## 🔧 How It Works

### Payment Flow

1. **User clicks "Subscribe" or "Add Funds"** on `/billing` page
2. **Frontend calls** `/api/revolut/create-payment` with payment details
3. **API creates Revolut order** with proper redirect URLs:
   - Success: `/billing/success?order_id={ORDER_ID}&plan_id={PLAN_ID}`
   - Failure: `/billing/failed?order_id={ORDER_ID}&reason={FAILURE_REASON}`
   - Cancel: `/billing/cancelled?order_id={ORDER_ID}`
4. **User redirected to Revolut** payment page
5. **User completes payment** (or cancels/fails)
6. **Revolut sends webhook** to `/api/webhooks/revolut`
7. **Webhook processes payment**:
   - Verifies signature
   - Updates Supabase subscription status
   - Logs transaction
8. **User redirected back** to appropriate result page

### Webhook Processing

The webhook handler processes these events:
- `ORDER_COMPLETED` - Activates subscription, tops up wallet
- `ORDER_AUTHORISED` - Same as completed (for some payment methods)
- `ORDER_CANCELLED` - Logs cancellation
- `ORDER_PAYMENT_DECLINED` - Logs decline
- `ORDER_PAYMENT_FAILED` - Logs failure

## 🎯 Key Features

### ✅ Proper Redirect URLs
- Users are redirected back to your app after payment
- Different pages for success, failure, and cancellation
- Order ID and plan details passed in URL parameters

### ✅ Webhook Signature Verification
- HMAC-SHA256 signature verification
- Prevents webhook spoofing
- Secure payment processing

### ✅ Currency Conversion
- Supports 10 currencies (GBP, USD, EUR, CAD, AUD, JPY, CHF, SEK, NOK, DKK)
- Automatic conversion from GBP base prices
- Proper currency formatting

### ✅ Subscription Management
- Automatic subscription activation
- Supabase database updates
- Wallet balance management
- Transaction logging

### ✅ Error Handling
- Comprehensive error messages
- Fallback mechanisms
- Detailed logging for debugging

## 🧪 Testing

### Test Payment Flow

1. **Go to** `http://localhost:3013/billing`
2. **Select a plan** and click "Subscribe"
3. **Complete payment** on Revolut sandbox
4. **Check webhook logs** in terminal
5. **Verify subscription** in Supabase dashboard

### Test Webhook

```bash
# Test webhook endpoint directly
curl -X POST http://localhost:3013/api/webhooks/revolut \
  -H "Content-Type: application/json" \
  -H "Revolut-Signature: test_signature" \
  -d '{"event": "ORDER_COMPLETED", "data": {"id": "test_order"}}'
```

## 🔍 Debugging

### Check Webhook Logs

Webhook events are logged to the `webhook_logs` table in Supabase:

```sql
SELECT * FROM webhook_logs 
WHERE provider = 'revolut' 
ORDER BY created_at DESC;
```

### Check Payment Logs

Payment creation logs appear in your terminal:

```
🔄 Creating Revolut payment: { amount: 100, currency: 'GBP', planId: 'artist-pro' }
✅ Revolut payment created: { orderId: '123', checkoutUrl: 'https://...' }
```

### Check Webhook Processing

Webhook processing logs appear in your terminal:

```
📨 Revolut webhook received: { event: 'ORDER_COMPLETED', orderId: '123' }
✅ Webhook signature verified
💳 Processing subscription: { userId: '...', planId: 'artist-pro' }
✅ Payment processed successfully
```

## 🚨 Troubleshooting

### Common Issues

1. **"Missing REVOLUT_WEBHOOK_SECRET"**
   - Run the webhook setup script
   - Add the secret to `.env.local`
   - Restart the dev server

2. **"Invalid webhook signature"**
   - Check the webhook secret is correct
   - Ensure webhook URL is accessible
   - Verify Revolut can reach your localhost (use ngrok for testing)

3. **"Payment creation failed"**
   - Check API credentials are correct
   - Verify sandbox vs production URLs
   - Check network connectivity

4. **"Subscription not activated"**
   - Check webhook is receiving events
   - Verify Supabase permissions
   - Check subscription table schema

### Production Deployment

For production, update these environment variables:

```bash
# Production Revolut API
REVOLUT_BASE_URL=https://merchant.revolut.com
REVOLUT_API_SECRET=your_production_secret
REVOLUT_WEBHOOK_URL=https://yourdomain.com/api/webhooks/revolut
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 📞 Support

If you encounter issues:

1. Check the terminal logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test the webhook endpoint is accessible
4. Check Supabase database permissions
5. Contact Revolut support for API-specific issues

## 🎉 Success!

Once set up correctly, you'll have:
- ✅ Working payment flow with proper redirects
- ✅ Automatic subscription activation
- ✅ Secure webhook processing
- ✅ Multi-currency support
- ✅ Comprehensive error handling
- ✅ Production-ready integration

The redirect issue is now completely solved with proper webhook handling and redirect URLs! 🚀
