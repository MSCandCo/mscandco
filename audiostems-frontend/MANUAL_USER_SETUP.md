# Manual Auth0 User Setup Guide

## 🎯 Overview
Since the Auth0 Management API requires additional configuration, we'll manually create test users in the Auth0 dashboard with the correct roles and brands.

## 📋 Test Users to Create

### 1. Super Admin User
- **Email**: `superadmin@mscandco.com`
- **Password**: `TestPassword123!`
- **Role**: `super_admin`
- **Brand**: `yhwh_msc`

### 2. Company Admin User
- **Email**: `companyadmin@mscandco.com`
- **Password**: `TestPassword123!`
- **Role**: `company_admin`
- **Brand**: `audio_msc`

### 3. Artist User
- **Email**: `artist@mscandco.com`
- **Password**: `TestPassword123!`
- **Role**: `artist`
- **Brand**: `yhwh_msc`

### 4. Distribution Partner User
- **Email**: `distributor@mscandco.com`
- **Password**: `TestPassword123!`
- **Role**: `distribution_partner`
- **Brand**: `audio_msc`

## 🔧 Step-by-Step Setup

### Step 1: Access Auth0 Dashboard
1. Go to: https://manage.auth0.com/
2. Sign in to your Auth0 account
3. Navigate to your tenant: `dev-x2t2bdk6z050yxkr.uk.auth0.com`

### Step 2: Create Users
For each test user above:

1. **Go to Users & Roles** → **Users**
2. **Click "Create User"**
3. **Fill in the form:**
   - Email: (use the email from the list above)
   - Password: `TestPassword123!`
   - Connection: `Username-Password-Authentication`
4. **Click "Create"**

### Step 3: Set User Metadata
For each created user:

1. **Click on the user** to open their profile
2. **Go to the "User Metadata" tab**
3. **Add the following JSON:**
   ```json
   {
     "role": "super_admin",
     "brand": "yhwh_msc"
   }
   ```
   *(Replace with the appropriate role and brand for each user)*

4. **Click "Save"**

### Step 4: Verify User Metadata
After setting metadata, the user object should have:
- `https://mscandco.com/role`: The user's role
- `https://mscandco.com/brand`: The user's brand

## 🧪 Testing the Setup

### Test 1: Login Flow
1. Go to: http://localhost:3001/login
2. Click "Sign In with Auth0"
3. Login with any test user credentials
4. Verify you're redirected to the dashboard

### Test 2: Role-Based Navigation
1. Login with `superadmin@mscandco.com`
   - Should see: Dashboard, User Management, Analytics, Content Management, Platform Settings
2. Login with `artist@mscandco.com`
   - Should see: Dashboard, Earnings, My Projects, Analytics, Profile
3. Login with `companyadmin@mscandco.com`
   - Should see: Dashboard, User Management, Analytics, Content Management

### Test 3: Dashboard Content
1. Each role should see different dashboard cards
2. Super Admin: Platform-wide metrics
3. Artist: Personal earnings and projects
4. Company Admin: Brand-specific metrics

## 🔍 Troubleshooting

### Issue: User metadata not showing
**Solution**: Make sure you're using the correct metadata keys:
- Role: `https://mscandco.com/role`
- Brand: `https://mscandco.com/brand`

### Issue: Default role showing
**Solution**: If a user shows as "artist" by default, it means the metadata isn't set correctly.

### Issue: Navigation not updating
**Solution**: Clear browser cache and cookies, then login again.

## 📊 Expected Results

After setup, you should be able to:

1. **Login with any test user**
2. **See role-specific navigation**
3. **View role-appropriate dashboard content**
4. **See the correct brand name in the header**

## 🚀 Next Steps

Once the manual setup is complete:

1. **Test all user roles** to ensure proper access control
2. **Implement role-based page protection**
3. **Add more granular permissions**
4. **Set up automated user creation scripts**

## 📝 Notes

- The role system uses Auth0 user metadata
- Brands are mapped to display names in the code
- Unknown roles default to "artist"
- Unknown brands default to "YHWH MSC" 