# Email Deliverability & Spam Prevention Guide

## Problem: Emails Marked as Spam

Your emails are being flagged as spam because they lack proper authentication mechanisms (SPF, DKIM, DMARC). This guide will help you fix this issue.

---

## Understanding the Issue

Gmail and other email providers use authentication to verify that emails are legitimately from your domain:

1. **SPF (Sender Policy Framework)** - Verifies which mail servers can send email from your domain
2. **DKIM (DomainKeys Identified Mail)** - Cryptographic signature that proves email wasn't altered
3. **DMARC (Domain-based Message Authentication)** - Policy that tells receivers what to do with unauthenticated emails

**Without these**, emails appear suspicious and get marked as spam or dangerous.

---

## Solution Overview

You need to:
1. Set up a custom email sending domain
2. Configure DNS records for authentication
3. Use a professional email service (Resend)
4. Add proper email headers

---

## Step-by-Step Fix

### Option 1: Use Resend with Custom Domain (Recommended)

Resend is already configured in your Supabase project. You just need to set up the domain authentication.

#### 1. Sign Up for Resend

1. Go to https://resend.com
2. Sign up with your email
3. Verify your account

#### 2. Add Your Domain

1. In Resend Dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain: `mscandco.com`
4. Click **Add Domain**

#### 3. Configure DNS Records

Resend will provide you with DNS records to add. You'll need to add these to your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare):

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

**DKIM Records (3 records):**
```
Type: TXT
Name: resend._domainkey
Value: [Provided by Resend - long cryptographic key]
TTL: 3600

Type: TXT
Name: resend2._domainkey
Value: [Provided by Resend - long cryptographic key]
TTL: 3600

Type: TXT
Name: resend3._domainkey
Value: [Provided by Resend - long cryptographic key]
TTL: 3600
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@mscandco.com
TTL: 3600
```

#### 4. Verify Domain in Resend

1. After adding DNS records, wait 10-30 minutes for propagation
2. In Resend Dashboard, click **Verify Domain**
3. Resend will check your DNS records
4. Once verified, you'll see a green checkmark

#### 5. Get API Key

1. In Resend Dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it: `MSC & Co Production`
4. Select permissions: **Sending access**
5. Copy the API key (starts with `re_`)

#### 6. Configure Supabase

1. Go to Supabase Dashboard
2. Navigate to **Project Settings** → **Auth**
3. Scroll to **SMTP Settings**
4. Configure:

```
Enable Custom SMTP: ON

SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: [Your Resend API Key]

Sender Email: noreply@mscandco.com
Sender Name: MSC & Co
```

5. Click **Save**

---

### Option 2: Use Supabase's Built-in Email (Quick Fix)

If you can't set up a custom domain right now, you can improve deliverability with Supabase's default service:

#### 1. Update Email Headers

Add these headers to your email templates to improve deliverability:

**Add to ALL email templates** (registration-confirmation.html, password-reset.html, etc.):

```html
<!-- Add this in the <head> section -->
<meta name="x-apple-disable-message-reformatting">
<meta http-equiv="x-ua-compatible" content="ie=edge">
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no">
```

#### 2. Add Unsubscribe Links

Add this to the footer of ALL email templates:

```html
<tr>
  <td align="center" style="padding: 20px 0; color: #666; font-size: 12px;">
    <p>If you didn't request this email, you can safely ignore it.</p>
    <p style="margin-top: 10px;">
      <a href="{{ .SiteURL }}/unsubscribe" style="color: #666; text-decoration: underline;">
        Unsubscribe
      </a> from these emails.
    </p>
  </td>
</tr>
```

#### 3. Improve Email Content

**Avoid spam triggers:**
- ❌ Don't use ALL CAPS in subject lines
- ❌ Avoid excessive exclamation marks!!!
- ❌ Don't use words like "FREE", "WINNER", "URGENT"
- ✅ Use professional, clear language
- ✅ Include physical address in footer
- ✅ Provide clear unsubscribe option

---

## DNS Configuration Guide

### Where to Add DNS Records

#### If Using Cloudflare:
1. Log in to Cloudflare
2. Select your domain: `mscandco.com`
3. Go to **DNS** → **Records**
4. Click **Add Record**
5. Add each record provided by Resend

#### If Using GoDaddy:
1. Log in to GoDaddy
2. Go to **My Products** → **Domains**
3. Click **DNS** next to your domain
4. Click **Add** under DNS Records
5. Add each record provided by Resend

#### If Using Namecheap:
1. Log in to Namecheap
2. Go to **Domain List**
3. Click **Manage** next to your domain
4. Go to **Advanced DNS**
5. Click **Add New Record**
6. Add each record provided by Resend

---

## Testing Email Deliverability

### 1. Send Test Email

After configuration, send a test email through your platform:

1. Register a new account
2. Check the confirmation email
3. Look for authentication indicators

### 2. Check Email Headers

In Gmail:
1. Open the email
2. Click the three dots (⋮)
3. Select **Show original**
4. Look for these lines:

```
✅ SPF: PASS
✅ DKIM: PASS
✅ DMARC: PASS
```

### 3. Use Email Testing Tools

**Mail Tester:**
1. Go to https://www.mail-tester.com
2. Send a test email to the provided address
3. Check your score (aim for 10/10)
4. Review recommendations

**Google Postmaster Tools:**
1. Sign up at https://postmaster.google.com
2. Add your domain
3. Monitor reputation and deliverability

---

## Common Issues & Solutions

### Issue 1: DNS Records Not Propagating

**Problem:** Added DNS records but Resend can't verify them.

**Solution:**
- Wait 24-48 hours for full DNS propagation
- Check DNS with tool: https://mxtoolbox.com/SuperTool.aspx
- Ensure there are no typos in DNS records
- Contact your domain registrar if issues persist

### Issue 2: Emails Still Going to Spam

**Problem:** SPF/DKIM/DMARC configured but emails still in spam.

**Solution:**
- Check email content for spam triggers
- Ensure unsubscribe link is present
- Add physical address to footer
- Build sender reputation gradually (start with low volume)
- Ask recipients to mark email as "Not Spam"

### Issue 3: "Too Many Authentication Results" Error

**Problem:** Multiple SPF records causing conflicts.

**Solution:**
- You can only have ONE SPF record per domain
- Combine multiple services into one SPF record:
  ```
  v=spf1 include:_spf.resend.com include:_spf.google.com ~all
  ```

### Issue 4: DMARC Policy Too Strict

**Problem:** Legitimate emails being rejected.

**Solution:**
- Start with lenient DMARC policy: `p=none`
- Monitor reports sent to your email
- Gradually move to `p=quarantine` then `p=reject`
- Example progression:
  ```
  Week 1-4:   v=DMARC1; p=none; rua=mailto:admin@mscandco.com
  Week 5-8:   v=DMARC1; p=quarantine; pct=10; rua=mailto:admin@mscandco.com
  Week 9+:    v=DMARC1; p=quarantine; pct=100; rua=mailto:admin@mscandco.com
  ```

---

## Email Template Best Practices

### Subject Lines

**Good Examples:**
- ✅ "Verify Your MSC & Co Account"
- ✅ "Reset Your Password - MSC & Co"
- ✅ "Welcome to MSC & Co Music Distribution"

**Bad Examples:**
- ❌ "URGENT: VERIFY NOW!!!"
- ❌ "You've WON access to MSC & Co"
- ❌ "FREE music distribution - Act now!"

### Email Body

**Must Include:**
1. Clear company name and branding
2. Specific action button (not just "Click Here")
3. Alternative text link for button
4. Physical address in footer
5. Unsubscribe link
6. Privacy policy link
7. Contact information

**Example Footer:**
```html
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding: 30px 0; border-top: 1px solid #e5e5e5;">
      <p style="color: #666; font-size: 12px; line-height: 18px; margin: 0 0 10px 0;">
        MSC & Co<br>
        123 Music Lane, Studio City, CA 90001<br>
        <a href="mailto:support@mscandco.com" style="color: #666;">support@mscandco.com</a>
      </p>
      <p style="color: #666; font-size: 12px; line-height: 18px; margin: 10px 0;">
        <a href="{{ .SiteURL }}/privacy" style="color: #666; text-decoration: underline;">Privacy Policy</a> |
        <a href="{{ .SiteURL }}/terms" style="color: #666; text-decoration: underline;">Terms of Service</a> |
        <a href="{{ .SiteURL }}/unsubscribe" style="color: #666; text-decoration: underline;">Unsubscribe</a>
      </p>
      <p style="color: #999; font-size: 11px; margin: 10px 0 0 0;">
        If you didn't request this email, you can safely ignore it.
      </p>
    </td>
  </tr>
</table>
```

---

## Monitoring & Maintenance

### Weekly Tasks

1. **Check Email Delivery Rates**
   - Monitor bounce rates in Resend Dashboard
   - Aim for <5% bounce rate

2. **Review Spam Complaints**
   - Check complaint rate (<0.1% is good)
   - Address any issues promptly

3. **Monitor Sender Reputation**
   - Use Google Postmaster Tools
   - Check domain reputation score

### Monthly Tasks

1. **Review DMARC Reports**
   - Analyze authentication failures
   - Identify unauthorized senders

2. **Update Email Templates**
   - Improve based on user feedback
   - A/B test subject lines

3. **Clean Email List**
   - Remove bounced addresses
   - Remove inactive users

---

## Immediate Fixes Applied

The following changes have been made to fix spam warnings:

### 1. Button Text Changed
- ❌ "VERIFY EMAIL ADDRESS" (triggers spam - too aggressive)
- ✅ "Confirm My Email Address" (professional and clear)

### 2. Alternative Link Section Improved
- ❌ "Alternative Verification Method" (sounds like phishing)
- ✅ "Having trouble with the button above?" (helpful and clear)

### 3. Security Headers Added
Added these meta tags to prevent email reformatting issues:
```html
<meta name="x-apple-disable-message-reformatting">
<meta http-equiv="x-ua-compatible" content="ie=edge">
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no">
```

### 4. Footer Context Added
Added explanation of why user received the email:
- "You received this email because you registered for an account at mscandco.com"
- Contact information for support

### 5. Phishing Triggers Removed
- Removed aggressive language
- Changed all caps button text
- Made language more conversational
- Added clear company identification

---

## Quick Checklist

Use this checklist to ensure proper email configuration:

### DNS Configuration
- [ ] SPF record added and verified
- [ ] DKIM records added (all 3) and verified
- [ ] DMARC record added and verified
- [ ] DNS propagation complete (24-48 hours)

### Email Service
- [ ] Resend account created
- [ ] Domain added and verified in Resend
- [ ] API key generated
- [ ] Supabase SMTP configured with Resend

### Email Templates
- [ ] All templates use table-based layout
- [ ] Company branding consistent across all emails
- [ ] Unsubscribe link present in all emails
- [ ] Physical address in footer
- [ ] Privacy policy link included
- [ ] Contact information provided
- [ ] Subject lines professional and clear

### Testing
- [ ] Test email sent successfully
- [ ] Email headers show SPF, DKIM, DMARC PASS
- [ ] Email delivered to inbox (not spam)
- [ ] Mail-tester.com score 8/10 or higher
- [ ] All links work correctly
- [ ] Mobile rendering tested

---

## Cost Breakdown

### Resend Pricing

**Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Perfect for starting out

**Pro Plan ($20/month):**
- 50,000 emails/month
- 1,000 emails/day
- Email analytics
- Custom SMTP
- Team features

**Scale Plan ($250/month):**
- 1,000,000 emails/month
- Dedicated IP address
- Priority support

**Recommendation:** Start with Free tier, upgrade to Pro when you exceed limits.

---

## Support & Resources

### Getting Help

**Resend Support:**
- Email: support@resend.com
- Documentation: https://resend.com/docs
- Status: https://status.resend.com

**MSC & Co Technical Support:**
- Email: tech@mscandco.com
- Documentation: `/docs/INDEX.md`

### Useful Resources

1. **Email Authentication:**
   - https://www.cloudflare.com/learning/email-security/dmarc-dkim-spf/
   - https://support.google.com/a/answer/81126

2. **Deliverability Tools:**
   - Mail Tester: https://www.mail-tester.com
   - MX Toolbox: https://mxtoolbox.com
   - Google Postmaster: https://postmaster.google.com

3. **Best Practices:**
   - https://resend.com/blog/email-deliverability-best-practices
   - https://www.validity.com/everest/email-deliverability-guide/

---

## Next Steps

1. **Immediate (This Week):**
   - [ ] Sign up for Resend account
   - [ ] Add domain to Resend
   - [ ] Configure DNS records
   - [ ] Verify domain in Resend
   - [ ] Update Supabase SMTP settings

2. **Short Term (This Month):**
   - [ ] Send test emails and verify deliverability
   - [ ] Update all email templates with proper footers
   - [ ] Set up monitoring tools
   - [ ] Document any issues and resolutions

3. **Long Term (Ongoing):**
   - [ ] Monitor email metrics weekly
   - [ ] Gradually tighten DMARC policy
   - [ ] Build sender reputation
   - [ ] Optimize email content based on feedback

---

**Last Updated:** 2025-01-30
**Version:** 1.0
**Maintainer:** Development Team
