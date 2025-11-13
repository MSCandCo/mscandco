# Email Verification Issue Fix

## Problem
Users are getting "Email Verification Required" popup when trying to log in, even though they are test accounts.

## Root Cause
Supabase enforces email verification by default. When `email_confirmed_at` is NULL in `auth.users`, Supabase blocks login.

## Solutions

### Option 1: Manually Verify Emails in Supabase (RECOMMENDED for Development)

**Steps:**

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Run the SQL script: `database/VERIFY_TEST_USERS.sql`

This will confirm all test user emails instantly.

**SQL Script:**
```sql
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email IN (
  'superadmin@mscandco.com',
  'companyadmin@mscandco.com',
  'codegroup@mscandco.com',
  'artist@test.com',
  'labeladmin@test.com',
  'test@test.com'
)
AND email_confirmed_at IS NULL;
```

### Option 2: Disable Email Confirmation Requirement (Development Only)

**Steps:**

1. Go to Supabase Dashboard
2. Navigate to: **Authentication** → **Providers** → **Email**
3. Scroll to **Email Auth Settings**
4. Toggle OFF: "Confirm email"
5. Click **Save**

⚠️ **WARNING:** This disables email verification for ALL users. Only use in development!

### Option 3: Check Email for Verification Link

If you have access to the email inbox:

1. Check inbox for `codegroup@mscandco.com`
2. Look for email from Supabase
3. Click the verification link
4. Try logging in again

## Verification

After applying any solution, test login with:
- `codegroup@mscandco.com` / `C0d3gr0up`
- `superadmin@mscandco.com` / `S0p3r@dm1n`
- `companyadmin@mscandco.com` / `C0mp@ny@dm1n`

All should log in successfully without email verification popup.

## Prevention

**For new test users:**

When creating users in Supabase dashboard:
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. ✅ Check: "Auto Confirm User"
4. This bypasses email verification for that user

**For programmatic user creation:**

Use the Supabase Admin API with `email_confirm: true`:

```javascript
const { data, error } = await supabase.auth.admin.createUser({
  email: 'newuser@test.com',
  password: 'password123',
  email_confirm: true, // ← Bypasses email verification
  user_metadata: {
    first_name: 'Test',
    last_name: 'User'
  }
})
```

## Current Status
- ❌ Email verification blocking login
- 🔧 Requires manual SQL fix or Supabase setting change

## Next Steps
1. Run `VERIFY_TEST_USERS.sql` in Supabase SQL Editor
2. Test login again
3. Should work without verification popup!

