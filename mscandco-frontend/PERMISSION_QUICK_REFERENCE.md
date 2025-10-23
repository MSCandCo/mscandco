# AdminHeader Permission Quick Reference

## 📋 Complete Permission List

### Navigation Items (Main Dropdowns)

```
Requests                    → analytics:requests:read
User Management             → users_access:user_management:read
Permissions & Roles         → users_access:permissions_roles:read
Ghost Login                 → user:impersonate

Analytics Management        → analytics:analytics_management:read
Platform Analytics          → analytics:platform_analytics:read

Earnings Management         → finance:earnings_management:read
Wallet Management           → finance:wallet_management:read
Split Configuration         → finance:split_configuration:read

Asset Library               → content:asset_library:read
Master Roster               → users_access:master_roster:read

Distribution Hub            → distribution:read:any
Revenue Reporting           → revenue:read
```

### Right Side Icons

```
Notification Bell           → notifications:read ✅ NOW IMPLEMENTED
About                       → (always visible)
Support                     → (always visible)
Role Badge                  → (always visible)
```

### User Dropdown

```
Dashboard                   → (always visible)
Profile                     → (always visible)
Platform Messages           → platform_messages:read
Messages                    → messages:read
Settings                    → settings:read
Logout                      → (always visible)
```

---

## ✅ Changes Made

### Added Notification Permission
- **Before**: Notification bell was always visible
- **After**: Controlled by `notifications:read` permission
- **Code**: Wrapped in `{(showAll || hasPermission('notifications:read')) && (...)}`

---

## 🎯 Permission Categories

### 1. User & Access (4 permissions)
- `analytics:requests:read`
- `users_access:user_management:read`
- `users_access:permissions_roles:read`
- `user:impersonate`

### 2. Analytics (2 permissions)
- `analytics:analytics_management:read`
- `analytics:platform_analytics:read`

### 3. Finance (3 permissions)
- `finance:earnings_management:read`
- `finance:wallet_management:read`
- `finance:split_configuration:read`

### 4. Content (2 permissions)
- `content:asset_library:read`
- `users_access:master_roster:read`

### 5. Distribution (2 permissions)
- `distribution:read:any`
- `revenue:read`

### 6. Communication (3 permissions)
- `platform_messages:read`
- `messages:read`
- `notifications:read` ✅ **NEW**

### 7. System (1 permission)
- `settings:read`

---

## 🔑 Total Permissions: 18

**Permission-Controlled Items**: 18  
**Always Visible Items**: 6 (Dashboard, Profile, About, Support, Role Badge, Logout)

---

## 📊 Super Admin Override

Users with these automatically see ALL items:
- Role: `super_admin`
- Permission: `*:*:*` (wildcard)

The `showAll` variable is set to `true` for these users, bypassing all permission checks.

---

## 🧪 Testing Commands

### Check if notification permission exists in database:
```sql
SELECT * FROM permissions WHERE name = 'notifications:read';
```

### Assign notification permission to a role:
```sql
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'company_admin'
AND p.name = 'notifications:read';
```

### Verify user has notification permission:
```sql
SELECT p.name
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE up.id = 'USER_ID_HERE'
AND p.name = 'notifications:read';
```

---

## 📝 Implementation Status

✅ All navigation dropdowns permission-controlled  
✅ Dynamic dropdown logic (0/1/2+ items)  
✅ User dropdown permission-controlled  
✅ Notification bell permission-controlled  
✅ Profile link added to user dropdown  
✅ Console logging for debugging  

---

## 🔗 Related Files

- `/components/AdminHeader.js` - Main component
- `/hooks/usePermissions.js` - Permission hook
- `/lib/permissions.js` - Server-side permissions
- `/pages/api/user/permissions.js` - API endpoint
- `ADMINHEADER_PERMISSION_MAPPING.md` - Detailed mapping
- `DYNAMIC_DROPDOWN_IMPLEMENTATION.md` - Dynamic dropdown docs
- `USER_DROPDOWN_PERMISSIONS.md` - User dropdown docs

