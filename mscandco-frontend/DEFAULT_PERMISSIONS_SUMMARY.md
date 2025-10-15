# Default Role Permissions Summary

## Overview
All system roles now have proper default permissions configured in the `role_permissions` table. When you click "Reset to Default" for a role, it will restore these permissions by clearing user-specific overrides.

## How It Works

### Role Defaults
- Default permissions are stored in the `role_permissions` table
- Each role has a predefined set of permissions that users inherit
- Users can have additional permissions via the `user_permissions` table (overrides)

### Reset to Default
- Clicking "Reset to Default" **does NOT modify** the `role_permissions` table
- Instead, it clears all user-specific permission overrides in the `user_permissions` table
- This allows users to inherit the role's default permissions

### Permission Inheritance
1. System checks `user_permissions` table first (user-specific overrides)
2. If no user-specific permissions exist, inherits from `role_permissions` table
3. Combined permissions determine what the user can access

## Default Permissions by Role

### 1. Artist (8 permissions)
```
- artist:dashboard:access
- artist:release:access
- artist:analytics:access
- artist:earnings:access
- artist:roster:access
- artist:messages:access
- artist:settings:access
- artist:platform:access
```

### 2. Label Admin (9 permissions)
```
- labeladmin:dashboard:access
- labeladmin:releases:access
- labeladmin:analytics:access
- labeladmin:earnings:access
- labeladmin:roster:access
- labeladmin:artists:access
- labeladmin:messages:access
- labeladmin:settings:access
- labeladmin:profile:access
```

### 3. Super Admin (1 permission)
```
- *:*:* (wildcard - full system access)
```

### 4. Company Admin (11 permissions)
```
- users_access:user_management:read
- users_access:permissions_roles:read
- analytics:requests:read
- analytics:platform_analytics:read
- analytics:analytics_management:read
- finance:earnings_management:read
- finance:wallet_management:read
- finance:split_configuration:read
- content:asset_library:read
- content:master_roster:read
- dropdown:platform_messages:read
```

### 5. Analytics Admin (3 permissions)
```
- analytics:requests:read
- analytics:platform_analytics:read
- analytics:analytics_management:read
```

### 6. Financial Admin (3 permissions)
```
- finance:earnings_management:read
- finance:wallet_management:read
- finance:split_configuration:read
```

### 7. Content Moderator (2 permissions)
```
- content:asset_library:read
- content:master_roster:read
```

### 8. Roster Admin (1 permission)
```
- content:master_roster:read
```

### 9. Requests Admin (1 permission)
```
- analytics:requests:read
```

### 10. Marketing Admin (2 permissions)
```
- analytics:platform_analytics:read
- content:asset_library:read
```

### 11. Support Admin (3 permissions)
```
- users_access:user_management:read
- analytics:requests:read
- dropdown:platform_messages:read
```

### 12. Distribution Partner (1 permission)
```
- distribution:read:partner (⚠️ needs to be created)
```

### 13. Custom Admin (0 permissions)
```
(No default permissions - fully customizable)
```

### 14. Test Admin (0 permissions)
```
(No default permissions - for testing only)
```

## What Was Fixed

### Problem
When you clicked "Reset to Default" for company_admin, it went to 0 permissions because:
1. The API had hardcoded old/legacy permission names (V1 format)
2. These old permission names didn't exist in the database
3. The API tried to add permissions that didn't exist, resulting in 0 permissions

### Solution
1. ✅ Created proper default permissions for all 14 roles in correct V2 format
2. ✅ Populated `role_permissions` table with these defaults
3. ✅ Updated "Reset to Default" API to clear user overrides instead of manipulating role_permissions
4. ✅ Fixed all existing users to use role defaults (cleared their user-specific overrides)

## Scripts Created

### 1. `/scripts/setup-default-role-permissions.js`
**Purpose:** Setup and maintain default permissions for all roles

**What it does:**
- Clears existing role_permissions for each role
- Adds the correct default permissions to role_permissions table
- Clears user-specific permission overrides
- Can be re-run anytime to restore proper defaults

**Run it:**
```bash
node scripts/setup-default-role-permissions.js
```

## Files Modified

### 1. `/pages/api/admin/roles/[roleId]/reset-default.js`
- **Before:** Had 500+ lines of hardcoded legacy permissions
- **After:** Simplified to ~50 lines that clear user overrides
- **Benefit:** Single source of truth in database, not in code

## Testing

### To test "Reset to Default":
1. Log in as superadmin
2. Go to `/superadmin/permissionsroles`
3. Select any role (e.g., company_admin)
4. Click "Reset to Default"
5. Verify permissions are restored to the default count

### Expected Results:
- **Artist:** 8 permissions
- **Label Admin:** 9 permissions
- **Company Admin:** 11 permissions
- **Super Admin:** 1 permission (wildcard)
- **All admin roles:** 0-3 permissions each

## Maintenance

### To Change Default Permissions:
1. **Option A - Via UI:**
   - Go to Permissions & Roles page
   - Select the role
   - Add/remove permissions as needed
   - These become the new defaults for that role

2. **Option B - Via Script:**
   - Edit `/scripts/setup-default-role-permissions.js`
   - Update the `ROLE_DEFAULTS` object
   - Run: `node scripts/setup-default-role-permissions.js`

### To Add a New Role:
1. Create the role in the database
2. Add it to `ROLE_DEFAULTS` in `/scripts/setup-default-role-permissions.js`
3. Run the script to populate its default permissions

## Important Notes

⚠️ **Missing Permission:** `distribution:read:partner` needs to be created in the database
- This permission is referenced for distribution_partner role
- Until created, distribution partners will have only 1 permission instead of 2

✅ **All Users Fixed:** All 7 existing users have been reset to use their role defaults

✅ **One Source of Truth:** Default permissions are now managed in the database, not hardcoded in API files

✅ **Backward Compatible:** The system still supports user-specific permission overrides via the `user_permissions` table
