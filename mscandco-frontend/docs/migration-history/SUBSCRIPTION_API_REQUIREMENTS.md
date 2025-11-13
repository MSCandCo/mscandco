# Subscription Management API Requirements

## Overview
This document outlines the backend API endpoints required to support the comprehensive SubscriptionManager component with multi-currency support and live exchange rates.

## 🔧 Required Backend API Endpoints

### 1. Exchange Rate Management

#### GET /api/exchange-rates
**Purpose:** Provide cached exchange rates for frontend fallback
**Response:**
```json
{
  "success": true,
  "data": {
    "base": "GBP",
    "rates": {
      "GBP": 1.0,
      "USD": 1.25,
      "EUR": 1.15,
      "CAD": 1.70,
      "AUD": 1.95,
      "NGN": 1650.50,
      "ZAR": 23.45,
      "KES": 165.30,
      "GHS": 15.25
    },
    "lastUpdated": "2025-08-23T12:30:00Z"
  }
}
```

#### POST /api/exchange-rates/refresh
**Purpose:** Manual rate refresh endpoint for admin use
**Headers:** `Authorization: Bearer <admin_token>`
**Response:**
```json
{
  "success": true,
  "message": "Exchange rates refreshed successfully",
  "data": {
    "ratesUpdated": 9,
    "lastUpdated": "2025-08-23T12:30:00Z"
  }
}
```

### 2. Enhanced Subscription Management

#### POST /api/subscriptions
**Purpose:** Create new subscription with multi-currency support
**Request Body:**
```json
{
  "planId": "artist-starter",
  "currency": "USD", 
  "billing": "monthly",
  "amount": 9.98,
  "gbpAmount": 7.99,
  "exchangeRate": 1.25,
  "lastRateUpdate": "2025-08-23T12:30:00Z",
  "userId": "user_123",
  "paymentMethod": "revolut"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_abc123",
    "paymentUrl": "https://revolut.com/payment/xyz",
    "status": "pending_payment",
    "expiresAt": "2025-08-23T13:00:00Z"
  }
}
```

#### GET /api/subscriptions/user/:userId
**Purpose:** Get user's current subscription details
**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_abc123",
    "planId": "artist-pro",
    "status": "active",
    "currency": "USD",
    "amount": 24.98,
    "gbpAmount": 24.99,
    "billing": "monthly",
    "nextBilling": "2025-09-23T12:00:00Z",
    "createdAt": "2025-08-23T12:00:00Z"
  }
}
```

#### PUT /api/subscriptions/:subscriptionId
**Purpose:** Update existing subscription (plan change, billing cycle)
**Request Body:**
```json
{
  "planId": "artist-pro",
  "billing": "yearly",
  "currency": "EUR"
}
```

#### DELETE /api/subscriptions/:subscriptionId
**Purpose:** Cancel subscription
**Response:**
```json
{
  "success": true,
  "data": {
    "status": "cancelled",
    "cancelledAt": "2025-08-23T12:30:00Z",
    "accessUntil": "2025-09-23T12:00:00Z"
  }
}
```

### 3. Subscription Analytics

#### POST /api/analytics/subscription-conversion
**Purpose:** Track conversions by currency for business intelligence
**Request Body:**
```json
{
  "planId": "artist-pro",
  "currency": "NGN", 
  "conversionRate": 1650.50,
  "gbpRevenue": 24.99,
  "userId": "user_123",
  "timestamp": "2025-08-23T12:30:00Z"
}
```

#### GET /api/analytics/subscription-metrics
**Purpose:** Get subscription analytics (admin only)
**Query Parameters:**
- `startDate`: ISO date string
- `endDate`: ISO date string
- `currency`: Optional currency filter
- `planId`: Optional plan filter

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSubscriptions": 1250,
    "totalRevenue": {
      "gbp": 125000.50,
      "byCurrency": {
        "USD": 156250.63,
        "EUR": 143750.58,
        "NGN": 206312500.00
      }
    },
    "conversionRates": {
      "artist-starter": 0.15,
      "artist-pro": 0.08,
      "label-starter": 0.05
    },
    "popularCurrencies": [
      { "currency": "USD", "count": 450 },
      { "currency": "GBP", "count": 380 },
      { "currency": "EUR", "count": 220 }
    ]
  }
}
```

### 4. Payment Integration

#### POST /api/payments/create-session
**Purpose:** Create Revolut/Stripe payment session
**Request Body:**
```json
{
  "subscriptionId": "sub_abc123",
  "returnUrl": "https://yourapp.com/subscription/success",
  "cancelUrl": "https://yourapp.com/subscription/cancel"
}
```

#### POST /api/webhooks/payment-success
**Purpose:** Handle payment provider webhooks
**Headers:** `X-Webhook-Signature: <signature>`
**Request Body:** (Provider-specific format)

## 🗄️ Database Schema Requirements

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  currency VARCHAR(3) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  gbp_amount DECIMAL(10,2) NOT NULL,
  exchange_rate DECIMAL(10,6) NOT NULL,
  billing_cycle VARCHAR(10) NOT NULL,
  payment_provider VARCHAR(20) NOT NULL,
  provider_subscription_id VARCHAR(100),
  next_billing_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_next_billing (next_billing_date)
);
```

### Exchange Rates Table
```sql
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
  target_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(12,6) NOT NULL,
  source VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE KEY unique_currency_pair (base_currency, target_currency),
  INDEX idx_target_currency (target_currency),
  INDEX idx_created_at (created_at)
);
```

### Subscription Analytics Table
```sql
CREATE TABLE subscription_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  plan_id VARCHAR(50) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  gbp_amount DECIMAL(10,2) NOT NULL,
  exchange_rate DECIMAL(10,6) NOT NULL,
  event_type VARCHAR(20) NOT NULL, -- 'conversion', 'upgrade', 'downgrade', 'cancel'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_plan_id (plan_id),
  INDEX idx_currency (currency),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at)
);
```

## 🔒 Security Considerations

1. **Rate Limiting:** Implement rate limiting on exchange rate endpoints
2. **Authentication:** All subscription endpoints require valid user authentication
3. **Authorization:** Admin endpoints require elevated permissions
4. **Webhook Security:** Verify webhook signatures from payment providers
5. **Data Validation:** Validate all currency codes and amounts
6. **PCI Compliance:** Ensure payment data handling meets PCI DSS requirements

## 🌍 Currency Handling Best Practices

1. **Base Currency:** Always store GBP amounts for consistent revenue reporting
2. **Exchange Rate Storage:** Store the exchange rate used at time of transaction
3. **Rate Updates:** Update exchange rates every 30 minutes during business hours
4. **Fallback Rates:** Maintain fallback rates in case external API fails
5. **Precision:** Use appropriate decimal precision for each currency
6. **Rounding:** Implement consistent rounding rules for currency conversion

## 📊 Revenue Tracking

1. **Dual Currency Storage:** Store both local currency and GBP amounts
2. **Exchange Rate Auditing:** Track which exchange rate was used for each transaction
3. **Revenue Reconciliation:** Daily reconciliation between local and GBP revenues
4. **Currency Risk Reporting:** Monitor exposure to currency fluctuations

## 🚀 Implementation Priority

1. **Phase 1:** Basic subscription CRUD operations
2. **Phase 2:** Exchange rate integration and caching
3. **Phase 3:** Multi-currency payment processing
4. **Phase 4:** Advanced analytics and reporting
5. **Phase 5:** Currency risk management tools

## 📈 Monitoring and Alerts

1. **Exchange Rate Monitoring:** Alert if rates haven't updated in 2+ hours
2. **Conversion Tracking:** Monitor conversion rates by currency
3. **Revenue Alerts:** Alert on significant revenue fluctuations
4. **Payment Failures:** Track and alert on payment processing issues
5. **Currency Exposure:** Monitor total exposure by currency

This comprehensive API design ensures robust multi-currency subscription management with proper analytics, security, and scalability considerations.
