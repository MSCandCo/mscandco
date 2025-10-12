# Role Badge Mismatch Fix

## Problem
The header role badge shows a different role than what's set in the User Management dropdown.

**Example:**
- Header shows: `LABEL ADMIN`
- User Management shows: `COMPANY ADMIN`
- User: `labeladmin@mscandco.com`

## Root Cause

The role is being determined by **email-based pattern matching** instead of reading from the database.

### Issue 1: Hardcoded Email Role
In `lib/user-utils.js` line 140, there was a hardcoded rule:
```javascript
if (email === 'labeladmin@mscandco.com') return 'label_admin';
```

This overrode the actual database role, causing the mismatch.

### Issue 2: Missing User Metadata
When users log in, their `user_metadata` doesn't contain the role, so the system falls back to email pattern matching.

## Solution

### Step 1: Remove Hardcoded Email Rules ✅
**File:** `lib/user-utils.js`

Removed the hardcoded rule for `labeladmin@mscandco.com` so it uses the database role instead.

**Before:**
```javascript
if (email === 'labeladmin@mscandco.com') return 'label_admin';
```

**After:**
```javascript
// Removed hardcoded labeladmin@mscandco.com - should use database role
```

### Step 2: Sync Database Roles to User Metadata
**File:** `database/SYNC_USER_ROLES_TO_METADATA.sql`

Run this SQL script in Supabase to sync all user roles from the `users` table to `auth.users.raw_user_meta_data`:

```sql
UPDATE auth.users au
SET raw_user_meta_data = 
  COALESCE(au.raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', u.role)
FROM users u
WHERE au.id = u.id
  AND u.role IS NOT NULL
  AND (au.raw_user_meta_data->>'role' IS NULL OR au.raw_user_meta_data->>'role' != u.role);
```

### Step 3: Simplified Role Badge Display ✅
**File:** `components/auth/RoleBasedNavigation.js`

The role badge now simply displays whatever role is in the user data:
```javascript
{userRole ? userRole.replace('_', ' ').toUpperCase() : 'USER'}
```

## How Role Resolution Works Now

The `getUserRoleSync` function checks in this order:

1. **JWT Token** (fastest)
2. **Cache** (previously fetched)
3. **User Metadata** (`user.user_metadata.role`) ← **THIS IS THE FIX**
4. **App Metadata** (`user.app_metadata.role`)
5. **Email Pattern Matching** (fallback only)

After running the SQL script, the role will be in `user_metadata` (step 3), so email pattern matching won't be needed.

## Testing Instructions

1. **Run the SQL script** in Supabase SQL Editor:
   ```
   database/SYNC_USER_ROLES_TO_METADATA.sql
   ```

2. **Log out** all test users

3. **Log back in** - the role metadata will now be in their session

4. **Verify:**
   - Header badge matches User Management dropdown
   - Changing role in User Management updates the header badge after re-login

## Expected Behavior

**For `labeladmin@mscandco.com`:**
- If database role is `company_admin` → Header shows `COMPANY ADMIN`
- If you change to `label_admin` → Header shows `LABEL ADMIN` (after logout/login)

**For all users:**
- Header badge = User Management dropdown role
- No hardcoded overrides
- Role comes from database only

## Files Modified

1. ✅ `lib/user-utils.js` - Removed hardcoded email role for labeladmin
2. ✅ `components/auth/RoleBasedNavigation.js` - Simplified role badge display
3. ✅ `database/SYNC_USER_ROLES_TO_METADATA.sql` - SQL to sync roles to metadata

## Prevention

**Going forward:**
- Don't add specific email → role mappings in `lib/user-utils.js`
- All role assignments should be done through User Management
- Run the sync SQL script after bulk role changes

## Status
✅ **Code Fixed** - Hardcoded role removed
⚠️ **Database Update Required** - Run `SYNC_USER_ROLES_TO_METADATA.sql`

## Date
October 11, 2025

