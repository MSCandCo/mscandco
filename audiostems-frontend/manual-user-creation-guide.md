# 🚀 MANUAL USER CREATION GUIDE

Since the automated script is having authentication issues, here's how to create all test users manually through the Strapi admin interface.

## 📋 PREREQUISITES
- You're logged into Strapi admin at http://localhost:1337/admin
- You have admin permissions to create users

## 👥 USERS TO CREATE

### 1. ADMIN USERS

#### Super Admin
- **Email:** superadmin@mscandco.com
- **Username:** superadmin
- **Password:** Test@2025
- **Role:** Super Admin
- **Brand:** MSC & Co

#### YHWH MSC Admin
- **Email:** admin@yhwhmsc.com
- **Username:** yhwh_admin
- **Password:** Test@2025
- **Role:** Company Admin
- **Brand:** YHWH MSC

#### Audio MSC Admin
- **Email:** admin@audiomsc.com
- **Username:** audio_admin
- **Password:** Test@2025
- **Role:** Company Admin
- **Brand:** Audio MSC

### 2. ARTIST USERS

#### YHWH MSC Artists
- **Email:** artist1@yhwhmsc.com
- **Username:** yhwh_artist1
- **Password:** Test@2025
- **Role:** Artist
- **Brand:** YHWH MSC

- **Email:** artist2@yhwhmsc.com
- **Username:** yhwh_artist2
- **Password:** Test@2025
- **Role:** Artist
- **Brand:** YHWH MSC

#### Audio MSC Artists
- **Email:** artist1@audiomsc.com
- **Username:** audio_artist1
- **Password:** Test@2025
- **Role:** Artist
- **Brand:** Audio MSC

- **Email:** artist2@audiomsc.com
- **Username:** audio_artist2
- **Password:** Test@2025
- **Role:** Artist
- **Brand:** Audio MSC

### 3. DISTRIBUTION USERS

#### Distribution Admin
- **Email:** distadmin@mscandco.com
- **Username:** dist_admin
- **Password:** Test@2025
- **Role:** Distribution Admin
- **Brand:** MSC & Co

#### Distributor
- **Email:** distributor1@mscandco.com
- **Username:** distributor1
- **Password:** Test@2025
- **Role:** Distributor
- **Brand:** MSC & Co

## 🔧 STEP-BY-STEP INSTRUCTIONS

### For Each User:

1. **Go to Users Section**
   - In Strapi admin, click "Users" in the left sidebar

2. **Create New User**
   - Click "Create new user" button

3. **Fill User Details**
   - **Email:** (use the email from the list above)
   - **Username:** (use the username from the list above)
   - **Password:** Test@2025
   - **First Name:** (appropriate first name)
   - **Last Name:** (appropriate last name)
   - **Role:** (select from dropdown - Super Admin, Company Admin, Artist, Distribution Admin, or Distributor)
   - **Brand:** (type the brand name - MSC & Co, YHWH MSC, or Audio MSC)
   - **Confirmed:** ✅ (check this box)
   - **Blocked:** ❌ (leave unchecked)

4. **Save User**
   - Click "Save" button
   - Verify the user was created successfully

5. **Repeat for All Users**
   - Create all 9 users following the same process

## 🎯 QUICK REFERENCE TABLE

| Email | Username | Role | Brand | Password |
|-------|----------|------|-------|----------|
| superadmin@mscandco.com | superadmin | Super Admin | MSC & Co | Test@2025 |
| admin@yhwhmsc.com | yhwh_admin | Company Admin | YHWH MSC | Test@2025 |
| admin@audiomsc.com | audio_admin | Company Admin | Audio MSC | Test@2025 |
| artist1@yhwhmsc.com | yhwh_artist1 | Artist | YHWH MSC | Test@2025 |
| artist2@yhwhmsc.com | yhwh_artist2 | Artist | YHWH MSC | Test@2025 |
| artist1@audiomsc.com | audio_artist1 | Artist | Audio MSC | Test@2025 |
| artist2@audiomsc.com | audio_artist2 | Artist | Audio MSC | Test@2025 |
| distadmin@mscandco.com | dist_admin | Distribution Admin | MSC & Co | Test@2025 |
| distributor1@mscandco.com | distributor1 | Distributor | MSC & Co | Test@2025 |

## ✅ VERIFICATION STEPS

After creating all users:

1. **Test Login at Frontend**
   - Go to http://localhost:3000
   - Try logging in with each user
   - Verify brand switching works
   - Check role-based access

2. **Check User List**
   - In Strapi admin, go to Users section
   - Verify all 9 users are listed
   - Check that roles and brands are set correctly

3. **Test API Access**
   - Try accessing protected endpoints
   - Verify authentication works for each user type

## 🚨 TROUBLESHOOTING

### If Users Can't Login:
1. Check if users are confirmed (should be ✅)
2. Verify passwords are set correctly
3. Check if users are blocked (should be ❌)
4. Verify roles are assigned properly

### If Brand Switching Doesn't Work:
1. Check if brand field is populated correctly
2. Verify frontend brand detection logic
3. Check user permissions for brand access

### If Role-Based Access Fails:
1. Verify roles are assigned correctly
2. Check role permissions in Strapi
3. Test with different user types

## 🎉 COMPLETION CHECKLIST

- [ ] All 9 users created in Strapi admin
- [ ] All users have correct roles assigned
- [ ] All users have correct brands assigned
- [ ] All users are confirmed and not blocked
- [ ] Test login works for at least one admin user
- [ ] Test login works for at least one artist user
- [ ] Brand switching functionality works
- [ ] Role-based access control works

Once all users are created, you can start testing the platform with full user ecosystem! 