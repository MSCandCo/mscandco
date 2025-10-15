# Permission System Fix: Adding Permission Denial Mechanism

## Problem Identified

The comprehensive permission toggle tests (V2) revealed a critical issue:

**All 27 non-skipped tests failed with the same pattern:**
```
Steps:
  - ✅ Disable permission via API (successfully writes to user_permissions table)
  - ✅ User login (user logs in successfully)
  - ❌ Verify permission denied (granted) ← USER CAN STILL ACCESS THE PAGE!
  - ✅ Enable permission via API
  - ✅ User login (enabled)
  - ✅ Verify permission granted (granted)
```

### Root Cause

The permission system was **additive only**:

1. **Role Permissions**: User gets permissions from their role via `role_permissions` table
2. **User Permissions**: Extra permissions can be added to individual users via `user_permissions` table
3. **Combination**: `getUserPermissions()` returns `role_permissions` + `user_permissions`

**The Issue**: There was NO mechanism to **revoke/deny** a permission that comes from a role!

When the toggle API "disabled" a permission:
- It deleted the entry from `user_permissions` table
- But the user STILL had that permission from their role's `role_permissions`
- Result: Permission was not actually revoked

## Solution: Permission Denial Mechanism

### Database Changes

Added a `denied` boolean column to the `user_permissions` table:

```sql
ALTER TABLE user_permissions
ADD COLUMN IF NOT EXISTS denied BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN user_permissions.denied IS 'When true, this permission is explicitly denied for the user, even if granted by their role';

CREATE INDEX IF NOT EXISTS idx_user_permissions_denied
ON user_permissions(user_id, denied);
```

### How It Works

The `user_permissions` table now supports three states:

1. **Not in table**: User inherits permission from role (if role has it)
2. **In table with `denied = false`**: User is explicitly granted permission (adds to role permissions)
3. **In table with `denied = true`**: User is explicitly denied permission (OVERRIDES role permissions)

### Code Changes

#### 1. Updated `/lib/permissions.js` - `getUserPermissions()` function

**Before**: Combined role + user permissions

**After**:
- Separates denied permissions from granted permissions
- Filters out denied permissions from the final result
- **Result**: Denied permissions override role permissions

```javascript
// Get user-specific permissions (both granted and denied)
const { data: userPermissions } = await supabase
  .from('user_permissions')
  .select(`
    denied,
    permissions (name, description)
  `)
  .eq('user_id', userId);

// Separate denied from granted
const deniedPermissionNames = (userPermissions || [])
  .filter(up => up.denied === true)
  .map(up => up.permissions.name);

const grantedUserPermissions = (userPermissions || [])
  .filter(up => up.denied === false)
  .map(up => ({
    permission_name: up.permissions.name,
    description: up.permissions.description
  }));

// Combine role + granted user permissions
const allPermissions = [
  ...rolePermissions,
  ...grantedUserPermissions
];

// Remove duplicates and filter out denied permissions
let uniquePermissions = removeDuplicates(allPermissions);
uniquePermissions = uniquePermissions.filter(p =>
  !deniedPermissionNames.includes(p.permission_name)
);
```

#### 2. Updated `/pages/api/admin/users/[userId]/toggle-permission.js`

**Before**:
- `enable = false`: DELETE from user_permissions (but user kept permission from role!)
- `enable = true`: INSERT into user_permissions

**After**:
- `enable = false`: INSERT/UPDATE with `denied = true` (creates explicit denial)
- `enable = true`: INSERT/UPDATE with `denied = false` (grants or removes denial)

```javascript
if (enable === false) {
  // Insert or update with denied = true
  await supabase.from('user_permissions').upsert({
    user_id: userId,
    permission_id: permission.id,
    denied: true
  });
} else {
  // Insert or update with denied = false
  await supabase.from('user_permissions').upsert({
    user_id: userId,
    permission_id: permission.id,
    denied: false
  });
}
```

## Testing Impact

### Previous Results (BEFORE FIX)
- **Total Tests**: 65
- **Passed**: 0 ✅
- **Failed**: 27 ❌
- **Skipped**: 38 ⚠️
- **Success Rate**: 0.0%

### Expected Results (AFTER FIX + MIGRATION)
- All 27 failed tests should now pass
- System can now properly revoke role-based permissions for individual users
- Permission toggle functionality works as expected

## Deployment Steps

### Step 1: Apply Database Migration

**REQUIRED**: Run the following SQL in Supabase SQL Editor:

```sql
-- Add 'denied' column to user_permissions table
ALTER TABLE user_permissions
ADD COLUMN IF NOT EXISTS denied BOOLEAN NOT NULL DEFAULT false;

-- Add comment explaining the column
COMMENT ON COLUMN user_permissions.denied IS 'When true, this permission is explicitly denied for the user, even if granted by their role';

-- Create index for faster queries filtering out denied permissions
CREATE INDEX IF NOT EXISTS idx_user_permissions_denied
ON user_permissions(user_id, denied);

-- Update existing records to explicitly set denied = false
UPDATE user_permissions SET denied = false WHERE denied IS NULL;
```

**Supabase SQL Editor URL**: https://supabase.com/dashboard/project/vzyhwmvmkkmhyxjmmlnf/sql/new

### Step 2: Code is Already Updated

The following files have been updated and are ready:
- ✅ `/lib/permissions.js` - Handles denial filtering
- ✅ `/pages/api/admin/users/[userId]/toggle-permission.js` - Uses denial mechanism
- ✅ `/database/migrations/add_permission_denial_mechanism.sql` - Migration file

### Step 3: Re-run Tests

After applying the migration, re-run the comprehensive permission tests:

```bash
cd "/Users/htay/Documents/MSC & Co/mscandco-frontend"
node test-all-permissions-playwright-v2.js
```

Expected: All 27 previously failed tests should now pass!

## Benefits

1. **Proper Permission Override**: Super admins can now revoke specific permissions from users, even if their role grants those permissions
2. **Fine-Grained Control**: Allows exceptions to role-based permissions without changing roles
3. **Audit Trail**: The `user_permissions` table maintains a record of both grants and denials
4. **Backward Compatible**: Existing records with `denied = false` work exactly as before

## Use Cases

### Example 1: Temporarily Restrict Access
```
User: info@htay.co.uk (role: artist)
Role grants: releases:access, analytics:artist_analytics:read, etc.
Admin action: Disable "analytics:artist_analytics:read" for this specific user
Result: User can still access releases but NOT analytics
Database: INSERT INTO user_permissions (user_id, permission_id, denied) VALUES (..., TRUE)
```

### Example 2: Grant Extra Permission
```
User: companyadmin@mscandco.com (role: company_admin)
Role does NOT grant: admin:ghost_login:access (super admin only)
Admin action: Enable "admin:ghost_login:access" for this specific user
Result: User gains ghost login access despite role not having it
Database: INSERT INTO user_permissions (user_id, permission_id, denied) VALUES (..., FALSE)
```

### Example 3: Re-enable After Denial
```
User had permission denied, now we want to restore it
Admin action: Enable the permission again
Result: denied = TRUE changes to denied = FALSE
Database: UPDATE user_permissions SET denied = FALSE WHERE ...
```

## Files Changed

1. **Database Migration**: `database/migrations/add_permission_denial_mechanism.sql`
2. **Permission Library**: `lib/permissions.js:73-121`
3. **Toggle API**: `pages/api/admin/users/[userId]/toggle-permission.js:40-154`
4. **Documentation**: This file + `APPLY_MIGRATION_MANUAL.md`

## Next Steps

1. ✅ Database migration SQL created
2. ✅ Code updated to use denial mechanism
3. ⏳ **YOU**: Apply the migration in Supabase SQL Editor
4. ⏳ **THEN**: Re-run tests to verify all 27 failed tests now pass
5. ⏳ Clean up test scripts and temporary files if tests pass

---

**Summary**: The permission system now supports denying role-based permissions for individual users by using a `denied` boolean flag in the `user_permissions` table, fixing the critical issue where users could bypass permission toggles through their role permissions.
