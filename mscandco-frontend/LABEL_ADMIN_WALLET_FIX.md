# Label Admin Wallet 403 Error - Fixed

## Problem
Label admin users were getting "Wallet API error: 403" when trying to access the dashboard, preventing them from logging in successfully.

## Root Cause
**Permission name mismatch** between the API endpoint and the RBAC roles configuration:

- **API was checking for**: `earnings:read:own`
- **RBAC roles.js defined**: `earnings:view:own`

The `requirePermission` middleware in `/pages/api/labeladmin/wallet-simple.js` was checking for a permission that didn't exist in the roles configuration, causing all label admin users to be denied access.

## Solution

### Files Fixed

1. **`pages/api/labeladmin/wallet-simple.js`** (Line 77)
   - Changed: `requirePermission('earnings:read:own')`
   - To: `requirePermission('earnings:view:own')`

2. **`pages/api/wallet/balance.js`** (Line 75)
   - Changed: `requirePermission('earnings:read:own')`
   - To: `requirePermission('earnings:view:own')`

### Verification

The `lib/rbac/roles.js` file correctly defines (line 58):
```javascript
'earnings:view:own': [ROLES.ARTIST, ROLES.LABEL_ADMIN, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN]
```

This means:
- ✅ Artists can view their own earnings
- ✅ Label Admins can view their own earnings
- ✅ Company Admins can view their own earnings
- ✅ Super Admins can view their own earnings

## Testing

After the fix, label admin users should be able to:
1. Log in successfully
2. See their wallet balance in the header
3. Access the dashboard without 403 errors
4. View their earnings data

**Test with:**
- Email: `labeladmin@test.com` or any label admin account
- The wallet API should return 200 instead of 403

## Related Files

- `lib/rbac/roles.js` - Defines all role permissions
- `lib/rbac/middleware.js` - Validates permissions on API routes
- `hooks/useWalletBalance.js` - Client-side wallet balance hook
- `database/FIX_LABEL_ADMIN_PERMISSIONS.sql` - SQL script to verify database permissions (if needed)

## Prevention

**Going forward:**
- Always use `earnings:view:own` not `earnings:read:own`
- Check `lib/rbac/roles.js` for the correct permission names
- Use consistent naming: `view`, `create`, `update`, `delete` (not `read`, `write`, etc.)

## Status
✅ **FIXED** - Label admin wallet access now works correctly with proper permission checking.

## Date
October 11, 2025

