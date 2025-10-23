# User Dropdown Permissions Implementation

## Overview
The AdminHeader user dropdown now implements permission-based rendering, showing only the menu items each admin has access to.

## Always Visible Items (No Permission Required)

These items are always shown to all authenticated users:

1. **Dashboard** (`/dashboard`)
   - Default landing page
   - No permission check
   - Always visible

2. **Profile** (`/admin/profile`)
   - User profile management
   - No permission check
   - Always visible

3. **Logout**
   - Sign out functionality
   - No permission check
   - Always visible

## Permission-Controlled Items

These items only appear if the user has the required permission:

### 1. Platform Messages
- **URL**: `/superadmin/messages`
- **Permission**: `platform_messages:read`
- **Description**: System-wide administrative messages
- **Typical Users**: Super Admin, Company Admin with messaging permissions

### 2. Messages
- **URL**: `/admin/messages`
- **Permission**: `messages:read`
- **Description**: Standard user messages
- **Typical Users**: All admin roles with messaging access

### 3. Settings
- **URL**: `/admin/settings`
- **Permission**: `settings:read`
- **Description**: User and system settings
- **Typical Users**: Admins with settings management permissions

## Implementation Details

### Permission Count
```javascript
const userDropdownItems = [
  true,                                                // Profile - always visible
  showAll || hasPermission('platform_messages:read'),  // Platform Messages
  showAll || hasPermission('messages:read'),           // Messages
  showAll || hasPermission('settings:read')            // Settings
].filter(Boolean).length;
```

### Conditional Rendering
Each permission-controlled item uses this pattern:

```javascript
{(showAll || hasPermission('permission:name')) && (
  <Link href="/path" onClick={() => setIsUserDropdownOpen(false)} 
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
    <Icon className="w-4 h-4 mr-3 text-gray-400" />
    Label
  </Link>
)}
```

### Super Admin Override
The `showAll` variable is `true` for:
- Super Admin role (`super_admin`)
- Users with wildcard permission (`*:*:*`)

This ensures super admins always see all menu items.

## User Experience Examples

### Super Admin
**Sees all items:**
- Dashboard
- Profile
- Platform Messages ✅
- Messages ✅
- Settings ✅
- (separator)
- Logout

### Company Admin (Limited Permissions)
**Example: Only has `messages:read`**
- Dashboard
- Profile
- Messages ✅
- (separator)
- Logout

### Company Admin (No Extra Permissions)
**Only default items:**
- Dashboard
- Profile
- (separator)
- Logout

## Dropdown Structure

```
┌─────────────────────────────┐
│ Hi, First Name Last Name ▼  │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│ User Info Header            │
│ First Name Last Name        │
│ user@email.com              │
├─────────────────────────────┤
│ 🏠 Dashboard (always)       │
│ 👤 Profile (always)         │
│ 💬 Platform Messages (perm) │
│ 📧 Messages (perm)          │
│ ⚙️  Settings (perm)         │
├─────────────────────────────┤
│ 🚪 Logout (always)          │
└─────────────────────────────┘
```

## Testing

### Test Case 1: Super Admin
1. Log in as super admin
2. Click user dropdown
3. **Expected**: All 6 items visible (Dashboard, Profile, Platform Messages, Messages, Settings, Logout)

### Test Case 2: Limited Admin
1. Log in as company admin with only `messages:read` permission
2. Click user dropdown
3. **Expected**: 4 items visible (Dashboard, Profile, Messages, Logout)

### Test Case 3: Minimal Admin
1. Log in as admin with no extra permissions
2. Click user dropdown
3. **Expected**: 3 items visible (Dashboard, Profile, Logout)

## Console Debugging

Check the browser console for:
```
📊 User dropdown items (excluding Dashboard/Logout): 3
```

This count includes Profile + permission-controlled items.

## Database Permissions

Ensure these permissions exist in the `permissions` table:
- `platform_messages:read`
- `messages:read`
- `settings:read`

And are assigned to appropriate roles in the `role_permissions` table.

## Files Modified
- `/components/AdminHeader.js`
  - Added `userDropdownItems` count calculation
  - Added permission checks to Platform Messages, Messages, and Settings
  - Added Profile link (always visible)
  - Added console logging for user dropdown item count

## Related Documentation
- `DYNAMIC_DROPDOWN_IMPLEMENTATION.md` - Dynamic dropdown rules for navigation
- `ADMIN_HEADER_PERMISSIONS.md` - Permission mapping for all admin pages
- `PERMISSION_SUMMARY.md` - Complete permission system overview

