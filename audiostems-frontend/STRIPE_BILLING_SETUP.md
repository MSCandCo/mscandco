# MSC & Co Music Distribution Platform - Stripe Billing Setup

## Overview
The platform has been configured with Stripe integration for the following pricing tiers:

### Paid Tiers
1. **Artist Starter** - $9.99/month ($99.99/year)
2. **Artist Pro** - $19.99/month ($199.99/year)
3. **Label Admin** - $29.99/month ($299.99/year)

### Free Access Tiers
1. **Distribution Partner** - Free
2. **Company Admin** - Free

## Configuration Status

### ✅ Completed
1. **Environment Variables** (.env.local)
   - Stripe API keys are configured (Live keys detected)
   - Price IDs are set for all paid tiers
   - Webhook secret placeholder added (needs actual value from Stripe Dashboard)

2. **Stripe Library** (lib/stripe.js)
   - Configured with proper product mappings
   - Helper functions for checkout and customer portal
   - Error handling for missing configuration

3. **Pricing Page** (pages/pricing.js)
   - Updated to show correct USD pricing
   - Free tiers properly marked
   - Currency conversion support maintained

4. **API Endpoints** (pages/api/billing/)
   - create-checkout-session.js updated to handle new pricing structure
   - Supports both plan names and direct price IDs

## Next Steps

### 1. Update Webhook Secret
In your Stripe Dashboard:
1. Go to Developers → Webhooks
2. Create a webhook endpoint pointing to: `https://yourdomain.com/api/billing/webhook`
3. Copy the signing secret (starts with `whsec_`)
4. Update `.env.local` with the actual webhook secret

### 2. Verify Price IDs
Ensure the price IDs in `.env.local` match your Stripe products:
```
STRIPE_ARTIST_STARTER_MONTHLY_PRICE_ID=price_1RqGadEbz7hJzxJVl0Af2eNP
STRIPE_ARTIST_STARTER_YEARLY_PRICE_ID=price_1RqGe0Ebz7hJzxJVxL6MJB4U
STRIPE_ARTIST_PRO_MONTHLY_PRICE_ID=price_1RqGdDEbz7hJzxJVidQol2Wz
STRIPE_ARTIST_PRO_YEARLY_PRICE_ID=price_1RqGhAEbz7hJzxJVkDb6B0sg
STRIPE_LABEL_ADMIN_MONTHLY_PRICE_ID=price_1RqH50Ebz7hJzxJVoNy6nV3d
STRIPE_LABEL_ADMIN_YEARLY_PRICE_ID=price_1RqH5KEbz7hJzxJVATdN9i7b
```

### 3. Test the Integration
1. Start the dev server: `npm run dev` (now runs on port 3001)
2. Navigate to `/pricing`
3. Test checkout flow for each paid tier
4. Verify free tiers redirect to dashboard without payment

### 4. Production Deployment
Before deploying to production:
1. Update `NEXT_PUBLIC_BASE_URL` in `.env.local` to your production URL
2. Update webhook endpoint in Stripe Dashboard to production URL
3. Test the entire billing flow in Stripe test mode first
4. Switch to live mode when ready

## Important Notes

- **Live Keys Detected**: Your `.env.local` contains live Stripe keys. Make sure to use test keys for development.
- **Free Tiers**: Distribution Partners and Company Admins bypass Stripe checkout and get immediate access.
- **Currency Support**: The pricing page maintains multi-currency display but charges in USD.
- **Webhook Security**: Always verify webhook signatures in production to prevent fraud.

## Troubleshooting

If you encounter issues:
1. Check browser console for errors
2. Verify all environment variables are loaded (`console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)`)
3. Ensure Stripe Dashboard has matching products and prices
4. Check API endpoint logs for detailed error messages