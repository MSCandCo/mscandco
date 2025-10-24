# Trigger Subscription Renewal Now

## The subscription is ready to be renewed!

The SQL migration is complete and shows 1 subscription that's 16 days overdue with sufficient funds (£70.02 in wallet).

## Option 1: Via Browser (Easiest)

1. Make sure you're logged in as an admin (super_admin or company_admin)
2. Open your browser console (F12 or Cmd+Option+I)
3. Run this in the console:

```javascript
fetch('http://localhost:3013/api/admin/trigger-renewals', {
  method: 'POST',
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('✅ Renewal Result:', data))
.catch(err => console.error('❌ Error:', err))
```

## Option 2: Via Terminal

```bash
cd "/Users/htay/Documents/MSC & Co/mscandco-frontend"

# Add CRON_SECRET to .env.local first
echo 'CRON_SECRET=dev-secret-key-12345' >> .env.local

# Then trigger the renewal
curl -X POST "http://localhost:3013/api/cron/process-renewals?secret=dev-secret-key-12345"
```

## What Will Happen:

1. ✅ Checks wallet balance (£70.02 available)
2. ✅ Deducts £19.99 from wallet
3. ✅ Updates subscription period (new end date: ~November 24, 2025)
4. ✅ Changes status from overdue to `active`
5. ✅ Sends "Subscription Renewed" notification to user
6. ✅ Billing page will no longer show "overdue" message

## Expected Result:

```json
{
  "success": true,
  "message": "Renewal process completed",
  "results": {
    "processed": 1,
    "successful": 1,
    "failed": 0,
    "insufficient_funds": 0
  }
}
```

## After Running:

- Refresh the billing page - "overdue" message should be gone
- User's wallet balance: £70.02 - £19.99 = £50.03
- Subscription active until: ~November 24, 2025
- User receives notification: "Your artist_pro subscription has been automatically renewed"

## Future:

From now on, the Vercel cron job will run daily at midnight UTC and automatically process all renewals. No more manual intervention needed!

