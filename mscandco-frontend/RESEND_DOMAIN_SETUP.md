# Resend Domain Verification - Setup Guide

**Date:** October 29, 2025
**Status:** ⏳ Pending - Domain Verification Required

---

## Current Status

✅ **Layout Issue FIXED** - Welcome email numbered steps now display correctly
❌ **Spam Issue** - Emails going to spam because using test domain `onboarding@resend.dev`

---

## Why Domain Verification is Needed

Currently, your emails are sent from:
```
From: onboarding@resend.dev
```

This is a Resend test domain that:
- Has lower deliverability rates
- Often gets flagged as spam
- Doesn't match your brand (MSC & Co)

After verification, your emails will be sent from:
```
From: MSC & Co <noreply@mscandco.com>
```

This will:
- ✅ Improve deliverability (fewer spam flags)
- ✅ Build sender reputation
- ✅ Match your brand identity
- ✅ Enable proper SPF/DKIM authentication

---

## Step-by-Step Setup

### 1. Log in to Resend Dashboard

Visit: https://resend.com/domains

### 2. Add Your Domain

1. Click "Add Domain"
2. Enter: `mscandco.com`
3. Click "Add"

### 3. Get DNS Records

Resend will provide you with DNS records that look like this:

**SPF Record (TXT)**
```
Name: @
Type: TXT
Value: v=spf1 include:amazonses.com ~all
```

**DKIM Records (TXT)** - You'll get 3 records like:
```
Name: resend._domainkey
Type: TXT
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSI...
```

**MX Record** (Optional - only if you want to receive replies)
```
Name: @
Type: MX
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
```

### 4. Add DNS Records to Your Domain Registrar

You need to add these records wherever your domain DNS is managed. Common providers:
- **Cloudflare** - DNS tab
- **GoDaddy** - DNS Management
- **Namecheap** - Advanced DNS
- **Google Domains** - DNS settings

**For each record:**
1. Log in to your domain registrar
2. Go to DNS Management
3. Add new TXT record
4. Copy the Name and Value from Resend
5. Save the record

### 5. Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours (usually < 1 hour)
- Check status in Resend dashboard
- Resend will show "Verified" when complete

### 6. Update Supabase Secret

Once verified in Resend, update the sender email:

```bash
supabase secrets set FROM_EMAIL="MSC & Co <noreply@mscandco.com>" --project-ref fzqpoayhdisusgrotyfg
```

### 7. Test the Setup

Send a test email:

```bash
curl -X POST "https://fzqpoayhdisusgrotyfg.supabase.co/functions/v1/send-email" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "welcome",
    "to": "your-test-email@example.com",
    "data": {
      "UserName": "Test User"
    }
  }'
```

Check that:
- ✅ Email arrives in inbox (not spam)
- ✅ Sender shows as "MSC & Co <noreply@mscandco.com>"
- ✅ No security warnings

---

## Troubleshooting

### Problem: DNS Records Not Verifying

**Solution:**
1. Double-check you copied the records exactly (no extra spaces)
2. Make sure you're editing DNS for `mscandco.com` (not a subdomain)
3. Wait longer - DNS can take up to 48 hours
4. Use a DNS checker tool: https://dnschecker.org

### Problem: Emails Still Going to Spam

**Solution:**
1. Verify SPF and DKIM records are properly configured
2. Send test emails to yourself first to build reputation
3. Avoid spam trigger words in subject/content
4. Make sure email content has proper unsubscribe link (optional)

### Problem: "Domain not verified" Error

**Solution:**
1. Check Resend dashboard shows "Verified" status
2. Make sure you updated the Supabase secret with correct domain
3. Redeploy Edge Function if needed:
   ```bash
   supabase functions deploy send-email --project-ref fzqpoayhdisusgrotyfg
   ```

---

## Current Configuration

**Resend API Key:** `re_PjHopVJj_D4iCijwASL4V3JYCSE3NsTkX`
**Project Ref:** `fzqpoayhdisusgrotyfg`
**Current From Address:** `onboarding@resend.dev` (temporary test domain)
**Target From Address:** `MSC & Co <noreply@mscandco.com>` (after verification)

---

## Quick Reference Commands

**Check current secret:**
```bash
supabase secrets list --project-ref fzqpoayhdisusgrotyfg
```

**Update sender email after verification:**
```bash
supabase secrets set FROM_EMAIL="MSC & Co <noreply@mscandco.com>" --project-ref fzqpoayhdisusgrotyfg
```

**Send test email:**
```bash
# From project directory
source .env.local

curl -X POST "https://fzqpoayhdisusgrotyfg.supabase.co/functions/v1/send-email" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "welcome",
    "to": "info@audiostems.co.uk",
    "data": {
      "UserName": "Harry"
    }
  }'
```

---

## Estimated Time

- **Adding DNS Records:** 10 minutes
- **DNS Propagation:** 15 minutes - 1 hour (usually)
- **Testing:** 5 minutes

**Total:** ~30 minutes

---

## Summary

1. ✅ Email layout issue has been fixed (numbers now properly aligned)
2. ⏳ Domain verification needed to prevent spam flagging
3. 🎯 Next step: Add DNS records in your domain registrar
4. 🚀 Once verified, all emails will have proper branding and deliverability

Check your inbox for the test email to see the fixed layout!
