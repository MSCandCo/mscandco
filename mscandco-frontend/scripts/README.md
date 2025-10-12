# AudioStems Stripe CLI Tool

A comprehensive command-line interface for managing Stripe resources for the AudioStems platform.

## 🚀 Quick Start

```bash
# Show help
npm run stripe

# View all products
npm run stripe:products

# View all prices  
npm run stripe:prices

# View webhook endpoints
npm run stripe:webhooks

# Start webhook listener for local development
npm run stripe:listen

# View customers
npm run stripe:customers

# View subscriptions
npm run stripe:subscriptions
```

## 📋 Available Commands

### Products Management
```bash
# List all products
node scripts/stripe-cli.js products

# Create a new product
node scripts/stripe-cli.js create-product "Product Name" "Product Description"

# Example: Create Label Admin Pro product
node scripts/stripe-cli.js create-product "Label Admin Pro" "Professional label management with unlimited artists"
```

### Prices Management
```bash
# List all prices
node scripts/stripe-cli.js prices

# Create a new price
node scripts/stripe-cli.js create-price <product_id> <amount> [currency] [interval]

# Examples:
node scripts/stripe-cli.js create-price prod_ABC123 49.99 gbp month
node scripts/stripe-cli.js create-price prod_ABC123 499.99 gbp year
node scripts/stripe-cli.js create-price prod_ABC123 29.99 usd month
```

### Webhooks Management
```bash
# List webhook endpoints
node scripts/stripe-cli.js webhooks

# Start local webhook listener (forwards to localhost:3001/api/webhooks/stripe)
node scripts/stripe-cli.js listen

# Test webhook with dummy event
node scripts/stripe-cli.js test-webhook
```

### Customer & Subscription Management
```bash
# List customers
node scripts/stripe-cli.js customers

# List subscriptions
node scripts/stripe-cli.js subscriptions
```

## 🔧 Configuration

Make sure your `.env.local` file contains:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (automatically shows format when creating prices)
STRIPE_ARTIST_STARTER_MONTHLY_PRICE_ID=price_1234567890
STRIPE_ARTIST_PRO_MONTHLY_PRICE_ID=price_1234567890
STRIPE_LABEL_ADMIN_STARTER_MONTHLY_PRICE_ID=price_1234567890
STRIPE_LABEL_ADMIN_PRO_MONTHLY_PRICE_ID=price_1234567890
# ... etc
```

## 🎯 Common Workflows

### 1. Setting Up New Plan
```bash
# 1. Create the product
node scripts/stripe-cli.js create-product "Artist Pro" "Professional plan for artists"

# 2. Create monthly price (output will show product ID)
node scripts/stripe-cli.js create-price prod_ABC123 49.99 gbp month

# 3. Create yearly price  
node scripts/stripe-cli.js create-price prod_ABC123 499.99 gbp year

# 4. Add the price IDs to your .env.local (format will be shown in output)
```

### 2. Development Testing
```bash
# 1. Start your Next.js app
npm run dev

# 2. In another terminal, start webhook listener
npm run stripe:listen

# 3. Test webhook functionality
node scripts/stripe-cli.js test-webhook

# 4. Monitor webhook events in the first terminal
```

### 3. Production Monitoring
```bash
# Check customer status
npm run stripe:customers

# Monitor active subscriptions
npm run stripe:subscriptions

# Verify webhook endpoints
npm run stripe:webhooks
```

## 🔍 Features

### ✅ Products & Prices
- List all products with details
- Create new products
- List all prices with product information
- Create new prices (monthly/yearly/one-time)
- Automatic environment variable format generation

### ✅ Webhooks
- List all webhook endpoints
- Start local webhook listener for development
- Test webhook functionality
- Integration with AudioStems webhook endpoint

### ✅ Customers & Subscriptions
- List customers with status
- View subscription details
- Monitor subscription status and billing

### ✅ Development Tools
- Color-coded output for easy reading
- Environment validation
- Test/Live mode detection
- Error handling and cleanup

## 🚨 Safety Features

- **Environment Detection**: Clearly shows TEST vs LIVE mode
- **Validation**: Checks for required environment variables
- **Test Cleanup**: Automatically cleans up test data
- **Error Handling**: Graceful error handling with helpful messages

## 📝 Example Output

### Products List
```
🚀 Stripe Products

================================================================================
1. Artist Starter
   ID: prod_ABC123
   Description: Basic plan for artists
   Active: Yes
   Created: 12/25/2024
   ----------------------------------------------------------------------
2. Label Admin Pro  
   ID: prod_DEF456
   Description: Professional label management
   Active: Yes
   Created: 12/25/2024
   ----------------------------------------------------------------------
================================================================================
```

### Price Creation
```
ℹ Creating price for product: prod_ABC123
✅ Price created successfully!
   Price ID: price_1ABC123DEF456
   Amount: 49.99 GBP
   Interval: month
ℹ Add this to your .env.local:
   STRIPE_PROD_ABC123_MONTH_PRICE_ID=price_1ABC123DEF456
```

## 🔗 Integration

This CLI tool integrates seamlessly with:
- AudioStems billing system (`pages/billing.js`)
- Stripe configuration (`lib/stripe.js`)  
- Environment variables (`.env.local`)
- Webhook handlers (`pages/api/webhooks/stripe.js`)

## 🆘 Troubleshooting

### "Stripe CLI not found" when using `listen`
Install the official Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli#install
```

### "STRIPE_SECRET_KEY not found"
Make sure your `.env.local` file has the correct Stripe keys:
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Webhook events not working
1. Make sure your Next.js app is running on port 3001
2. Ensure the webhook listener is running: `npm run stripe:listen`
3. Check that your webhook endpoint exists: `/pages/api/webhooks/stripe.js`