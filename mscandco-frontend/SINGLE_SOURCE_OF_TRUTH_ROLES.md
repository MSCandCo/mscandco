# Single Source of Truth for Role Configuration

## Problem We Solved

### **Before:**
- Role lists hardcoded in multiple files
- Different files had different role definitions
- Adding/removing roles required updating multiple locations
- Caused bugs like blank headers for label_admin
- No consistency across the codebase

### **After:**
✅ **One file defines all role behavior**  
✅ **All components import from the same source**  
✅ **Changes in one place affect everywhere**  
✅ **No more inconsistencies**

---

## The Solution: `lib/role-config.js`

This file is the **SINGLE SOURCE OF TRUTH** for all role-based behavior.

### **What It Defines:**

1. **Platform Admin Roles** - Use AdminHeader
   - super_admin
   - company_admin
   - analytics_admin
   - distribution_partner
   - requests_admin

2. **Content Creator Roles** - Use Standard Header
   - artist
   - label_admin

3. **Helper Functions:**
   - `isPlatformAdmin(role)` - Check if role is a platform admin
   - `isContentCreator(role)` - Check if role is a content creator
   - `getHeaderType(role)` - Get appropriate header type
   - `getRoleDisplayName(role)` - Get formatted display name

---

## How It Works

### **1. Define Roles Once**
```javascript
// lib/role-config.js
export const PLATFORM_ADMIN_ROLES = [
  'super_admin',
  'company_admin',
  'analytics_admin',
  'distribution_partner',
  'requests_admin'
];

export const CONTENT_CREATOR_ROLES = [
  'artist',
  'label_admin'
];
```

### **2. Import Everywhere**
```javascript
// components/header.js
import { isPlatformAdmin } from '@/lib/role-config';

if (user && isPlatformAdmin(profileData?.role)) {
  return <AdminHeader largeLogo={largeLogo} />;
}
```

```javascript
// components/AdminHeader.js
import { isPlatformAdmin, isContentCreator } from '@/lib/role-config';

// Safety check
if (user && isContentCreator(currentRole)) {
  console.warn('Content creator should not use AdminHeader');
  return null;
}
```

### **3. Add New Role? One Place!**
```javascript
// lib/role-config.js
export const PLATFORM_ADMIN_ROLES = [
  'super_admin',
  'company_admin',
  'analytics_admin',
  'distribution_partner',
  'requests_admin',
  'new_admin_role'  // ← Add here, works everywhere!
];
```

---

## Files Modified

### **1. Created:**
- ✅ `lib/role-config.js` - Single source of truth

### **2. Updated:**
- ✅ `components/header.js` - Uses `isPlatformAdmin()`
- ✅ `components/AdminHeader.js` - Uses `isContentCreator()` for safety check

---

## Safety Mechanisms

### **1. Header.js**
```javascript
// Routes to correct header based on role
if (user && isPlatformAdmin(profileData?.role)) {
  return <AdminHeader />;  // Platform admins
}
return <StandardHeader />;  // Content creators
```

### **2. AdminHeader.js**
```javascript
// Safety check: Prevents blank headers
if (user && isContentCreator(currentRole)) {
  console.warn('Content creator should not use AdminHeader');
  return null;  // Don't render, let Header.js handle it
}
```

**Result:** Even if a content creator somehow reaches AdminHeader, it returns `null` instead of showing a blank header.

---

## Role Definitions

### **Platform Admins** (Use AdminHeader)

| Role | Description | Access |
|------|-------------|--------|
| `super_admin` | Full platform access | Everything |
| `company_admin` | Company-wide management | Most admin features |
| `analytics_admin` | Analytics management | Analytics tools only |
| `distribution_partner` | Distribution management | Distribution Hub, Revenue Reporting |
| `requests_admin` | Request management | Artist requests only |

### **Content Creators** (Use Standard Header)

| Role | Description | Access |
|------|-------------|--------|
| `artist` | Individual artist | Own content (4 pages) |
| `label_admin` | Label manager | Multiple artists (5 pages) |

---

## Adding a New Role

### **Step 1: Add to role-config.js**
```javascript
export const PLATFORM_ADMIN_ROLES = [
  'super_admin',
  'company_admin',
  'analytics_admin',
  'distribution_partner',
  'requests_admin',
  'new_role'  // ← Add here
];

export const ROLE_DISPLAY_NAMES = {
  // ... existing roles
  'new_role': 'New Role Display Name'  // ← Add display name
};
```

### **Step 2: That's it!**
✅ Header routing works automatically  
✅ Safety checks work automatically  
✅ Display names work automatically  

### **Step 3: Add permissions in database**
```sql
-- Add role to database
INSERT INTO roles (name, description) VALUES
('new_role', 'Description of new role');

-- Add permissions for the role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'new_role' AND p.name IN (...);
```

---

## Benefits

### **1. Consistency**
✅ All files use the same role definitions  
✅ No more "works in one place but not another"  

### **2. Maintainability**
✅ Change once, applies everywhere  
✅ Easy to add/remove roles  

### **3. Debugging**
✅ Console warnings when roles are misrouted  
✅ Safety checks prevent blank headers  

### **4. Documentation**
✅ One file to see all roles  
✅ Clear separation of admin vs content creator  

---

## Testing

### **Test 1: Artist**
- Login as artist
- Expected: Standard header with 4 items
- ✅ Should NOT see AdminHeader

### **Test 2: Label Admin**
- Login as label_admin
- Expected: Standard header with 5 items
- ✅ Should NOT see AdminHeader
- ✅ Should NOT see blank header

### **Test 3: Distribution Partner**
- Login as distribution_partner
- Expected: AdminHeader with 2 items (Distribution Hub, Revenue Reporting)
- ✅ Should NOT see standard header

### **Test 4: Super Admin**
- Login as super_admin
- Expected: AdminHeader with all dropdowns
- ✅ Should NOT see standard header

---

## Console Warnings

If you see this warning:
```
⚠️ AdminHeader: Content creator role "label_admin" should not use AdminHeader. Redirecting...
```

**This means:**
- A content creator (artist/label_admin) was routed to AdminHeader
- The safety check caught it
- AdminHeader returned `null` to prevent blank header
- Header.js will render the standard header instead

**Action:** This is working as intended! The safety check is protecting against misrouting.

---

## Future Enhancements

### **Potential Additions:**
1. **Role permissions mapping** - Define default permissions per role
2. **Role hierarchy** - Define which roles can manage which other roles
3. **Role-based routing** - Auto-redirect based on role
4. **Role validation** - Validate role strings against allowed roles

---

**Status:** ✅ COMPLETE - Single source of truth implemented for role-based header routing with safety checks.

