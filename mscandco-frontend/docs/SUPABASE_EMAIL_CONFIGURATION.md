# Supabase Email & Authentication Configuration Guide

This guide provides step-by-step instructions for configuring email authentication redirect URLs in Supabase for the MSC & Co platform.

## Table of Contents
- [Overview](#overview)
- [Access Supabase Dashboard](#access-supabase-dashboard)
- [Configure Redirect URLs](#configure-redirect-urls)
- [Email Template Configuration](#email-template-configuration)
- [Testing Email Flows](#testing-email-flows)
- [Troubleshooting](#troubleshooting)

---

## Overview

The platform uses several email-based authentication flows:
1. **Email Verification** - New user registration confirmation
2. **Password Reset** - Forgot password flow
3. **Email Change** - Update email address confirmation
4. **Magic Link** - Passwordless authentication
5. **User Invitation** - Admin invites new users

Each flow requires proper redirect URL configuration in Supabase.

---

## Access Supabase Dashboard

1. Navigate to https://supabase.com/dashboard
2. Log in with your credentials
3. Select your project: **mscandco**
4. Project ID: `fzqpoayhdisusgrotyfg`

---

## Configure Redirect URLs

### 1. Navigate to URL Configuration

- Click **Authentication** in the left sidebar
- Scroll to **URL Configuration** section

### 2. Set Site URL

**Production:**
```
https://yourdomain.com
```

**Development:**
```
http://localhost:3000
```

### 3. Add Redirect URLs

Add ALL of the following URLs to the **Redirect URLs** allowlist:

#### Development URLs
```
http://localhost:3000/auth/callback
http://localhost:3000/login
http://localhost:3000/dashboard
http://localhost:3000/reset-password
http://localhost:3000/change-email
```

#### Production URLs
```
https://yourdomain.com/auth/callback
https://yourdomain.com/login
https://yourdomain.com/dashboard
https://yourdomain.com/reset-password
https://yourdomain.com/change-email
```

> **Note:** Replace `yourdomain.com` with your actual production domain.

### 4. Save Configuration

Click **Save** to apply the changes.

---

## Email Template Configuration

### Navigate to Email Templates

1. Go to **Authentication** → **Email Templates**
2. Configure each template as specified below

### 1. Confirm Signup

**Template File:** `/email-templates/registration-confirmation.html`

**Configuration:**
```
Redirect URL: {{ .SiteURL }}/auth/callback
```

**Flow:**
1. User receives registration email
2. Clicks "Verify Email Address" button
3. Redirects to `/auth/callback`
4. System verifies email and signs out user
5. Redirects to `/login?verified=true`
6. Shows success message on login page

**Template Variables:**
- `{{ .ConfirmationURL }}` - Full confirmation URL with token
- `{{ .SiteURL }}` - Base site URL

---

### 2. Reset Password

**Template File:** `/email-templates/password-reset.html`

**Configuration:**
```
Redirect URL: {{ .SiteURL }}/reset-password
```

**Flow:**
1. User requests password reset
2. Receives email with reset link
3. Clicks "Reset Password" button
4. Redirects to `/reset-password`
5. Validates token automatically
6. User enters new password
7. Redirects to `/login?message=password_reset_success`

**Template Variables:**
- `{{ .ResetURL }}` - Full password reset URL with token
- `{{ .SiteURL }}` - Base site URL

**Page Location:** `/app/reset-password/page.js`

---

### 3. Change Email

**Template File:** `/email-templates/change-email.html`

**Configuration:**
```
Redirect URL: {{ .SiteURL }}/change-email
```

**Flow:**
1. User requests email change in settings
2. Receives confirmation email at NEW address
3. Clicks "Confirm Email Change" button
4. Redirects to `/change-email`
5. System validates and updates email
6. Redirects to `/dashboard?message=email_changed`

**Template Variables:**
- `{{ .ConfirmationURL }}` - Full confirmation URL with token
- `{{ .Email }}` - New email address
- `{{ .SentAt }}` - Timestamp of request

**Page Location:** `/app/change-email/page.js`

---

### 4. Magic Link

**Template File:** `/email-templates/magic-link.html`

**Configuration:**
```
Redirect URL: {{ .SiteURL }}/auth/callback
```

**Flow:**
1. User requests magic link (passwordless login)
2. Receives email with login link
3. Clicks "Log In to MSC & Co" button
4. Redirects to `/auth/callback`
5. System authenticates user
6. Redirects to `/dashboard`

**Template Variables:**
- `{{ .ConfirmationURL }}` - Full magic link URL with token
- `{{ .SiteURL }}` - Base site URL

---

### 5. Invite User

**Template File:** `/email-templates/invite-user.html`

**Configuration:**
```
Redirect URL: {{ .SiteURL }}/auth/callback
```

**Flow:**
1. Admin invites new user
2. User receives invitation email
3. Clicks "Accept Invitation" button
4. Redirects to `/auth/callback`
5. User completes registration/onboarding
6. Redirects to `/dashboard`

**Template Variables:**
- `{{ .ConfirmationURL }}` - Full invitation URL with token
- `{{ .InviterEmail }}` - Email of person who sent invite
- `{{ .Email }}` - Invited user's email
- `{{ .SentAt }}` - Invitation timestamp

---

### 6. Welcome Email

**Template File:** `/email-templates/welcome.html`

**Configuration:**
This is a post-verification welcome email (no redirect needed).

**Flow:**
1. Sent after user verifies their email
2. Contains link to dashboard
3. Provides onboarding information

**Template Variables:**
- `{{ .UserName }}` - User's name
- `{{ .DashboardURL }}` - Direct link to dashboard

---

## Page Implementations

### Authentication Pages

| Page | Path | Purpose |
|------|------|---------|
| Login | `/app/login/page.js` | User login with success messages |
| Auth Callback | `/app/auth/callback/page.js` | Handles all email verification callbacks |
| Reset Password | `/app/reset-password/page.js` | Password reset form and validation |
| Change Email | `/app/change-email/page.js` | Email change confirmation |
| Dashboard | `/app/dashboard/page.js` | Main user dashboard |

### Key Features

#### `/app/reset-password/page.js`
- ✅ Token validation
- ✅ Password strength requirements (min 8 characters)
- ✅ Password confirmation matching
- ✅ Success/error state handling
- ✅ Auto-redirect to login after success
- ✅ Branded design matching login page

#### `/app/change-email/page.js`
- ✅ Automatic token verification
- ✅ Email change confirmation
- ✅ Display new email address
- ✅ Security warnings
- ✅ Auto-redirect to dashboard
- ✅ Branded design with clear status

#### `/app/auth/callback/page.js`
- ✅ Universal callback handler
- ✅ Email verification processing
- ✅ Magic link authentication
- ✅ User invitation acceptance
- ✅ Error handling with fallbacks

---

## Testing Email Flows

### Local Development Testing

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Each Flow:**

   **Email Verification:**
   - Register a new account
   - Check email inbox
   - Click verification link
   - Should redirect to `/login?verified=true`
   - Verify success message appears

   **Password Reset:**
   - Go to login page
   - Click "Forgot Password" (if available)
   - Enter email
   - Check email inbox
   - Click reset link
   - Should redirect to `/reset-password`
   - Enter new password
   - Should redirect to `/login?message=password_reset_success`

   **Email Change:**
   - Log in to dashboard
   - Go to settings/profile
   - Update email address
   - Check new email inbox
   - Click confirmation link
   - Should redirect to `/change-email`
   - Should confirm and redirect to `/dashboard?message=email_changed`

### Production Testing

Use the same flows but with production URLs. Ensure:
- SSL certificates are valid
- All redirect URLs are in Supabase allowlist
- Email templates use correct production domain

---

## Troubleshooting

### Common Issues

#### 1. "Invalid Redirect URL" Error

**Problem:** Supabase rejects the redirect because URL is not in allowlist.

**Solution:**
- Go to Supabase Dashboard → Authentication → URL Configuration
- Add the missing URL to **Redirect URLs** list
- Include both HTTP (development) and HTTPS (production) versions
- Save changes

#### 2. "Token Expired" or "Invalid Token"

**Problem:** Email link has expired or already been used.

**Solution:**
- Password reset links expire after 1 hour
- Email verification links expire after 24 hours
- Request a new link if expired
- Each link can only be used once

#### 3. Redirect to Wrong Page

**Problem:** User redirected to incorrect page after email action.

**Solution:**
- Check email template configuration in Supabase Dashboard
- Verify `Redirect URL` matches expected path
- Ensure `{{ .SiteURL }}` is set correctly

#### 4. Email Not Received

**Problem:** User doesn't receive email.

**Solution:**
- Check spam/junk folder
- Verify email settings in Supabase Dashboard
- Check email provider configuration (Resend, SendGrid, etc.)
- Review Supabase logs for email delivery failures

#### 5. Styling Issues on Auth Pages

**Problem:** Auth pages don't match brand design.

**Solution:**
- All auth pages use consistent styling:
  - Background: `bg-gradient-to-br from-gray-50 to-gray-100`
  - Cards: `bg-white rounded-2xl shadow-xl`
  - Primary color: `#1f2937` (dark gray)
  - Buttons: Hover transitions with `-translate-y-1`
- Check that Tailwind CSS is properly configured

---

## Email Provider Configuration

### Current Provider: Resend

The platform uses Resend for email delivery with custom domains for improved deliverability.

**Configuration Location:** Supabase Dashboard → Settings → Auth → Email

**Key Settings:**
- **SMTP Provider:** Resend
- **From Email:** `noreply@mscandco.com`
- **From Name:** MSC & Co

**Deliverability Features:**
- Custom domain authentication (DKIM, SPF, DMARC)
- Unsubscribe headers for compliance
- Professional branded templates
- Rate limiting protection

For detailed email system documentation, see: `/docs/EMAIL_SYSTEM.md`

---

## Security Best Practices

1. **HTTPS Only in Production**
   - Always use HTTPS URLs in production
   - Never allow HTTP redirects for authentication

2. **Token Expiration**
   - Password reset: 1 hour
   - Email verification: 24 hours
   - Magic links: 1 hour

3. **One-Time Use**
   - All authentication tokens can only be used once
   - Already-used tokens return error

4. **Email Validation**
   - All email addresses are validated before sending
   - Bounced emails are tracked

5. **Rate Limiting**
   - Email sending is rate-limited to prevent abuse
   - Password reset requests: 1 per 60 seconds
   - Magic link requests: 1 per 60 seconds

---

## Support

If you encounter issues not covered in this guide:

- **Technical Support:** support@mscandco.com
- **Supabase Documentation:** https://supabase.com/docs/guides/auth
- **Platform Documentation:** `/docs/INDEX.md`

---

## Quick Reference

| Email Type | Template | Redirect To | Page |
|------------|----------|-------------|------|
| Registration | `registration-confirmation.html` | `/auth/callback` → `/login?verified=true` | `/app/login/page.js` |
| Password Reset | `password-reset.html` | `/reset-password` | `/app/reset-password/page.js` |
| Email Change | `change-email.html` | `/change-email` | `/app/change-email/page.js` |
| Magic Link | `magic-link.html` | `/auth/callback` → `/dashboard` | `/app/dashboard/page.js` |
| User Invite | `invite-user.html` | `/auth/callback` → `/dashboard` | `/app/dashboard/page.js` |
| Welcome | `welcome.html` | Direct link to `/dashboard` | N/A (info only) |

---

**Last Updated:** 2025-01-30
**Version:** 1.0
**Maintainer:** Development Team
