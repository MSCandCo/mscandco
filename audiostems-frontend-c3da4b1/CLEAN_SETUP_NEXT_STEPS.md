# 🎯 Fresh Database Setup - Next Steps

## ✅ **Step 1 Complete: Database Cleaned**
You've successfully cleaned the database!

## 🚀 **Step 2: Apply Fresh Schema (Do This Now)**

1. **Copy the ENTIRE content** from `database/supabase-corrected-business-schema-final.sql`
2. **Paste it** into your SQL Editor
3. **Click "Run"**

This will create:
- ✅ All proper user roles (artist, label_admin, company_admin, distribution_partner, super_admin)
- ✅ Complete releases table with 80+ Distribution Partner fields
- ✅ Revenue distribution system
- ✅ Wallet system
- ✅ Business workflow logic
- ✅ Auto-save and status management
- ✅ Default Label Admin for artists

## 🎯 **Step 3: Create Test Users (After Schema)**

### **Method A: Manual Creation (Recommended)**
Create these users in Supabase Dashboard → Authentication → Users:

1. **Artist**: `artist@test.com` / `password123`
2. **Label Admin**: `label@test.com` / `password123`  
3. **Company Admin**: `company@test.com` / `password123`
4. **Distribution Partner**: `distribution@test.com` / `password123`
5. **Super Admin**: `superadmin@test.com` / `password123`

**Important**: ✅ Check "Auto Confirm User" for each!

### **Method B: Programmatic Creation**
```bash
# Add SUPABASE_SERVICE_ROLE_KEY to .env.local first
node create-test-users.js
```

## 🎯 **Step 4: Update User Roles**

After creating users, update their roles in SQL Editor:

```sql
-- Update each user's role (replace EMAIL with actual email)
UPDATE user_profiles 
SET role = 'label_admin'  -- or other role
WHERE email = 'label@test.com';

UPDATE user_profiles 
SET role = 'company_admin'
WHERE email = 'company@test.com';

UPDATE user_profiles 
SET role = 'distribution_partner'
WHERE email = 'distribution@test.com';

UPDATE user_profiles 
SET role = 'super_admin'
WHERE email = 'superadmin@test.com';
```

## 🎯 **Step 5: Test Login**

1. Go to: http://localhost:3003/login
2. Login with: `artist@test.com` / `password123`
3. ✅ Should work immediately!

## 🔄 **Expected Result**

- ✅ Clean database with proper schema
- ✅ 5 test users with correct roles
- ✅ Business workflow ready
- ✅ No more "artist only" confusion
- ✅ Professional hierarchy structure

---

**Continue with Step 2 (Apply Schema) now! 🚀**
