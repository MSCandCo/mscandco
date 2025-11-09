# Supabase Auth Configuration Fixes

## Remaining Security Warnings - Dashboard Configuration Required

These warnings cannot be fixed via SQL migrations and require changes in the Supabase Dashboard.

---

## 1. Auth OTP Long Expiry ⚠️

### Current Issue
- **Warning**: Email OTP expiry exceeds recommended threshold (> 1 hour)
- **Current Flow**: Email OTP (magic link/passwordless login)
- **Current Expiry**: Likely > 3600 seconds (1 hour)

### Recommended Fix
- **Desired Expiry**: 300-1800 seconds (5-30 minutes)
- **Recommended**: 1800 seconds (30 minutes)

### Steps to Fix
1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Settings**
3. Find **"Email Auth"** section
4. Locate **"OTP expiry"** or **"OTP expiration time"** setting
5. Change from current value to **1800** (30 minutes) or **300** (5 minutes)
6. Click **Save**

### Related Database Tables
- **`mfa_recovery_codes`**: Used for TOTP recovery codes (not related to email OTP expiry)
- **`email_verification_codes`**: May exist if custom email verification is implemented
- **No SQL changes needed**: Email OTP expiry is managed by Supabase Auth configuration

---

## 2. Leaked Password Protection Disabled ⚠️

### Current Issue
- **Warning**: Leaked password protection is currently disabled
- **Impact**: Users can use compromised passwords from data breaches

### Steps to Fix
1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Settings**
3. Find **"Password Security"** section
4. Enable **"Leaked Password Protection"** or **"Check passwords against HaveIBeenPwned"**
5. Click **Save**

### What This Does
- Checks user passwords against HaveIBeenPwned.org database
- Prevents use of compromised passwords
- Enhances security without impacting user experience

---

## 3. Extension in Public (`pg_net`) ℹ️

### Current Issue
- **Warning**: Extension `pg_net` is installed in the public schema
- **Status**: Cannot be fixed - Supabase-managed extension

### Why It Can't Be Fixed
- `pg_net` is a Supabase-managed extension
- Does not support `SET SCHEMA` operation
- This warning is **acceptable** and can be safely ignored
- Supabase manages this extension for their infrastructure

### Action Required
- **None** - This is expected behavior for Supabase-managed extensions

---

## 4. Vulnerable Postgres Version ⚠️

### Current Issue
- **Warning**: Current Postgres version has security patches available
- **Current Version**: `supabase-postgres-17.4.1.069`
- **Impact**: Missing security patches

### Steps to Fix
1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Project Settings** → **Database**
3. Check for available PostgreSQL version upgrades
4. If upgrade available:
   - Review upgrade notes
   - Schedule maintenance window if needed
   - Click **Upgrade**
5. If no upgrade available:
   - Contact Supabase support
   - Request database version upgrade

### Important Notes
- Upgrades may require brief downtime
- Review release notes before upgrading
- Test in staging environment first if possible

---

## Summary

### ✅ Fixed via SQL Migrations
- Function search path warnings (3 functions)
- Multiple permissive policies (12 warnings)
- RLS performance warnings (341 warnings)
- Security definer views (3 views)

### ⚠️ Requires Dashboard Configuration
- Auth OTP expiry (set to 1800 seconds / 30 minutes)
- Leaked password protection (enable in dashboard)

### ℹ️ Cannot Be Fixed / Platform-Level
- Extension in public (`pg_net`) - Acceptable, Supabase-managed
- Vulnerable Postgres version - Requires platform upgrade via dashboard

---

## Quick Reference: Dashboard Navigation

**For Auth Settings:**
```
Dashboard → Authentication → Settings → Email Auth / Password Security
```

**For Database Upgrade:**
```
Dashboard → Project Settings → Database → Version Upgrade
```

