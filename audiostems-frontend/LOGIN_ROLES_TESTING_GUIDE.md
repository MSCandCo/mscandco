# 🔐 MSC & Co Platform - Login & Role Testing Guide

## 📋 Test Summary
- **✅ Core Services**: All running and healthy
- **✅ Role Configuration**: All 5 roles created and assigned
- **✅ User Setup**: 9 test users with proper role assignments
- **⚠️ Auth0 Integration**: Needs manual testing (API configuration mismatch)
- **⚠️ Route Protection**: Routes accessible without auth (expected for development)

## 🎯 Test Users & Roles

### 1. Super Admin
- **Email**: `superadmin@mscandco.com`
- **Password**: `Test@2025`
- **Role**: Super Admin
- **Access**: Full platform administration
- **Expected Features**:
  - System administration dashboard
  - User management
  - Role management
  - System settings
  - Financial reports

### 2. Company Admins
- **YHWH MSC Admin**: `admin@yhwhmsc.com` / `Test@2025`
- **Audio MSC Admin**: `admin@audiomsc.com` / `Test@2025`
- **Role**: Company Admin
- **Access**: Brand-specific administration
- **Expected Features**:
  - Company dashboard
  - User management (brand-specific)
  - Content management
  - Brand analytics

### 3. Artists
- **YHWH MSC Artists**:
  - `artist1@yhwhmsc.com` / `Test@2025`
  - `artist2@yhwhmsc.com` / `Test@2025`
- **Audio MSC Artists**:
  - `artist1@audiomsc.com` / `Test@2025`
  - `artist2@audiomsc.com` / `Test@2025`
- **Role**: Artist
- **Access**: Content creation and management
- **Expected Features**:
  - Artist dashboard
  - Profile management
  - Music upload
  - Earnings analytics
  - Project management

### 4. Distribution Partners
- **Admin**: `distadmin@mscandco.com` / `Test@2025`
- **User**: `distributor1@mscandco.com` / `Test@2025`
- **Roles**: Distribution Partner Admin / Distributor
- **Access**: Distribution and licensing
- **Expected Features**:
  - Distribution dashboard
  - Content review
  - Partner management
  - Licensing tools

## 🧪 Manual Testing Steps

### Step 1: Access the Platform
1. Open browser and go to: `http://localhost:3000`
2. Verify homepage loads correctly
3. Click "Sign In" or go to: `http://localhost:3000/login-auth0`

### Step 2: Test Login Flow
1. **Auth0 Login Page**: Should show "Sign in with Auth0" button
2. **Click Login**: Should redirect to Auth0 login page
3. **Enter Credentials**: Use any test user above
4. **Authentication**: Should redirect back to platform
5. **Profile Check**: May redirect to profile completion if needed

### Step 3: Test Role-Based Navigation
After successful login, verify:

#### Super Admin Navigation:
- [ ] System Administration section visible
- [ ] User Management accessible
- [ ] Role Management accessible
- [ ] System Settings accessible
- [ ] Financial Reports accessible

#### Company Admin Navigation:
- [ ] Company Management section visible
- [ ] User Management accessible
- [ ] Content Management accessible
- [ ] Brand Management accessible

#### Artist Navigation:
- [ ] Artist Portal section visible
- [ ] Dashboard accessible
- [ ] Profile management accessible
- [ ] Earnings & Analytics accessible
- [ ] Content Management accessible

#### Distribution Partner Navigation:
- [ ] Distribution Dashboard section visible
- [ ] All Creations accessible
- [ ] All Projects accessible
- [ ] Content Review accessible

### Step 4: Test Brand Switching
1. **YHWH MSC Users**: Should see YHWH MSC branding
2. **Audio MSC Users**: Should see Audio MSC branding
3. **Super Admin**: Should see MSC & Co branding
4. **Verify Brand Colors**: Different color schemes per brand

### Step 5: Test Protected Routes
Try accessing these routes without login (should redirect):
- [ ] `/dashboard`
- [ ] `/admin/dashboard`
- [ ] `/artist-portal/profile`
- [ ] `/distribution/dashboard`

### Step 6: Test Role Permissions
For each user role, verify:

#### Super Admin Permissions:
- [ ] Can access all admin pages
- [ ] Can view all users
- [ ] Can manage roles
- [ ] Can access system settings

#### Company Admin Permissions:
- [ ] Can access company admin pages
- [ ] Can manage brand-specific users
- [ ] Can access brand analytics
- [ ] Cannot access super admin features

#### Artist Permissions:
- [ ] Can access artist dashboard
- [ ] Can manage own profile
- [ ] Can upload music
- [ ] Can view earnings
- [ ] Cannot access admin features

#### Distribution Partner Permissions:
- [ ] Can access distribution dashboard
- [ ] Can review content
- [ ] Can manage partnerships
- [ ] Cannot access artist features

## 🔧 Troubleshooting

### Auth0 Login Issues:
1. **Check Auth0 Configuration**: Verify domain and client ID in `lib/auth0-config.js`
2. **Check Redirect URIs**: Ensure `http://localhost:3000` is allowed
3. **Check User Creation**: Users may need to be created in Auth0 dashboard

### Role Access Issues:
1. **Check Database**: Verify roles exist in `up_roles` table
2. **Check User Assignments**: Verify user-role links in `up_users_role_links`
3. **Check Frontend Role Config**: Verify `lib/role-config.js` matches database

### Navigation Issues:
1. **Check Role Detection**: Verify `getUserRole()` function works correctly
2. **Check Navigation Config**: Verify `ROLE_NAVIGATION` matches user roles
3. **Check Auth0 Metadata**: Verify user metadata contains role information

## 📊 Expected Test Results

### ✅ Success Criteria:
- All users can log in successfully
- Role-based navigation appears correctly
- Protected routes redirect unauthenticated users
- Brand switching works per user
- Role permissions are enforced

### ⚠️ Known Issues:
- Auth0 API configuration mismatch (frontend vs backend)
- Routes may be accessible in development mode
- Some features may require additional setup

## 🎯 Next Steps After Testing

1. **Fix Auth0 Integration**: Align frontend and backend Auth0 configurations
2. **Implement Route Protection**: Add proper authentication guards
3. **Test Content Features**: Upload music, create projects, etc.
4. **Test Export Features**: Generate reports and exports
5. **Performance Testing**: Test with multiple concurrent users

## 📞 Support

If issues are found:
1. Check container logs: `docker logs msc-co-frontend`
2. Check database: `docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev`
3. Check Auth0 dashboard for user status
4. Review role configuration in Strapi admin

---

**Platform Status**: ✅ Ready for Manual Testing
**Last Updated**: 2025-07-25
**Test Environment**: Development (Docker) 