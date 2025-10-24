# Complete Role System - Single Source of Truth

## Overview
This document is the **SINGLE SOURCE OF TRUTH** for the entire role-based system in the MSC & Co platform. All role definitions, permissions, header routing, and configurations are documented here.

---

## 1. Role Configuration (`lib/role-config.js`)

### Platform Admin Roles (Use AdminHeader)
```javascript
'super_admin'
'company_admin'
'analytics_admin'
'distribution_partner'
'requests_admin'
```

### Content Creator Roles (Use Standard Header)
```javascript
'artist'
'label_admin'    // With underscore (database standard)
'labeladmin'     // Without underscore (legacy support)
```

**Important:** Both `label_admin` and `labeladmin` are supported for backward compatibility, but **`label_admin`** (with underscore) is the standard.

---

## 2. Role Permissions

### Artist (28 permissions)
- 9 Page Access permissions
- 4 Message Tab permissions
- 7 Settings Tab permissions
- 2 Analytics Tab permissions
- 6 Own User permissions

### Label Admin (32 permissions)
**Same as Artist (28) + 4 Label-Specific:**
- `label:read:own`
- `label:update:own`
- `label:roster:read:own`
- `label:roster:manage:own`

### Distribution Partner (20 permissions)
- 2 Distribution permissions (Hub, Revenue)
- 9 Basic User Access permissions
- 4 Message Tab permissions
- 3 Settings Tab permissions
- 2 Own User permissions

### Company Admin (41 permissions)
- All "any" scope permissions
- Company-wide access

### Super Admin (28+ permissions)
- Wildcard `*:*:*` permission (full access)

---

## 3. Header Routing Logic

### Flow:
```javascript
1. User logs in
2. Fetch profile data (includes role)
3. Check role against role-config.js:
   - isPlatformAdmin(role) → AdminHeader
   - isContentCreator(role) → Standard Header
4. Render appropriate header with navigation
```

### Loading States:
- **No user**: Show logged-out header
- **User but no profileData**: Show loading spinner
- **User + profileData**: Route to correct header

---

## 4. Navigation Items by Role

### Artist (4 items)
```
Releases | Analytics | Earnings | Roster
```

### Label Admin (5 items)
```
My Artists | Releases | Analytics | Earnings | Roster
```

### Distribution Partner (2 items)
```
Distribution Hub | Revenue Reporting
```

### Platform Admins (Dropdowns)
```
[User & Access ▼] | [Analytics ▼] | [Finance ▼] | [Content ▼] | [Distribution ▼]
```

---

## 5. Smart Navigation System

### Rules:
- **1 item**: Always standalone link
- **2-5 items**: All standalone links (no dropdowns)
- **6+ items**: Organized into dropdowns

### Examples:
- Distribution Partner (2 items) → 2 standalone links
- Label Admin (5 items) → 5 standalone links
- Super Admin (14+ items) → 5 dropdowns

---

## 6. Database Schema

### Tables:
- `roles` - Role definitions
- `permissions` - Permission definitions
- `role_permissions` - Role-to-permission mapping
- `user_profiles` - User data including role
- `auth.users` - Supabase auth with metadata

### Key Fields:
```sql
user_profiles.role         -- User's role (e.g., 'label_admin')
auth.users.raw_user_meta_data->>'role'  -- Role in metadata
auth.users.raw_app_meta_data->>'role'   -- Role in app metadata
```

---

## 7. Critical Files

### Core Configuration:
1. **`lib/role-config.js`** - Single source of truth for roles
2. **`components/header.js`** - Standard header for content creators
3. **`components/AdminHeader.js`** - Admin header for platform admins

### Database Migrations:
1. **`database/migrations/create_rbac_system.sql`** - Main RBAC setup
2. **`database/migrations/create_consolidated_permissions.sql`** - Consolidated permissions
3. **`database/fix-label-admin-permissions-final.sql`** - Label admin permissions
4. **`database/fix-distribution-partner-permissions.sql`** - Distribution partner permissions
5. **`database/add-final-6-permissions.sql`** - Missing basic permissions

---

## 8. Common Issues & Solutions

### Issue 1: Blank Header
**Cause:** Role name mismatch (e.g., `labeladmin` vs `label_admin`)
**Solution:** Update user role to match where permissions are assigned

### Issue 2: No Navigation Items
**Cause:** User has 0 permissions loaded
**Solution:** 
1. Check role name matches in database
2. Verify permissions are assigned to that role
3. Log out and log back in to reload permissions

### Issue 3: Wrong Header Type
**Cause:** Role not in correct array in `role-config.js`
**Solution:** Add role to `PLATFORM_ADMIN_ROLES` or `CONTENT_CREATOR_ROLES`

---

## 9. Adding a New Role

### Step 1: Add to role-config.js
```javascript
// If platform admin:
export const PLATFORM_ADMIN_ROLES = [
  // ... existing roles
  'new_admin_role'
];

// If content creator:
export const CONTENT_CREATOR_ROLES = [
  // ... existing roles
  'new_creator_role'
];

// Add display name:
export const ROLE_DISPLAY_NAMES = {
  // ... existing names
  'new_role': 'New Role Display Name'
};
```

### Step 2: Create role in database
```sql
INSERT INTO roles (name, description, is_system_role)
VALUES ('new_role', 'Description', true);
```

### Step 3: Assign permissions
```sql
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'new_role'
AND p.name IN (
  'permission1',
  'permission2',
  -- ... list all required permissions
);
```

### Step 4: Test
1. Create test user with new role
2. Log in
3. Verify correct header displays
4. Verify navigation items show
5. Verify permissions work

---

## 10. Role Comparison Matrix

| Feature | Artist | Label Admin | Distribution Partner | Company Admin | Super Admin |
|---------|--------|-------------|---------------------|---------------|-------------|
| **Header Type** | Standard | Standard | Admin | Admin | Admin |
| **Navigation Items** | 4 | 5 | 2 | Dropdowns | Dropdowns |
| **Permissions** | 28 | 32 | 20 | 41 | All (*:*:*) |
| **Manages** | Own content | Multiple artists | Distribution | Platform | Everything |
| **Admin Access** | ❌ | ❌ | ✅ (Limited) | ✅ | ✅ |

---

## 11. Maintenance Checklist

### When Adding a Role:
- [ ] Add to `lib/role-config.js`
- [ ] Add display name
- [ ] Create in database `roles` table
- [ ] Assign permissions in `role_permissions`
- [ ] Test header routing
- [ ] Test navigation display
- [ ] Test permissions
- [ ] Update this documentation

### When Modifying Permissions:
- [ ] Update database migration files
- [ ] Run migration on all environments
- [ ] Test affected roles
- [ ] Update documentation

### When Debugging:
- [ ] Check console for `🔍 Header Routing Debug`
- [ ] Verify `hasUser` and `hasProfileData` are true
- [ ] Check `role` value matches `role-config.js`
- [ ] Verify permissions count > 0
- [ ] Check role name spelling (underscore vs no underscore)

---

## 12. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 13. Testing Scenarios

### Test 1: Artist Login
- ✅ Standard header
- ✅ 4 navigation items
- ✅ No admin access

### Test 2: Label Admin Login
- ✅ Standard header
- ✅ 5 navigation items (including My Artists)
- ✅ No admin access

### Test 3: Distribution Partner Login
- ✅ Admin header
- ✅ 2 navigation items only
- ✅ No other admin features

### Test 4: Super Admin Login
- ✅ Admin header
- ✅ All dropdowns visible
- ✅ Full platform access

---

## 14. Key Takeaways

1. **One Source of Truth**: `lib/role-config.js` defines all role behavior
2. **Consistent Naming**: Use `label_admin` (with underscore) as standard
3. **Permission-Based Navigation**: Navigation items only show if user has permissions
4. **Smart Dropdowns**: Automatically adapts based on item count (≤5 = standalone)
5. **Loading States**: Always show loading spinner while fetching profile data

---

**Last Updated:** October 24, 2025
**Status:** ✅ COMPLETE - All roles configured and tested

