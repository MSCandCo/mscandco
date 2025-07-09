# 🎵 MSC & CO COMPLETE USER REFERENCE

## 📋 ALL USER ACCOUNTS

### 🔐 ADMIN USERS
| Email | Username | Role | Brand | Password |
|-------|----------|------|-------|----------|
| superadmin@mscandco.com | superadmin | Super Admin | MSC & Co | Test@2025 |
| admin@yhwhmsc.com | yhwh_admin | Company Admin | YHWH MSC | Test@2025 |
| admin@audiomsc.com | audio_admin | Company Admin | Audio MSC | Test@2025 |

### 🎵 ARTIST USERS
| Email | Username | Role | Brand | Password |
|-------|----------|------|-------|----------|
| artist1@yhwhmsc.com | yhwh_artist1 | Artist | YHWH MSC | Test@2025 |
| artist2@yhwhmsc.com | yhwh_artist2 | Artist | YHWH MSC | Test@2025 |
| artist1@audiomsc.com | audio_artist1 | Artist | Audio MSC | Test@2025 |
| artist2@audiomsc.com | audio_artist2 | Artist | Audio MSC | Test@2025 |

### 📦 DISTRIBUTION PARTNER USERS
| Email | Username | Role | Brand | Password |
|-------|----------|------|-------|----------|
| distadmin@mscandco.com | dist_admin | Distribution Partner Admin | MSC & Co | Test@2025 |
| distributor1@mscandco.com | distributor1 | Distributor | MSC & Co | Test@2025 |

## 🔗 ACCESS LINKS

- **Frontend**: http://localhost:3000
- **Backend Admin**: http://localhost:1337/admin
- **All Passwords**: Test@2025

## 🎯 QUICK TESTING GUIDE

### Test Admin Users
1. **Super Admin**: superadmin@mscandco.com / Test@2025
   - Full platform access
   - MSC & Co branding
   - All features available

2. **YHWH Admin**: admin@yhwhmsc.com / Test@2025
   - YHWH MSC company management
   - YHWH MSC branding
   - Company-specific features

3. **Audio Admin**: admin@audiomsc.com / Test@2025
   - Audio MSC company management
   - Audio MSC branding
   - Company-specific features

### Test Artist Users
1. **YHWH Artists**: artist1@yhwhmsc.com, artist2@yhwhmsc.com / Test@2025
   - YHWH MSC branding
   - Artist-specific features
   - Song/Project/Stem management

2. **Audio Artists**: artist1@audiomsc.com, artist2@audiomsc.com / Test@2025
   - Audio MSC branding
   - Artist-specific features
   - Song/Project/Stem management

### Test Distribution Partners
1. **Distribution Admin**: distadmin@mscandco.com / Test@2025
   - Distribution management
   - Partner analytics
   - MSC & Co branding

2. **Distributor**: distributor1@mscandco.com / Test@2025
   - Distribution operations
   - Partner features
   - MSC & Co branding

## 🧪 TESTING CHECKLIST

### ✅ User Creation
- [ ] All admin users created
- [ ] All artist users created
- [ ] All distribution partner users created
- [ ] All users have correct roles
- [ ] All users have correct brand associations

### ✅ Login Testing
- [ ] All users can login successfully
- [ ] All users see correct branding
- [ ] All users have appropriate permissions
- [ ] Role-based access control works

### ✅ Feature Testing
- [ ] Admin features work for admin users
- [ ] Artist features work for artist users
- [ ] Distribution features work for distribution users
- [ ] Brand-specific features work correctly

### ✅ Brand Association Testing
- [ ] MSC & Co users see MSC & Co branding
- [ ] YHWH MSC users see YHWH MSC branding
- [ ] Audio MSC users see Audio MSC branding
- [ ] Brand switching works correctly

## 🔧 TROUBLESHOOTING

### If Users Don't Exist
```bash
# Check database for users
docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT email, username, role, brand FROM up_users ORDER BY created_at DESC;"
```

### If Login Fails
1. Verify password is exactly "Test@2025"
2. Check email spelling
3. Ensure user is confirmed and not blocked
4. Check role assignment in Strapi

### If Brand Association Fails
1. Verify brand field is exactly as specified
2. Check frontend brand switching logic
3. Ensure role permissions are correct

## 🎯 NEXT STEPS

After creating all users:

1. **Test all user logins** ✅
2. **Verify brand associations** ✅
3. **Check role-based permissions** ✅
4. **Test role-specific features** ✅
5. **Add sample data** 🔄
6. **Test complete workflows** 🔄

---

**🎵 Your complete MSC & Co user ecosystem is ready for revolutionary music distribution!** 