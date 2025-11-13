# Email Integration Guide for MSC & Co

This guide explains how to integrate all email templates with your platform.

## 📧 Available Email Templates

### 1. **Registration Confirmation** (`registration-confirmation.html`)
- Sent when a user registers
- Contains email verification link
- Variables: `ConfirmationURL`

### 2. **Welcome Email** (`welcome.html`)
- Sent after email verification
- Shows getting started steps
- Variables: `UserName`, `DashboardURL`

### 3. **Password Reset** (`password-reset.html`)
- Sent when user requests password reset
- Variables: `ResetURL`

### 4. **Password Changed** (`password-changed.html`)
- Sent after successful password change
- Variables: `ChangeDate`, `ChangeTime`, `Location`, `SecurityURL`

### 5. **Release Approved** (`release-approved.html`)
- Sent when a release is approved for distribution
- Variables: `ReleaseName`, `ArtistName`, `ReleaseDate`, `ReleaseType`, `TrackCount`, `UPC`, `ReleaseURL`

### 6. **Payment Received** (`payment-received.html`)
- Sent when payment is processed
- Variables: `Amount`, `Currency`, `TransactionID`, `PaymentDate`, `PaymentMethod`, `Description`, `DashboardURL`

### 7. **Withdrawal Confirmation** (`withdrawal-confirmation.html`)
- Sent when withdrawal is processed
- Variables: `Amount`, `Currency`, `ReferenceNumber`, `RequestDate`, `ProcessingDate`, `DestinationAccount`, `PaymentMethod`, `EstimatedArrival`, `ProcessingDays`, `TransactionHistoryURL`

### 8. **Invoice** (`invoice.html`)
- Sent for billing invoices
- Variables: `ClientName`, `ClientEmail`, `ClientAddress`, `InvoiceNumber`, `InvoiceDate`, `DueDate`, `Status`, `ItemName`, `ItemDescription`, `Quantity`, `Rate`, `ItemTotal`, `Subtotal`, `TaxRate`, `Tax`, `Total`, `PaymentTerms`, `PaymentURL`, `DownloadURL`

### 9. **Inactive Account** (`inactive-account.html`)
- Sent after 6 months of inactivity
- Variables: `UserName`, `LoginURL`

### 10. **Suspicious Login** (`suspicious-login.html`)
- Sent when login from new location/IP detected
- Variables: `LoginDate`, `LoginTime`, `Location`, `Device`, `Browser`, `IPAddress`, `SecureAccountURL`, `ChangePasswordURL`

---

## 🚀 Integration Steps

### Step 1: Choose Your Email Provider

You need to integrate with an email service provider. Recommended options:

#### Option A: **Resend** (Recommended - Simple & Reliable)
```bash
npm install resend
```

```javascript
// In lib/email/emailService.js, update sendEmailViaProvider:
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendEmailViaProvider(to, subject, html) {
  const { data, error } = await resend.emails.send({
    from: 'MSC & Co <noreply@mscandco.com>',
    to: [to],
    subject: subject,
    html: html,
  })

  if (error) {
    throw new Error(`Email send failed: ${error.message}`)
  }

  return { success: true, data }
}
```

Add to `.env.local`:
```
RESEND_API_KEY=re_your_api_key_here
```

#### Option B: **SendGrid**
```bash
npm install @sendgrid/mail
```

```javascript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

async function sendEmailViaProvider(to, subject, html) {
  await sgMail.send({
    to: to,
    from: 'noreply@mscandco.com',
    subject: subject,
    html: html,
  })

  return { success: true }
}
```

#### Option C: **Supabase Edge Functions + Resend**
Create an edge function to handle email sending securely.

---

### Step 2: Set Up Database Tables

Run these SQL migrations in your Supabase SQL Editor:

```sql
-- Add last_login_at and inactive_reminder_sent to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS inactive_reminder_sent BOOLEAN DEFAULT FALSE;

-- Create user_login_history table for tracking suspicious logins
CREATE TABLE IF NOT EXISTS user_login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  location TEXT,
  device TEXT,
  browser TEXT,
  user_agent TEXT,
  is_suspicious BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_login_history_user_id ON user_login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_history_created_at ON user_login_history(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login_at);

-- Enable RLS
ALTER TABLE user_login_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own login history"
  ON user_login_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert login history"
  ON user_login_history
  FOR INSERT
  WITH CHECK (true);
```

---

### Step 3: Configure Supabase Auth Email Templates

1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Email Templates**
3. Update templates to use your custom HTML:

**For Email Confirmation:**
- Use `registration-confirmation.html` template
- Supabase variable: `{{ .ConfirmationURL }}`

**For Password Reset:**
- Use `password-reset.html` template
- Supabase variable: `{{ .ConfirmationURL }}`

---

### Step 4: Integrate Login Tracking

Update your auth callback to track logins:

**File: `app/auth/callback/page.js` or middleware:**

```javascript
import { trackLogin } from '@/lib/email/loginTracker'

// After successful login
export async function GET(request) {
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Track login and send suspicious login alert if needed
    await trackLogin(user.id, request)
  }

  // ... rest of callback logic
}
```

---

### Step 5: Integrate Email Sending in Your APIs

#### Example: Release Approval

**File: `app/api/admin/releases/approve/route.js`**

```javascript
import { sendReleaseApprovedEmail, getUserEmail } from '@/lib/email/emailService'

export async function POST(request) {
  const { releaseId } = await request.json()

  // ... approval logic ...

  // Get release and user details
  const { data: release } = await supabase
    .from('releases')
    .select('*, user_profiles(email, name)')
    .eq('id', releaseId)
    .single()

  // Send email
  await sendReleaseApprovedEmail(release.user_profiles.email, {
    releaseName: release.title,
    artistName: release.artist_name,
    releaseDate: release.release_date,
    releaseType: release.type,
    trackCount: release.track_count,
    upc: release.upc,
  })

  return Response.json({ success: true })
}
```

#### Example: Withdrawal Request

**File: `app/api/wallet/request-payout/route.js`**

```javascript
import { sendWithdrawalConfirmationEmail } from '@/lib/email/emailService'

export async function POST(request) {
  const { amount, destinationAccount } = await request.json()
  const user = await getCurrentUser()

  // ... withdrawal processing ...

  // Send confirmation email
  await sendWithdrawalConfirmationEmail(user.email, {
    amount: `$${amount.toFixed(2)}`,
    currency: 'USD',
    referenceNumber: withdrawalId,
    requestDate: new Date().toLocaleDateString(),
    processingDate: new Date().toLocaleDateString(),
    destinationAccount: destinationAccount,
    paymentMethod: 'Bank Transfer',
    estimatedArrival: '3-5 business days',
    processingDays: '3-5 business days',
  })

  return Response.json({ success: true })
}
```

---

### Step 6: Set Up Cron Job for Inactive Accounts

**Option A: Using Vercel Cron Jobs**

Create `app/api/cron/check-inactive-accounts/route.js`:

```javascript
import { checkInactiveAccounts } from '@/lib/email/emailService'

export async function GET(request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const count = await checkInactiveAccounts()

  return Response.json({
    success: true,
    emailsSent: count
  })
}
```

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/check-inactive-accounts",
    "schedule": "0 0 * * 0"
  }]
}
```

**Option B: Using Supabase Edge Functions**

Create a scheduled function that runs weekly.

---

### Step 7: Test Email Sending

Create a test endpoint:

**File: `app/api/test/send-email/route.js`**

```javascript
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSuspiciousLoginEmail,
} from '@/lib/email/emailService'

export async function POST(request) {
  const { type, email } = await request.json()

  try {
    switch (type) {
      case 'welcome':
        await sendWelcomeEmail(email, {
          userName: 'Test User',
        })
        break

      case 'password-reset':
        await sendPasswordResetEmail(email, {
          resetUrl: 'https://yourapp.com/reset-password?token=test',
        })
        break

      case 'suspicious-login':
        await sendSuspiciousLoginEmail(email, {
          location: 'San Francisco, CA, USA',
          device: 'Desktop',
          browser: 'Chrome',
          ipAddress: '192.168.1.1',
        })
        break

      default:
        return Response.json({ error: 'Invalid type' }, { status: 400 })
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```

Test it:
```bash
curl -X POST http://localhost:3000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"type": "welcome", "email": "your-email@example.com"}'
```

---

## 🔒 Environment Variables Required

Add these to your `.env.local`:

```env
# Email Provider (choose one)
RESEND_API_KEY=re_your_api_key
# OR
SENDGRID_API_KEY=SG.your_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL
NEXT_PUBLIC_APP_URL=https://mscandco.com

# Cron Job Protection
CRON_SECRET=your_random_secret_string
```

---

## 📝 Integration Checklist

- [ ] Choose and configure email provider (Resend/SendGrid)
- [ ] Run database migrations for login tracking
- [ ] Update Supabase auth email templates
- [ ] Integrate login tracking in auth callback
- [ ] Add email sending to release approval workflow
- [ ] Add email sending to withdrawal workflow
- [ ] Add email sending to payment workflow
- [ ] Set up cron job for inactive accounts
- [ ] Configure environment variables
- [ ] Test all email templates
- [ ] Verify Supabase RLS policies
- [ ] Monitor email delivery in production

---

## 🎨 Customizing Email Templates

All templates are in `/email-templates/` directory. To customize:

1. Edit the HTML files directly
2. Maintain the `{{ .VariableName }}` syntax for dynamic content
3. Test in browser before deploying:
   ```bash
   open email-templates/suspicious-login.html
   ```

---

## 🚨 Troubleshooting

### Emails not sending
- Check API keys are correct
- Verify email provider dashboard for errors
- Check server logs for error messages

### Variables not replacing
- Ensure variable names match exactly (case-sensitive)
- Check template has correct `{{ .VariableName }}` syntax

### Suspicious login not triggering
- Verify `user_login_history` table exists
- Check login tracking is integrated in auth flow
- Test with VPN to simulate new location

---

## 📊 Monitoring

Track email delivery:
- Use your email provider's dashboard
- Log all email sends with transaction IDs
- Set up alerts for failed deliveries
- Monitor bounce rates and spam reports

---

## 🎯 Next Steps

1. Set up email provider account
2. Run database migrations
3. Integrate email sending in your workflows
4. Test thoroughly in development
5. Deploy to production
6. Monitor delivery rates

For questions or issues, contact the development team.
