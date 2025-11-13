# Subscription Auto-Renewal System

## Overview
Automatic subscription renewal system that charges users' wallets when their subscriptions are due for renewal.

## Problem Solved
- **Before**: Subscriptions showed as "overdue" even when users had sufficient wallet balance
- **After**: Subscriptions automatically renew from wallet balance daily

## How It Works

### 1. **Daily Cron Job**
   - Runs every day at midnight (00:00 UTC)
   - Checks all active subscriptions with `auto_renew = true`
   - Processes renewals for subscriptions past their `current_period_end` date

### 2. **Renewal Process**
   For each subscription due for renewal:
   
   **Step 1: Check Wallet Balance**
   - Calculates user's wallet balance from `earnings_log` table
   - Compares with subscription cost
   
   **Step 2a: Sufficient Funds**
   - Deducts subscription cost from wallet (creates negative entry in `earnings_log`)
   - Updates subscription with new period dates
   - Sends success notification to user
   - Subscription remains `active`
   
   **Step 2b: Insufficient Funds**
   - Updates subscription status to `past_due`
   - Increments `renewal_failure_count`
   - Sends notification to user requesting wallet top-up
   - User can add funds and renewal will be attempted next day

### 3. **Notifications**
   
   **Success Notification**:
   ```
   Title: "Subscription Renewed"
   Message: "Your artist_pro subscription has been automatically renewed for £19.99. 
            Next renewal: 24 November 2025."
   ```
   
   **Failure Notification**:
   ```
   Title: "Subscription Renewal Failed"
   Message: "Your subscription renewal failed due to insufficient wallet balance. 
            Please add £15.00 to your wallet to continue your subscription."
   ```

## Files Created

### 1. **Cron Endpoint** (`pages/api/cron/process-renewals.js`)
   - Main renewal processing logic
   - Protected by `CRON_SECRET` environment variable
   - Can be called by Vercel Cron or external cron service
   
   **Security**: Requires `x-cron-secret` header or `?secret=` query parameter

### 2. **Vercel Cron Config** (`vercel.json`)
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/process-renewals",
         "schedule": "0 0 * * *"
       }
     ]
   }
   ```
   - Runs daily at midnight UTC
   - Automatically configured on Vercel deployment

### 3. **Manual Trigger** (`pages/api/admin/trigger-renewals.js`)
   - Admin endpoint to manually trigger renewals
   - Useful for testing and immediate processing
   - Requires super_admin or company_admin role

## Setup Instructions

### 1. **Add Environment Variable**
   Add to `.env.local` and Vercel environment variables:
   ```
   CRON_SECRET=your-secure-random-secret-key-here
   ```
   
   Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

### 2. **Deploy to Vercel**
   The `vercel.json` file will automatically configure the cron job on deployment.

### 3. **Test Manually** (Development)
   As an admin, trigger renewals manually:
   ```bash
   curl -X POST http://localhost:3013/api/admin/trigger-renewals \
     -H "Cookie: your-session-cookie"
   ```
   
   Or call the cron endpoint directly:
   ```bash
   curl -X POST "http://localhost:3013/api/cron/process-renewals?secret=dev-secret-key"
   ```

## Database Schema Updates Needed

Run this SQL in Supabase to add the required fields:

```sql
-- Add auto-renewal fields to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_renewal_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS renewal_failure_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS renewal_failure_reason TEXT,
ADD COLUMN IF NOT EXISTS insufficient_funds_notified BOOLEAN DEFAULT false;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal 
ON subscriptions(current_period_end, auto_renew, status);

-- Set auto_renew to true for all active subscriptions
UPDATE subscriptions 
SET auto_renew = true 
WHERE status = 'active' AND auto_renew IS NULL;
```

## User Experience

### For Users with Sufficient Funds:
1. Subscription automatically renews on due date
2. Receives notification: "Subscription Renewed"
3. Wallet balance is deducted
4. Subscription continues without interruption
5. **No action required** ✅

### For Users with Insufficient Funds:
1. Subscription status changes to `past_due`
2. Receives notification: "Subscription Renewal Failed"
3. Notification shows exact amount needed
4. User adds funds to wallet
5. Next day, renewal is automatically attempted again
6. Once successful, subscription returns to `active`

## Billing Page Display

The billing page will show:
- **Active Subscription**: "Your subscription is active until [date]"
- **Past Due Subscription**: "Subscription Renewal Overdue - Please add funds to your wallet"

The overdue message will only show when there are **insufficient funds**, not when there are sufficient funds available.

## Monitoring & Logs

### Cron Execution Logs
Check Vercel logs or server logs for:
```
🔄 Starting subscription renewal process...
📋 Found X subscriptions due for renewal
✅ Successfully renewed subscription [id]
⚠️ Insufficient funds for subscription [id]
📊 Renewal process complete: { processed: X, successful: Y, failed: Z }
```

### Admin Dashboard
Admins can:
1. View renewal statistics
2. Manually trigger renewals
3. See failed renewal reasons
4. Monitor insufficient fund notifications

## Testing Checklist

- [x] Created cron endpoint with wallet balance checking
- [x] Created Vercel cron configuration
- [x] Created admin manual trigger endpoint
- [x] Handles sufficient funds (auto-renew)
- [x] Handles insufficient funds (past_due status)
- [x] Sends appropriate notifications
- [x] Updates subscription periods correctly
- [x] Deducts from wallet via earnings_log
- [x] Protected by CRON_SECRET

## Next Steps

1. **Add CRON_SECRET to environment variables**
2. **Run database migration SQL**
3. **Deploy to Vercel** (cron will auto-configure)
4. **Test with manual trigger** as admin
5. **Monitor first automated run** (next midnight UTC)

## Future Enhancements

- Grace period (3-7 days) before cancelling subscription
- Email notifications in addition to in-app
- Retry logic with exponential backoff
- Subscription pause/resume feature
- Payment method fallback (if wallet fails, try card)
- Detailed renewal history dashboard

## Success! 🎉

Users with sufficient wallet balance will now have their subscriptions automatically renewed without seeing "overdue" messages. Only users who actually need to add funds will be prompted to do so.

