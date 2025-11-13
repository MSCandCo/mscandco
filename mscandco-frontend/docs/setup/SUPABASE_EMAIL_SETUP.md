# Supabase Native Email Setup Guide

## Overview

This guide shows how to send all 10 email templates using **only Supabase** - no external email providers needed!

**Solution Architecture:**
- ✅ Auth emails (3) → Supabase Auth Templates
- ✅ Transactional emails (7) → Supabase Edge Functions

---

## Part 1: Update Supabase Auth Email Templates

Supabase provides built-in email templates for authentication. Let's update them with our branded HTML.

### Step 1: Access Email Templates

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/fzqpoayhdisusgrotyfg
2. Navigate to **Authentication > Email Templates**
3. You'll see templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

### Step 2: Update "Confirm Signup" Template

Copy the content from `/email-templates/registration-confirmation.html` and paste it into the "Confirm signup" template.

**Important:** Supabase uses `{{ .ConfirmationURL }}` - our template already has this!

### Step 3: Update "Reset Password" Template

Copy the content from `/email-templates/password-reset.html` and paste it into the "Reset Password" template.

**Note:** Supabase password reset uses the same `{{ .ConfirmationURL }}` variable.

### Step 4: Configure SMTP (Optional but Recommended)

By default, Supabase uses their email service (limited to 3 emails/hour in development).

For production, configure custom SMTP:
1. Go to **Project Settings > Auth > SMTP Settings**
2. Enable **Enable Custom SMTP**
3. Enter your SMTP details (or you can use Supabase's built-in service on Pro plan)

**For now, you can use Supabase's built-in email service** - it works for development and production (Pro plan has higher limits).

---

## Part 2: Create Edge Function for Transactional Emails

Now let's create a Supabase Edge Function to handle the remaining 7 email types.

### Architecture

```
┌─────────────────────┐
│  Your Next.js App   │
│                     │
│  emailService.js    │
└──────────┬──────────┘
           │
           │ HTTP Request
           ▼
┌─────────────────────┐
│  Supabase Edge      │
│  Function           │
│                     │
│  send-email         │
└──────────┬──────────┘
           │
           │ Email via Supabase
           ▼
┌─────────────────────┐
│   User's Inbox      │
└─────────────────────┘
```

### Files Created

The Edge Function has been created in `/supabase/functions/send-email/`:
- `index.ts` - Main Edge Function
- `templates.ts` - Email template loader
- Helper functions for email sending

---

## Part 3: Deploy Edge Function

### Install Supabase CLI

```bash
npm install -g supabase
```

### Login to Supabase

```bash
supabase login
```

### Link Your Project

```bash
supabase link --project-ref fzqpoayhdisusgrotyfg
```

### Deploy the Edge Function

```bash
supabase functions deploy send-email
```

### Set Environment Variables

```bash
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=your-email@gmail.com
supabase secrets set SMTP_PASS=your-app-password
supabase secrets set SMTP_FROM="MSC & Co <noreply@mscandco.com>"
```

**Note:** You can use any SMTP provider (Gmail, SendGrid, etc.) or Supabase's built-in SMTP.

---

## Part 4: Update emailService.js

The `emailService.js` has been updated to call the Supabase Edge Function instead of external providers.

### How it Works

```javascript
// Old way (external provider)
await resend.emails.send({ ... })

// New way (Supabase Edge Function)
const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    emailType: 'release-approved',
    to: email,
    data: { releaseName, artistName, ... }
  })
})
```

---

## Part 5: Welcome Email After Verification

To send the welcome email automatically after email verification, we'll use a database trigger.

### Create Database Trigger

Run this SQL in your Supabase SQL Editor:

```sql
-- Create function to send welcome email
CREATE OR REPLACE FUNCTION public.send_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  function_url TEXT;
BEGIN
  -- Only proceed if email is newly confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN

    -- Get user email
    user_email := NEW.email;

    -- Get user name from user_profiles if exists
    SELECT COALESCE(display_name, name, 'there') INTO user_name
    FROM public.user_profiles
    WHERE id = NEW.id
    LIMIT 1;

    -- Call Edge Function to send welcome email
    function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-email';

    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'emailType', 'welcome',
        'to', user_email,
        'data', jsonb_build_object(
          'userName', COALESCE(user_name, 'there'),
          'dashboardUrl', current_setting('app.settings.app_url', true) || '/dashboard'
        )
      )
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_user_email_confirmed ON auth.users;
CREATE TRIGGER on_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email();

-- Set configuration variables
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://fzqpoayhdisusgrotyfg.supabase.co';
ALTER DATABASE postgres SET app.settings.app_url = 'https://mscandco.com';
-- Service role key should be set via environment variable for security
```

**Note:** For the service role key, we'll set it securely via environment variable instead of storing in database.

---

## Part 6: Testing

### Test Supabase Auth Emails

1. Create a new user account through your app
2. Check inbox for branded registration confirmation email
3. Click verification link
4. You should receive the welcome email automatically

### Test Transactional Emails

Use the test API endpoint:

```bash
curl -X POST http://localhost:3013/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "release-approved",
    "email": "your-email@example.com"
  }'
```

### Test Edge Function Directly

```bash
curl -X POST https://fzqpoayhdisusgrotyfg.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "suspicious-login",
    "to": "test@example.com",
    "data": {
      "loginDate": "Oct 29, 2025",
      "loginTime": "3:45 PM",
      "location": "Tokyo, Japan",
      "device": "Desktop",
      "browser": "Chrome",
      "ipAddress": "203.0.113.42"
    }
  }'
```

---

## Part 7: Environment Variables

Update your `.env.local`:

```env
# No changes needed! Already have these:
NEXT_PUBLIC_SUPABASE_URL=https://fzqpoayhdisusgrotyfg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3013
```

---

## Cost & Limits

### Supabase Email Limits

**Free Plan:**
- Auth emails: Unlimited (uses Supabase's built-in service)
- Edge Function calls: 500K/month
- Email sending via Edge Functions: Depends on your SMTP provider

**Pro Plan ($25/month):**
- Everything in Free
- Higher rate limits
- Custom SMTP fully supported
- Built-in email service with higher limits

### Recommendation

For production, use:
1. **Supabase Auth emails** (built-in, free, unlimited)
2. **Edge Functions with your own SMTP** (Gmail, SendGrid free tier, etc.)

This gives you **100% free email sending** if you use Gmail's SMTP or SendGrid's free tier!

---

## Summary

✅ **3 Auth Emails** → Supabase Auth Templates (built-in, free)
- registration-confirmation
- password-reset
- welcome (via trigger)

✅ **7 Transactional Emails** → Supabase Edge Function
- password-changed
- release-approved
- payment-received
- withdrawal-confirmation
- invoice
- inactive-account
- suspicious-login

🎉 **No external email service needed!**
💰 **Completely free on Supabase Pro + free SMTP tier**
🚀 **Everything stays in your Supabase infrastructure**

---

## Next Steps

1. ✅ Update Supabase Auth email templates (5 minutes)
2. ✅ Deploy Edge Function (2 minutes)
3. ✅ Set up database trigger for welcome email (1 minute)
4. ✅ Configure SMTP secrets (1 minute)
5. ✅ Test all 10 emails (5 minutes)

**Total setup time: ~15 minutes**
