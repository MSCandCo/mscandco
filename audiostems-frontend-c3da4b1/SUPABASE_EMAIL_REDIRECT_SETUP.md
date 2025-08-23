# Supabase Email Verification Redirect Setup

## Quick Fix for Email Verification Redirect

Follow these steps to make email verification links go to your beautiful custom page instead of the generic dashboard:

### 1. Go to Supabase Dashboard
- Open your Supabase project dashboard
- Navigate to **Authentication** → **URL Configuration**

### 2. Update URL Configuration
Set these values:

**Site URL:**
```
http://localhost:3003
```

**Redirect URLs:** (Add this to the list)
```
http://localhost:3003/email-verified
```

### 3. Update Email Templates (Optional but Recommended)
- Go to **Authentication** → **Email Templates**
- Click on **Confirm signup** template
- In the email template, make sure the redirect URL is set to:
```
{{ .SiteURL }}/email-verified
```

### 4. For Production (Later)
When you deploy to staging.mscandco.com, update:

**Site URL:**
```
https://staging.mscandco.com
```

**Redirect URLs:**
```
https://staging.mscandco.com/email-verified
```

## What This Does

- ✅ Email verification links will now redirect to `/email-verified`
- ✅ Users will see your beautiful branded verification success page
- ✅ After 5 seconds, they'll be redirected back to complete registration
- ✅ The flow will continue seamlessly to backup codes and profile setup

## Test the Fix

1. Register a new user with a fresh email
2. Check your email for the verification link
3. Click the verification link
4. Should now go to your styled email verification page! 🎉

