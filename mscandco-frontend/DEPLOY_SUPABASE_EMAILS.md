# Deploy Supabase Email System - Step by Step Guide

Complete deployment guide for the Supabase-native email system.

---

## 📋 Prerequisites

- [x] Supabase project created (fzqpoayhdisusgrotyfg)
- [x] Supabase CLI installed
- [x] Gmail account or SMTP service
- [x] Next.js app deployed or running locally

---

## 🚀 Deployment Steps

### Step 1: Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window for authentication.

### Step 3: Link Your Project

```bash
cd /Users/htay/Documents/MSC\ \&\ Co/mscandco-frontend
supabase link --project-ref fzqpoayhdisusgrotyfg
```

### Step 4: Deploy Edge Function

```bash
supabase functions deploy send-email
```

**Expected output:**
```
Deploying function send-email...
Function send-email deployed successfully!
URL: https://fzqpoayhdisusgrotyfg.supabase.co/functions/v1/send-email
```

### Step 5: Configure SMTP Secrets

You have two options for SMTP:

#### Option A: Gmail SMTP (Free, Easy Setup)

1. **Enable 2FA on your Gmail account** (if not already enabled)
2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "MSC & Co Email"
   - Copy the 16-character password

3. **Set secrets:**

```bash
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=your-email@gmail.com
supabase secrets set SMTP_PASS=your-16-char-app-password
supabase secrets set SMTP_FROM="MSC & Co <noreply@mscandco.com>"
supabase secrets set APP_URL=https://mscandco.com
```

#### Option B: SendGrid SMTP (Recommended for Production)

1. **Sign up for SendGrid:** https://signup.sendgrid.com/
2. **Get API Key:**
   - Go to Settings > API Keys
   - Create API Key with "Mail Send" permissions
   - Copy the API key

3. **Set secrets:**

```bash
supabase secrets set SMTP_HOST=smtp.sendgrid.net
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=apikey
supabase secrets set SMTP_PASS=your-sendgrid-api-key
supabase secrets set SMTP_FROM="MSC & Co <noreply@mscandco.com>"
supabase secrets set APP_URL=https://mscandco.com
```

### Step 6: Update Supabase Auth Email Templates

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/fzqpoayhdisusgrotyfg
2. Navigate to **Authentication > Email Templates**
3. Update each template:

#### Confirm Signup Template

- Click "Confirm signup"
- Copy the entire content from `/email-templates/registration-confirmation.html`
- Paste into the template editor
- **Important:** Keep `{{ .ConfirmationURL }}` - Supabase will replace this
- Click "Save"

#### Reset Password Template

- Click "Reset Password"
- Copy the entire content from `/email-templates/password-reset.html`
- Paste into the template editor
- **Important:** Keep `{{ .ConfirmationURL }}` - Supabase uses this for password reset
- Click "Save"

### Step 7: Run Database Migration

Run the welcome email trigger migration in your Supabase SQL Editor:

1. Go to **SQL Editor** in Supabase Dashboard
2. Click "New query"
3. Copy the content from `/supabase/migrations/20251029_welcome_email_trigger.sql`
4. Paste into the SQL editor
5. Click "Run"

**Expected output:**
```
Success. Configuration variables set successfully
Remember to set app.settings.service_role_key...
```

### Step 8: Set Service Role Key in Database

The trigger needs your service role key to call the Edge Function:

```sql
-- Run this in Supabase SQL Editor
ALTER DATABASE postgres SET app.settings.service_role_key = 'YOUR_SERVICE_ROLE_KEY_HERE';
```

Replace `YOUR_SERVICE_ROLE_KEY_HERE` with your actual service role key from `.env.local`.

**⚠️ SECURITY NOTE:** This stores the service role key in database settings. It's secure as long as your database is protected. For maximum security, consider using a dedicated API key with limited permissions.

### Step 9: Make Email Templates Publicly Accessible

The Edge Function needs to load email templates. You have two options:

#### Option A: Public HTML Files (Easiest)

Make sure your email templates are accessible at:
```
https://mscandco.com/email-templates/welcome.html
https://mscandco.com/email-templates/password-changed.html
https://mscandco.com/email-templates/release-approved.html
etc.
```

In Next.js, move templates to `/public/email-templates/` directory:

```bash
mkdir -p public/email-templates
cp email-templates/*.html public/email-templates/
```

Then redeploy your Next.js app.

#### Option B: Supabase Storage (More Secure)

Upload templates to Supabase Storage:

```bash
# Create bucket
supabase storage create email-templates --public

# Upload templates
supabase storage upload email-templates email-templates/welcome.html
supabase storage upload email-templates email-templates/password-changed.html
supabase storage upload email-templates email-templates/release-approved.html
supabase storage upload email-templates email-templates/payment-received.html
supabase storage upload email-templates email-templates/withdrawal-confirmation.html
supabase storage upload email-templates email-templates/invoice.html
supabase storage upload email-templates email-templates/inactive-account.html
supabase storage upload email-templates email-templates/suspicious-login.html
```

Then update `supabase/functions/send-email/templates.ts`:

```typescript
// Change the loadEmailTemplate function to use Supabase Storage
const { data } = await supabaseClient.storage
  .from('email-templates')
  .download(`${templateName}.html`)
```

---

## ✅ Testing

### Test 1: Registration Email (Automatic via Supabase Auth)

```bash
# Create a test user through your app's registration form
# Or use Supabase Dashboard > Authentication > Add user
```

You should receive the branded registration confirmation email.

### Test 2: Welcome Email (Automatic via Trigger)

After clicking the verification link in the registration email, you should automatically receive the welcome email.

### Test 3: Transactional Emails (Manual)

Test using your existing API endpoint:

```bash
curl -X POST http://localhost:3013/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "suspicious-login",
    "email": "your-email@example.com"
  }'
```

Or test the Edge Function directly:

```bash
curl -X POST https://fzqpoayhdisusgrotyfg.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "release-approved",
    "to": "your-email@example.com",
    "data": {
      "ReleaseName": "Summer Vibes",
      "ArtistName": "Test Artist",
      "ReleaseDate": "December 15, 2025",
      "ReleaseType": "Single",
      "TrackCount": "1",
      "UPC": "123456789012"
    }
  }'
```

### Test 4: Password Reset Email (Automatic via Supabase Auth)

```bash
# Use your app's "Forgot Password" feature
# Or trigger via Supabase Auth API
```

You should receive the branded password reset email.

---

## 🔍 Troubleshooting

### Issue: Edge Function deployment fails

**Solution:**
```bash
# Check Supabase CLI version
supabase --version

# Update if needed
npm update -g supabase

# Try deploying again
supabase functions deploy send-email --debug
```

### Issue: Emails not sending

**Check 1: Verify secrets are set**
```bash
supabase secrets list
```

You should see:
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- SMTP_FROM
- APP_URL

**Check 2: View Edge Function logs**
```bash
supabase functions logs send-email
```

**Check 3: Test SMTP credentials**

Try sending a test email using a simple script to verify your SMTP credentials work.

### Issue: Templates not loading

**Check 1: Verify templates are accessible**
```bash
curl https://mscandco.com/email-templates/welcome.html
```

Should return the HTML template.

**Check 2: Check Edge Function logs**
```bash
supabase functions logs send-email
```

Look for template loading errors.

### Issue: Welcome email not sent automatically

**Check 1: Verify trigger exists**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_user_email_confirmed';
```

**Check 2: Check database logs**
```sql
-- In Supabase SQL Editor
SELECT * FROM pg_stat_activity WHERE application_name = 'pgbouncer';
```

**Check 3: Manually test trigger**
```sql
-- Get a user ID
SELECT id, email, email_confirmed_at FROM auth.users LIMIT 1;

-- Update their confirmation (will trigger email)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE id = 'user-id-here';
```

### Issue: Permission denied errors

**Solution:**
```sql
-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION net.http_post TO postgres, service_role;
```

---

## 📊 Monitoring

### View Email Logs

**Edge Function Logs:**
```bash
supabase functions logs send-email --tail
```

**Application Logs:**
Check your Next.js app logs for:
- ✅ Email sent successfully: [type] to [email]
- ❌ Error sending email via Supabase: [error]

### Monitor Email Delivery

**Gmail:**
- Check sent folder
- Monitor bounce rate in Gmail settings

**SendGrid:**
- Dashboard > Activity Feed
- View delivery statistics
- Check bounce and spam reports

---

## 🎯 Production Checklist

Before going live:

- [ ] Edge Function deployed successfully
- [ ] SMTP secrets configured
- [ ] Supabase Auth templates updated
- [ ] Database trigger installed
- [ ] Service role key configured
- [ ] Email templates publicly accessible or in Supabase Storage
- [ ] All 10 email types tested
- [ ] Email delivery monitored
- [ ] Domain authentication configured (SPF, DKIM, DMARC)
- [ ] "From" address matches verified domain

---

## 🔐 Security Notes

1. **Service Role Key:** Only stored in database settings, never exposed to client
2. **SMTP Credentials:** Stored as Supabase secrets, never in code
3. **Email Templates:** Publicly readable but cannot be modified by users
4. **Rate Limiting:** Consider adding rate limiting to Edge Function
5. **Domain Verification:** Set up SPF, DKIM, and DMARC records for your domain

---

## 💰 Cost Estimate

### Supabase Costs

**Free Plan:**
- Edge Functions: 500K requests/month (more than enough)
- Database: Included
- Storage: 1GB (plenty for email templates)

**Pro Plan ($25/month):**
- Everything unlimited
- Better for production

### SMTP Costs

**Gmail:**
- Free: 500 emails/day
- Sufficient for small-medium platforms

**SendGrid:**
- Free: 100 emails/day
- Essentials: $19.95/month for 50K emails
- Pro: $89.95/month for 1.5M emails

---

## 🎉 Summary

You now have a **100% Supabase-native email system** with:

✅ **3 Auth Emails** via Supabase Auth (free, unlimited)
- Registration confirmation
- Password reset
- Magic link (if enabled)

✅ **7 Transactional Emails** via Edge Functions
- Welcome (automatic after verification)
- Password changed
- Release approved
- Payment received
- Withdrawal confirmation
- Invoice
- Inactive account reminder
- Suspicious login alert

✅ **No external services needed** (except SMTP for transactional emails)
✅ **Fully branded** with MSC & Co design
✅ **Mobile responsive**
✅ **Professional and secure**

---

## 📞 Need Help?

If you encounter issues:

1. Check Edge Function logs: `supabase functions logs send-email`
2. Check database logs in Supabase Dashboard
3. Verify all secrets are set: `supabase secrets list`
4. Test SMTP credentials independently
5. Check that email templates are accessible

---

**Deployment Date:** 2025-10-29
**Total Setup Time:** ~15-20 minutes
**Monthly Cost:** $0-$25 (Supabase Free/Pro) + $0-$20 (SMTP if using SendGrid)
