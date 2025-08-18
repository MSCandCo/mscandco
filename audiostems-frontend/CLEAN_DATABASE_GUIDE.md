# 🧹 Complete Database Cleanup Guide

## ⚠️ WARNING: This Will Delete EVERYTHING!

This guide will help you completely clean your Supabase database and start fresh with a proper setup.

## 🎯 Why Clean Up?

You're right to want to clean up! Having all users set to "artist" role and potentially conflicting schema can cause issues. Starting fresh is the best approach.

## 📋 Step-by-Step Cleanup Process

### Step 1: Backup Important Data (If Any)
```sql
-- If you have any important data, export it first
-- (You probably don't need this since it's test data)
```

### Step 2: Run the Cleanup Script
1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Open** `database/clean-supabase-database.sql`
3. **Copy and paste** the entire script
4. **Click "Run"**

### Step 3: Verify Cleanup
After running the script, check that only system tables remain:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Should return empty or only Supabase system tables.

### Step 4: Clean Auth Users (Optional)
If you want to remove all test users too:
```sql
DELETE FROM auth.users;
DELETE FROM auth.identities; 
DELETE FROM auth.sessions;
```

### Step 5: Apply Fresh Schema
After cleanup, run the master schema:
```sql
-- Run the content of: database/supabase-corrected-business-schema-final.sql
```

### Step 6: Create Proper Test Users
Create users with correct roles:

#### Manual Creation (Recommended):
1. **Artist**: `artist@test.com` / `password123`
2. **Label Admin**: `label@test.com` / `password123` 
3. **Company Admin**: `company@test.com` / `password123`
4. **Distribution Partner**: `distribution@test.com` / `password123`
5. **Super Admin**: `superadmin@test.com` / `password123`

#### After Creating Each User:
Update their role in the `user_profiles` table:
```sql
-- Update user role (replace USER_ID with actual ID)
UPDATE user_profiles 
SET role = 'label_admin'  -- or 'company_admin', 'distribution_partner', 'super_admin'
WHERE id = 'USER_ID';
```

## 🎯 Benefits of Clean Start

✅ **No conflicting data**  
✅ **Proper role hierarchy**  
✅ **Clean schema implementation**  
✅ **No "artist" role confusion**  
✅ **Fresh authentication state**  

## 🚀 Next Steps After Cleanup

1. **Test login** with new users
2. **Verify role-based access** works correctly
3. **Test profile forms** with different roles
4. **Test release workflow** end-to-end
5. **Verify revenue/wallet system**

## 🆘 If Something Goes Wrong

If you need to restore:
1. Re-run `supabase-corrected-business-schema-final.sql`
2. Recreate users manually
3. The cleanup script is designed to be safe and reversible

---

**Ready to clean up? The script is safe and will give you a fresh, properly structured database! 🧹✨**
