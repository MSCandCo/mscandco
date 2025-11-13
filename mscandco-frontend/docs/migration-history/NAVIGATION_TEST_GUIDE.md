# 🧪 Permission-Based Navigation Testing Guide

**Date:** October 8, 2025
**System:** Permission-based header navigation
**Dev Server:** http://localhost:3013

---

## ✅ What Was Implemented

### 1. **usePermissions Hook** (`hooks/usePermissions.js`)
- Loads user permissions once, caches for component lifecycle
- Supports wildcard pattern matching
- Returns: `hasPermission()`, `hasAnyPermission()`, `hasAllPermissions()`

### 2. **RoleBasedNavigation** (`components/auth/RoleBasedNavigation.js`)
- Replaced ALL role checks with permission checks
- Desktop: Main nav + Admin dropdown
- Mobile: Hamburger menu with permission-based items
- Notification bell based on permissions
- Wallet display based on permissions

### 3. **MainLayout Sidebar** (`components/layouts/mainLayout.js`)
- Sidebar navigation now permission-based
- Shows different links based on user permissions

---

## 🧪 Manual Testing Steps

### **Test 1: Artist User**
**Expected Permissions:**
- `release:read:own`
- `analytics:read:own`
- `earnings:read:own`
- `notification:read:own`

**Expected Navigation:**
- ✅ My Releases
- ✅ Analytics
- ✅ Earnings
- ✅ Roster (if `user:read:label`)
- ✅ Notification Bell
- ✅ Wallet Balance
- ❌ NO Admin dropdown

**Steps:**
1. Open http://localhost:3013
2. Login as artist user
3. Check header navigation - should see personal links only
4. Check NO "Admin" dropdown appears
5. Open mobile menu - verify same links
6. Check notification bell is visible

---

### **Test 2: Company Admin**
**Expected Permissions:**
- All artist permissions PLUS:
- `user:read:any`
- `role:read:any`
- `analytics:read:any`
- `release:read:any`

**Expected Navigation:**
- ✅ All artist links (Releases, Analytics, Earnings)
- ✅ **Admin Dropdown** with:
  - User Management
  - Profile Requests
  - Roles & Permissions
  - Platform Analytics
  - All Releases
- ✅ Notification Bell (admin notifications)

**Steps:**
1. Login as company_admin
2. Verify "Admin" dropdown appears in header
3. Hover over Admin - check all 5 items appear
4. Click each admin link - verify they load correctly
5. Check mobile menu - verify admin section appears

---

### **Test 3: Requests Admin** (Custom Role)
**Expected Permissions:**
- `user:read:any` (to manage profile requests)
- `user:update:any` (to approve requests)

**Expected Navigation:**
- ✅ **Admin Dropdown** with ONLY:
  - User Management
  - Profile Requests
- ❌ NO Roles & Permissions
- ❌ NO Platform Analytics
- ❌ NO All Releases

**Steps:**
1. Login as requests_admin
2. Verify "Admin" dropdown appears
3. Check only 2 items show: Users, Profile Requests
4. Verify NO permissions, analytics, or releases links

---

### **Test 4: Financial Admin** (Custom Role)
**Expected Permissions:**
- `earnings:read:any`
- `payout:read:any`
- `payout:approve:any`
- `analytics:read:own`

**Expected Navigation:**
- ✅ Earnings
- ✅ Analytics
- ✅ **Admin Dropdown** with ONLY:
  - Platform Analytics (if has `analytics:read:any`)
- ❌ NO User Management
- ❌ NO Roles & Permissions

**Steps:**
1. Login as financial_admin
2. Check header for earnings/analytics links
3. Admin dropdown should be minimal or absent
4. Verify NO user management access

---

### **Test 5: Super Admin**
**Expected Permissions:**
- `*:*:*` (wildcard - has EVERYTHING)

**Expected Navigation:**
- ✅ ALL navigation items visible
- ✅ Full admin dropdown
- ✅ All features accessible

**Steps:**
1. Login as super_admin
2. Verify full navigation appears
3. Admin dropdown has all 5 items
4. All links work correctly

---

## 🔍 Browser Console Checks

Open browser DevTools (F12) and check:

### **1. Permission Loading**
```javascript
// Should see in console:
✅ [getUserPermissions] Loading permissions for user...
✅ Permissions loaded: ['release:read:own', 'analytics:read:own', ...]
```

### **2. No Errors**
Check for:
- ❌ `getUserPermissions is not defined`
- ❌ `hasPermission is not a function`
- ❌ `Cannot read property 'includes' of undefined`

### **3. Network Tab**
- Check for calls to `/api/admin/permissions/list` (should work)
- Verify no 403 errors on allowed pages
- Verify 403 errors on forbidden pages

---

## 🐛 Common Issues & Fixes

### **Issue: Navigation not updating after login**
**Fix:** Refresh the page - permissions are loaded on mount

### **Issue: "Loading..." stuck on navigation**
**Fix:**
1. Check browser console for errors
2. Verify `getUserPermissions()` function exists in `lib/permissions.js`
3. Check database connection to Supabase

### **Issue: Admin dropdown not appearing**
**Fix:**
1. Check user has at least ONE admin permission:
   - `user:read:any`
   - `role:read:any`
   - `support:read:any`
   - `analytics:read:any`
   - `release:read:any`
2. Verify `hasAdminAccess` logic in RoleBasedNavigation.js

### **Issue: Wildcard not working for super_admin**
**Fix:**
1. Verify super_admin has `*:*:*` permission in database
2. Check `hasPermission()` wildcard logic in usePermissions.js
3. Verify user ID matches MASTER_ADMIN_ID in lib/permissions.js

---

## 📊 Database Verification

Run these SQL queries in Supabase SQL Editor:

### **Check User's Permissions**
```sql
SELECT * FROM get_user_permissions('USER_ID_HERE');
```

### **Check User's Role**
```sql
SELECT
  up.user_id,
  up.role_name,
  r.role_type,
  COUNT(rp.permission_id) as permission_count
FROM user_profiles up
LEFT JOIN roles r ON up.role_name = r.role_name
LEFT JOIN role_permissions rp ON r.role_name = rp.role_name
WHERE up.user_id = 'USER_ID_HERE'
GROUP BY up.user_id, up.role_name, r.role_type;
```

### **List All Permissions for a Role**
```sql
SELECT
  rp.role_name,
  p.permission_name,
  p.resource,
  p.action,
  p.scope
FROM role_permissions rp
JOIN permissions p ON rp.permission_id = p.permission_id
WHERE rp.role_name = 'artist'
ORDER BY p.permission_name;
```

---

## ✅ Success Criteria

All tests pass if:
1. ✅ Artists see personal links only (no admin)
2. ✅ Admins see admin dropdown with permission-based items
3. ✅ Custom roles (requests_admin, financial_admin) see limited admin access
4. ✅ Super admin sees everything
5. ✅ No console errors
6. ✅ Navigation updates immediately after login
7. ✅ Mobile menu matches desktop permissions
8. ✅ Notification bell appears correctly
9. ✅ Wallet balance shows for users with earnings permission

---

## 🚀 Next Steps After Testing

If all tests pass:
1. ✅ Commit changes to git
2. ✅ Create pull request
3. ✅ Deploy to staging
4. ✅ Final QA testing
5. ✅ Deploy to production

If tests fail:
1. ❌ Document the issue
2. ❌ Check browser console
3. ❌ Verify database permissions
4. ❌ Review code changes
5. ❌ Fix and retest

---

**Testing Complete?** Mark this checklist:
- [ ] Test 1: Artist ✓
- [ ] Test 2: Company Admin ✓
- [ ] Test 3: Requests Admin ✓
- [ ] Test 4: Financial Admin ✓
- [ ] Test 5: Super Admin ✓
- [ ] Browser console clean ✓
- [ ] Mobile navigation works ✓
- [ ] All links functional ✓

**Ready for deployment!** 🎉
