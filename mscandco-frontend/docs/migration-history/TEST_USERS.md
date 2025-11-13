# 🔐 Test User Credentials

## Current Test Users

### ✅ Artist (Existing)
- **Email:** `info@htay.co.uk`
- **Password:** `test2025`
- **Role:** `artist`
- **Status:** ✅ Already exists and tested

### ⚠️ Distribution Partner (Needs Verification)
- **Email:** `codegroup@mscandco.com`
- **Password:** `C0d3gr0up`
- **Role:** `distribution_partner`
- **Status:** ⚠️ Needs verification in Supabase

### ⚠️ Company Admin (Needs Verification)
- **Email:** `companyadmin@mscandco.com`
- **Password:** `ca@2025msC`
- **Role:** `company_admin`
- **Status:** ⚠️ Needs verification in Supabase

---

## ✅ What I Updated

I've updated the test file to use your existing artist account:

**Before:**
```javascript
email: 'artist@test.com'
password: 'test123'
```

**After:**
```javascript
email: 'info@htay.co.uk'
password: 'test2025'
```

---

## 🔍 Verify Other Test Users

### Check if Distribution Partner exists:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Users**
3. Search for `codegroup@mscandco.com`

**If it doesn't exist, create it:**
- Email: `codegroup@mscandco.com`
- Password: `C0d3gr0up`
- Confirm email (toggle to verified)
- Then add to `user_profiles` table with role: `distribution_partner`

### Check if Company Admin exists:

1. Search for `companyadmin@mscandco.com`

**If it doesn't exist, create it:**
- Email: `companyadmin@mscandco.com`
- Password: `ca@2025msC`
- Confirm email (toggle to verified)
- Then add to `user_profiles` table with role: `company_admin`

---

## 🔧 Creating Test Users via Supabase Dashboard

### Step 1: Create Auth User
1. Go to **Authentication** > **Users**
2. Click **"Add user"**
3. Choose **"Create new user"**
4. Enter email and password
5. Check **"Auto Confirm User"** ✅ (important!)
6. Click **"Create user"**

### Step 2: Add User Profile
You'll need to add a record to `user_profiles` table:

```sql
INSERT INTO public.user_profiles (id, email, role, first_name, last_name)
VALUES (
  '<user_id_from_auth_users>',
  '<email>',
  '<role>',  -- 'distribution_partner' or 'company_admin'
  '<first_name>',
  '<last_name>'
);
```

**Or use Supabase Table Editor:**
1. Go to **Table Editor** > **user_profiles**
2. Click **"Insert"** > **"Insert row"**
3. Fill in:
   - `id`: Copy from auth.users
   - `email`: User's email
   - `role`: `distribution_partner` or `company_admin`
   - Other fields as needed

---

## 🚀 Quick Test

After creating the users, test login for each:

### Test Distribution Partner:
```bash
# In your browser
1. Go to http://localhost:3013/login
2. Email: codegroup@mscandco.com
3. Password: C0d3gr0up
4. Should redirect to /distribution/dashboard
```

### Test Company Admin:
```bash
# In your browser
1. Go to http://localhost:3013/login
2. Email: companyadmin@mscandco.com
3. Password: ca@2025msC
4. Should redirect to /dashboard (company admin view)
```

---

## 📝 Alternative: Use Your Own Test Users

If you already have other test users with these roles, update the test file:

**Edit:** `tests/e2e/complete-release-workflow.spec.js`

**Change the TEST_USERS object at the top:**

```javascript
const TEST_USERS = {
  artist: {
    email: 'info@htay.co.uk',  // ✅ Already updated
    password: 'test2025'
  },
  distributionPartner: {
    email: 'YOUR_DISTRIBUTION_USER@example.com',  // Change this
    password: 'YOUR_PASSWORD'  // Change this
  },
  companyAdmin: {
    email: 'YOUR_ADMIN_USER@example.com',  // Change this
    password: 'YOUR_PASSWORD'  // Change this
  }
};
```

---

## ✅ Once All Users Exist

Run the tests:

```bash
# Run all tests
npx playwright test tests/e2e/complete-release-workflow.spec.js

# Or with UI
npx playwright test --ui
```

---

**Updated:** October 5, 2025  
**Note:** Artist credentials already updated to use existing account ✅
