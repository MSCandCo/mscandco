# 🔧 Registration Fix Guide

## Problem:
"**Database error saving new user**" when trying to register new users.

---

## Root Cause:
When Supabase `auth.signUp()` creates a new user in the `auth.users` table, it doesn't automatically create a corresponding entry in the `user_profiles` table. This causes the registration to fail because the application expects a profile to exist.

---

## Solution:
Create a **database trigger** that automatically creates a `user_profiles` entry whenever a new user registers.

---

## 🚀 Fix Steps:

### Step 1: Run the SQL Script
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of: `database/fix-registration-trigger.sql`
3. **Run the script** (or press `Cmd + Enter`)
4. Wait for **"Success"** message

### Step 2: Test Registration
1. Go to `staging.mscandco.com/register`
2. Fill in the form:
   - Email: `test@example.com`
   - Account Type: `Artist`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click **"Create Account"**
4. Should see: **"Check Your Email"** success page ✅

---

## 🔍 What the Trigger Does:

```sql
-- When a new user signs up:
auth.users (new user created)
    ↓
TRIGGER: on_auth_user_created
    ↓
FUNCTION: handle_new_user()
    ↓
INSERT INTO user_profiles (
  id,           -- Same as auth.users.id
  email,        -- From auth.users.email
  role,         -- From user_metadata (defaults to 'artist')
  created_at,   -- NOW()
  updated_at    -- NOW()
)
```

---

## 🧪 Verify the Fix:

### Check if trigger exists:
```sql
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### Check if function exists:
```sql
SELECT * FROM pg_proc
WHERE proname = 'handle_new_user';
```

### Test registration manually:
```sql
-- Simulate a new user signup
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'test@example.com',
  '{"role": "artist"}'::jsonb
);

-- Check if profile was created
SELECT * FROM user_profiles
WHERE email = 'test@example.com';
```

---

## ⚠️ Troubleshooting:

### Error: "permission denied for schema auth"
**Solution**: Run the script as the Supabase service role (already configured in the script with `SECURITY DEFINER`).

### Error: "function already exists"
**Solution**: The script includes `DROP FUNCTION IF EXISTS` to handle this.

### Error: "trigger already exists"
**Solution**: The script includes `DROP TRIGGER IF EXISTS` to handle this.

### Registration still fails after running script:
**Solution**:
1. Check Supabase logs for errors
2. Verify RLS policies on `user_profiles` table:
```sql
-- Ensure INSERT policy exists
SELECT * FROM pg_policies
WHERE tablename = 'user_profiles';
```
3. Add INSERT policy if missing:
```sql
CREATE POLICY "Allow registration to create profiles" ON user_profiles
FOR INSERT WITH CHECK (true);
```

---

## 📊 Expected Behavior After Fix:

| Step | Before Fix | After Fix |
|------|-----------|-----------|
| **Register** | ❌ Database error | ✅ Success |
| **Email sent** | ❌ No | ✅ Yes |
| **Profile created** | ❌ No | ✅ Automatic |
| **Can login** | ❌ No | ✅ After email verify |

---

## 🔐 Security Notes:

- The trigger uses `SECURITY DEFINER` to run with elevated privileges
- This is safe because it only creates profiles for authenticated users
- RLS policies still protect the `user_profiles` table from unauthorized access
- The trigger is idempotent (safe to run multiple times)

---

## ✅ Completion Checklist:

- [ ] Run `fix-registration-trigger.sql` in Supabase
- [ ] Test registration with a new email
- [ ] Verify email is sent
- [ ] Check `user_profiles` table for new entry
- [ ] Test login after email verification
- [ ] Confirm dashboard loads after login

---

## 🎯 Next Steps After Fix:

1. **Default Permissions**: Consider adding default permissions for new users
2. **Welcome Email**: Set up transactional email templates in Supabase
3. **Email Verification**: Ensure email verification is required before login
4. **Onboarding Flow**: Consider triggering Apollo AI onboarding for new users

---

**Once you run the SQL script, registration should work perfectly!** 🚀

