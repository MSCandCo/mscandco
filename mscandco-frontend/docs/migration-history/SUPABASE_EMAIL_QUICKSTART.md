# Supabase Email System - Quick Start

**5-Minute Setup Guide** - Everything you need to get emails working with Supabase.

---

## 🎯 What You're Getting

A **100% Supabase-native email system** with 10 professional email templates:

### Auth Emails (Handled by Supabase)
1. ✉️ Registration confirmation
2. ✉️ Password reset
3. ✉️ Welcome email (auto-sent after verification)

### Transactional Emails (Via Edge Function)
4. ✉️ Password changed
5. ✉️ Release approved
6. ✉️ Payment received
7. ✉️ Withdrawal confirmation
8. ✉️ Invoice
9. ✉️ Inactive account reminder
10. ✉️ Suspicious login alert

---

## ⚡ Quick Setup (15 Minutes)

### 1. Install & Login (2 min)

```bash
npm install -g supabase
supabase login
```

### 2. Link Project & Deploy (3 min)

```bash
cd /Users/htay/Documents/MSC\ \&\ Co/mscandco-frontend
supabase link --project-ref fzqpoayhdisusgrotyfg
supabase functions deploy send-email
```

### 3. Configure SMTP (3 min)

**Using Gmail (easiest):**

1. Get Gmail App Password: https://myaccount.google.com/apppasswords
2. Set secrets:

```bash
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=your-email@gmail.com
supabase secrets set SMTP_PASS=your-app-password
supabase secrets set SMTP_FROM="MSC & Co <noreply@mscandco.com>"
supabase secrets set APP_URL=https://mscandco.com
```

### 4. Update Auth Templates (5 min)

Go to: https://supabase.com/dashboard/project/fzqpoayhdisusgrotyfg/auth/templates

**Confirm Signup:**
- Copy from: `email-templates/registration-confirmation.html`
- Paste into Supabase editor
- Save

**Reset Password:**
- Copy from: `email-templates/password-reset.html`
- Paste into Supabase editor
- Save

### 5. Install Database Trigger (2 min)

Go to: https://supabase.com/dashboard/project/fzqpoayhdisusgrotyfg/sql

- Copy from: `supabase/migrations/20251029_welcome_email_trigger.sql`
- Paste into SQL editor
- Run

Then set service role key:

```sql
ALTER DATABASE postgres SET app.settings.service_role_key = 'YOUR_SERVICE_ROLE_KEY';
```

(Get key from `.env.local`)

### 6. Make Templates Accessible (1 min)

```bash
mkdir -p public/email-templates
cp email-templates/*.html public/email-templates/
```

Then redeploy your app.

---

## ✅ Test It

### Test Registration Email

Sign up a new user through your app → Check inbox for branded confirmation email

### Test Welcome Email

Click verification link → Should receive welcome email automatically

### Test Transactional Email

```bash
curl -X POST http://localhost:3013/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"type": "suspicious-login", "email": "test@example.com"}'
```

---

## 🔍 Troubleshooting

**Emails not sending?**

```bash
# Check Edge Function logs
supabase functions logs send-email

# Verify secrets
supabase secrets list
```

**Welcome email not automatic?**

```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_user_email_confirmed';
```

**Templates not loading?**

```bash
# Check if accessible
curl https://mscandco.com/email-templates/welcome.html
```

---

## 📚 Full Documentation

- **Complete Guide:** See `DEPLOY_SUPABASE_EMAILS.md`
- **Architecture:** See `SUPABASE_EMAIL_SETUP.md`
- **Integration:** See `EMAIL_INTEGRATION_GUIDE.md`

---

## 💡 Key Points

✅ **No external email service needed** (just SMTP credentials)
✅ **All templates branded with MSC & Co design**
✅ **Mobile responsive**
✅ **Free on Supabase Free Plan + Gmail**
✅ **Production-ready**

---

## 🎯 What's Next?

After setup:

1. Test all 10 email types
2. Configure domain authentication (SPF, DKIM)
3. Monitor delivery in production
4. Set up rate limiting (optional)

---

**Questions?** Check the full deployment guide: `DEPLOY_SUPABASE_EMAILS.md`

**Total Cost:** $0/month (Supabase Free + Gmail) or $25/month (Supabase Pro)

**Setup Time:** 15 minutes

**Email Limit:** 500/day (Gmail) or unlimited (SendGrid paid)
