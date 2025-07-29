# Stripe Setup Guide for MSC & Co Platform

## 🎯 **Current Status:**
✅ **Syntax Errors Fixed** - All syntax errors resolved  
✅ **Server Running** - Application running on `http://localhost:3001`  
✅ **Pages Loading** - Billing, Pricing, and Releases pages working  
🔄 **Stripe Integration** - Ready for configuration  

## 📋 **Step 1: Create .env.local File**

Create a `.env.local` file in your project root with the following content:

```bash
# Auth0 Configuration (if you have these)
AUTH0_SECRET='your-auth0-secret-here'
AUTH0_BASE_URL='http://localhost:3001'
AUTH0_ISSUER_BASE_URL='https://your-domain.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe Secret Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe Publishable Key
STRIPE_WEBHOOK_SECRET=whsec_... # Your Stripe Webhook Secret

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3001

# Stripe Product Price IDs (you'll get these after creating products)
STRIPE_ARTIST_STARTER_MONTHLY_PRICE_ID=price_...
STRIPE_ARTIST_STARTER_YEARLY_PRICE_ID=price_...
STRIPE_ARTIST_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_ARTIST_PRO_YEARLY_PRICE_ID=price_...
STRIPE_COMPANY_ADMIN_MONTHLY_PRICE_ID=price_...
STRIPE_COMPANY_ADMIN_YEARLY_PRICE_ID=price_...
STRIPE_LABEL_ADMIN_MONTHLY_PRICE_ID=price_...
STRIPE_LABEL_ADMIN_YEARLY_PRICE_ID=price_...
STRIPE_DISTRIBUTION_PARTNER_MONTHLY_PRICE_ID=price_...
STRIPE_DISTRIBUTION_PARTNER_YEARLY_PRICE_ID=price_...
```

## 📋 **Step 2: Get Stripe API Keys**

1. **Go to [Stripe Dashboard](https://dashboard.stripe.com/)**
2. **Sign up/Login** to your Stripe account
3. **Navigate to Developers → API Keys**
4. **Copy your keys:**
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

## 📋 **Step 3: Create Stripe Products & Prices**

### **Artist Starter Plan**
1. Go to **Products** in Stripe Dashboard
2. Click **"Add Product"**
3. **Product Name:** "Artist Starter"
4. **Price:** $9.99/month and $99.99/year
5. **Billing:** Recurring
6. **Copy the Price IDs** (starts with `price_`)

### **Artist Pro Plan**
1. **Product Name:** "Artist Pro"
2. **Price:** $19.99/month and $199.99/year
3. **Copy the Price IDs**

### **Label Admin Plan**
1. **Product Name:** "Label Admin"
2. **Price:** $29.99/month and $299.99/year
3. **Copy the Price IDs**

### **Other Admin Plans**
Create similar products for:
- Company Admin
- Distribution Partner

## 📋 **Step 4: Set Up Webhook**

1. **Go to Developers → Webhooks**
2. **Click "Add endpoint"**
3. **Endpoint URL:** `https://your-domain.com/api/billing/webhook`
4. **Events to send:** Select all events
5. **Copy the signing secret** (starts with `whsec_`)

## 📋 **Step 5: Update .env.local**

Replace all placeholder values with your actual Stripe credentials:

```bash
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
STRIPE_ARTIST_STARTER_MONTHLY_PRICE_ID=price_your_actual_price_id
# ... etc for all price IDs
```

## 📋 **Step 6: Test the Integration**

1. **Restart the server:**
   ```bash
   npm run dev -- -p 3001
   ```

2. **Visit:** `http://localhost:3001/billing`

3. **Test the billing functionality**

## 🎯 **Next Steps After Stripe Setup:**

1. **Test "Create New Release"** functionality
2. **Verify all billing features work**
3. **Test subscription flows**
4. **Verify webhook handling**

## 🚨 **Important Notes:**

- **Use test keys** for development
- **Switch to live keys** for production
- **Update webhook URL** for production
- **Test all payment flows** thoroughly

## 📞 **Need Help?**

If you encounter any issues:
1. Check Stripe Dashboard logs
2. Verify webhook endpoints
3. Test with Stripe's test card numbers
4. Check browser console for errors

---

**Once Stripe is configured, we can focus on fixing the "Create New Release" functionality!** 