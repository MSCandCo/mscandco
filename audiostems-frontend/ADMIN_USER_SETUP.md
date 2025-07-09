# 🚀 MSC & CO ADMIN USER SETUP GUIDE

## 📋 Overview
This guide will help you create the core admin users for the MSC & Co platform through the Strapi admin interface.

## 🔐 STEP 1: ACCESS STRAPI ADMIN

### Open Strapi Admin
1. **Go to**: http://localhost:1337/admin
2. **First Time Setup**: If this is your first time, you'll need to create the initial admin account

### Create Initial Admin Account
If you see a setup page:
1. **Fill in the form**:
   - **First Name**: Super
   - **Last Name**: Admin
   - **Email**: superadmin@mscandco.com
   - **Password**: Test@2025
   - **Confirm Password**: Test@2025
2. **Click "Create your account"**

## 👥 STEP 2: CREATE CORE ADMIN USERS

### Method 1: Through Strapi Admin Interface

#### 1. Super Admin User
1. **Navigate to**: Content Manager → Users
2. **Click**: "Create new entry"
3. **Fill in the form**:
   - **Username**: superadmin
   - **Email**: superadmin@mscandco.com
   - **Password**: Test@2025
   - **Confirmed**: ✅ (checked)
   - **Blocked**: ❌ (unchecked)
   - **Role**: super_admin
   - **Brand**: MSC & Co
   - **Stage Name**: MSC Admin
   - **First Name**: Super
   - **Last Name**: Admin
4. **Click**: "Save"

#### 2. YHWH MSC Admin User
1. **Navigate to**: Content Manager → Users
2. **Click**: "Create new entry"
3. **Fill in the form**:
   - **Username**: yhwh_admin
   - **Email**: admin@yhwhmsc.com
   - **Password**: Test@2025
   - **Confirmed**: ✅ (checked)
   - **Blocked**: ❌ (unchecked)
   - **Role**: company_admin
   - **Brand**: YHWH MSC
   - **Stage Name**: YHWH Admin
   - **First Name**: YHWH
   - **Last Name**: Admin
4. **Click**: "Save"

#### 3. Audio MSC Admin User
1. **Navigate to**: Content Manager → Users
2. **Click**: "Create new entry"
3. **Fill in the form**:
   - **Username**: audio_admin
   - **Email**: admin@audiomsc.com
   - **Password**: Test@2025
   - **Confirmed**: ✅ (checked)
   - **Blocked**: ❌ (unchecked)
   - **Role**: company_admin
   - **Brand**: Audio MSC
   - **Stage Name**: Audio Admin
   - **First Name**: Audio
   - **Last Name**: Admin
4. **Click**: "Save"

### Method 2: Direct Database Insert (Alternative)

If the admin interface doesn't work, you can create users directly in the database:

```sql
-- Connect to the database
docker exec -it msc-co-postgres psql -U msc_co_user -d msc_co_dev

-- Create Super Admin
INSERT INTO up_users (username, email, provider, password, reset_password_token, confirmation_token, confirmed, blocked, role, brand, stage_name, first_name, last_name, created_at, updated_at) 
VALUES ('superadmin', 'superadmin@mscandco.com', 'local', '$2a$10$encrypted_password_hash', NULL, NULL, true, false, 'super_admin', 'MSC & Co', 'MSC Admin', 'Super', 'Admin', NOW(), NOW());

-- Create YHWH MSC Admin
INSERT INTO up_users (username, email, provider, password, reset_password_token, confirmation_token, confirmed, blocked, role, brand, stage_name, first_name, last_name, created_at, updated_at) 
VALUES ('yhwh_admin', 'admin@yhwhmsc.com', 'local', '$2a$10$encrypted_password_hash', NULL, NULL, true, false, 'company_admin', 'YHWH MSC', 'YHWH Admin', 'YHWH', 'Admin', NOW(), NOW());

-- Create Audio MSC Admin
INSERT INTO up_users (username, email, provider, password, reset_password_token, confirmation_token, confirmed, blocked, role, brand, stage_name, first_name, last_name, created_at, updated_at) 
VALUES ('audio_admin', 'admin@audiomsc.com', 'local', '$2a$10$encrypted_password_hash', NULL, NULL, true, false, 'company_admin', 'Audio MSC', 'Audio Admin', 'Audio', 'Admin', NOW(), NOW());
```

## 🧪 STEP 3: TEST USER CREATION

### Test Login
1. **Go to**: http://localhost:3000
2. **Click**: "Login"
3. **Test each user**:
   - **Super Admin**: superadmin@mscandco.com / Test@2025
   - **YHWH Admin**: admin@yhwhmsc.com / Test@2025
   - **Audio Admin**: admin@audiomsc.com / Test@2025

### Verify Brand Switching
1. **Login as Super Admin**
2. **Check brand switching**: Should see MSC & Co
3. **Login as YHWH Admin**
4. **Check brand switching**: Should see YHWH MSC
5. **Login as Audio Admin**
6. **Check brand switching**: Should see Audio MSC

## 🔧 STEP 4: TROUBLESHOOTING

### If Users Don't Appear
1. **Check Strapi logs**:
   ```bash
   docker logs msc-co-backend --tail 20
   ```

2. **Check database**:
   ```bash
   docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT email, username FROM up_users;"
   ```

3. **Restart Strapi**:
   ```bash
   docker restart msc-co-backend
   ```

### If Login Fails
1. **Check password**: Ensure it's exactly "Test@2025"
2. **Check email**: Ensure no typos
3. **Check user status**: Ensure user is confirmed and not blocked
4. **Check Auth0 configuration**: Ensure redirect URIs are correct

## 📋 ADMIN USER SUMMARY

### Created Users
| Email | Username | Role | Brand | Password |
|-------|----------|------|-------|----------|
| superadmin@mscandco.com | superadmin | Super Admin | MSC & Co | Test@2025 |
| admin@yhwhmsc.com | yhwh_admin | Company Admin | YHWH MSC | Test@2025 |
| admin@audiomsc.com | audio_admin | Company Admin | Audio MSC | Test@2025 |

### Access Information
- **Frontend**: http://localhost:3000
- **Backend Admin**: http://localhost:1337/admin
- **Database**: PostgreSQL (msc-co-postgres)

## 🎯 NEXT STEPS

After creating the admin users:

1. **Test all user logins**
2. **Verify brand switching functionality**
3. **Check role-based access control**
4. **Add sample data through Strapi admin**
5. **Test the full platform functionality**

## 🔗 QUICK COMMANDS

### Check User Status
```bash
# Check if users exist in database
docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT email, username FROM up_users;"

# Check Strapi status
curl -s http://localhost:1337/admin | head -5

# Check frontend status
curl -s http://localhost:3000 | head -5
```

### Restart Services
```bash
# Restart backend
docker restart msc-co-backend

# Restart frontend
docker restart msc-co-frontend

# Check all containers
docker ps
```

---

**🎵 Your MSC & Co admin users are ready for revolutionary music distribution!** 