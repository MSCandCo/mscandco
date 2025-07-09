# 🚀 QUICK ADMIN SETUP - MSC & CO

## ⚡ IMMEDIATE ACTION REQUIRED

### Step 1: Access Strapi Admin
1. **Open your browser**
2. **Go to**: http://localhost:1337/admin
3. **You should see the Strapi admin setup page**

### Step 2: Create Initial Admin Account
If you see a setup/registration page:
1. **Fill in the form**:
   - **First Name**: Super
   - **Last Name**: Admin
   - **Email**: superadmin@mscandco.com
   - **Password**: Test@2025
   - **Confirm Password**: Test@2025
2. **Click "Create your account"**

### Step 3: Create Additional Admin Users
Once logged in as the initial admin:

1. **Navigate to**: Content Manager → Users
2. **Click**: "Create new entry" for each user below

#### User 1: YHWH MSC Admin
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

#### User 2: Audio MSC Admin
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

## 🧪 TEST THE USERS

### Test Login at Frontend
1. **Go to**: http://localhost:3000
2. **Click**: "Login"
3. **Test each user**:
   - **Super Admin**: superadmin@mscandco.com / Test@2025
   - **YHWH Admin**: admin@yhwhmsc.com / Test@2025
   - **Audio Admin**: admin@audiomsc.com / Test@2025

## 📋 ADMIN USER SUMMARY

| Email | Username | Role | Brand | Password |
|-------|----------|------|-------|----------|
| superadmin@mscandco.com | superadmin | Super Admin | MSC & Co | Test@2025 |
| admin@yhwhmsc.com | yhwh_admin | Company Admin | YHWH MSC | Test@2025 |
| admin@audiomsc.com | audio_admin | Company Admin | Audio MSC | Test@2025 |

## 🔗 ACCESS LINKS

- **Frontend**: http://localhost:3000
- **Backend Admin**: http://localhost:1337/admin
- **Database**: PostgreSQL (msc-co-postgres)

## ⚠️ TROUBLESHOOTING

### If Strapi Admin Won't Load
```bash
# Check if backend is running
docker ps | grep backend

# Restart backend if needed
docker restart msc-co-backend

# Check logs
docker logs msc-co-backend --tail 20
```

### If Users Don't Save
1. **Check required fields**: Make sure all required fields are filled
2. **Check role permissions**: Ensure roles exist in Strapi
3. **Check database connection**: Verify PostgreSQL is running

### If Login Fails
1. **Verify password**: Must be exactly "Test@2025"
2. **Check email**: No typos in email addresses
3. **Check user status**: Ensure user is confirmed and not blocked

## 🎯 NEXT STEPS

After creating the admin users:

1. ✅ **Test all user logins**
2. ✅ **Verify brand switching functionality**
3. ✅ **Check role-based access control**
4. 🔄 **Add sample data through Strapi admin**
5. 🔄 **Test the full platform functionality**

---

**🎵 Your MSC & Co admin users are ready for revolutionary music distribution!** 