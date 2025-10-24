# Distribution Partner Permissions - Default Configuration

## Overview
Distribution Partners now have a **minimal, focused permission set** that only grants access to their core responsibilities:
1. **Distribution Hub** - Manage distributions
2. **Revenue Reporting** - View and create revenue reports

All unnecessary permissions have been removed.

✅ **These are now the DEFAULT permissions** for all new distribution_partner users.
✅ **Updated in main RBAC migration files** - will apply to all fresh installations.

---

## What Distribution Partners Can Access

### **Main Features (2) - Shown in Header Navigation**
1. **Distribution Hub** (`/distribution/hub`)
   - View all distributions
   - Manage distribution status
   - Approve/reject distributions
   
2. **Revenue Reporting** (`/distribution/revenue`)
   - View revenue reports
   - Create new revenue reports
   - Update existing reports

### **Basic User Features (4) - Accessible but NOT in Header Navigation**
- **Dashboard** (`/dashboard`) - Landing page, accessible via direct URL
- **Profile** (`/profile`) - Manage own profile (for audit trails)
- **Messages** (`/messages`) - View system messages
- **Settings** (`/settings`) - Manage preferences, security, notifications

**Note:** These basic features are still accessible and have permissions enabled, but they don't appear as navigation items in the header. Users can access them via:
- User dropdown menu (Profile, Messages, Settings)
- Direct URLs
- Dashboard as landing page after login

---

## What Distribution Partners CANNOT Access

❌ **User Management** - No access to user lists or role changes  
❌ **Analytics Management** - No access to analytics admin  
❌ **Platform Analytics** - No access to platform-wide analytics  
❌ **Earnings Management** - No access to earnings admin  
❌ **Wallet Management** - No access to wallet admin  
❌ **Split Configuration** - No access to split settings  
❌ **Asset Library** - No access to asset management  
❌ **Master Roster** - No access to roster management  
❌ **Requests** - No access to artist requests  
❌ **Permissions & Roles** - No access to RBAC management  
❌ **Ghost Mode** - No impersonation abilities  

---

## Header Navigation

Distribution Partners will see a **clean, focused header**:

**Left Side:**
- MSC Logo

**Center Navigation (ONLY 2 items):**
- Distribution Hub
- Revenue Reporting

**Right Side:**
- Wallet Balance (if applicable)
- User Dropdown:
  - Profile
  - Messages  
  - Settings
  - Logout

**Hidden Navigation (NOT visible to Distribution Partners):**
- ❌ User & Access dropdown
- ❌ Analytics dropdown
- ❌ Finance dropdown
- ❌ Content dropdown

**Result:** A minimal, distraction-free interface focused on their core job.

---

## Permission Count Comparison

| Role | Permission Count | Access Level |
|------|-----------------|--------------|
| Super Admin | ~95 | Full wildcard access |
| Company Admin | ~60 | Company-wide access |
| Label Admin | ~25 | Label-level access |
| **Distribution Partner** | **~20** | **Distribution-focused** |
| Artist | ~20 | Own content only |

---

## Database Migration

### For Existing Installations (Update Current Users)

Run this SQL script in Supabase SQL Editor to update existing distribution partners:

```sql
-- File: database/fix-distribution-partner-permissions.sql
```

This will:
1. ✅ Remove all existing distribution_partner permissions
2. ✅ Add only the 20 required permissions
3. ✅ Verify the changes with a permission list
4. ✅ Show permission count comparison

### For Fresh Installations (Default Permissions)

The following files have been updated with the new defaults:
- ✅ `database/migrations/create_rbac_system.sql` (main RBAC migration)
- ✅ `database/migrations/create_consolidated_permissions.sql` (consolidated permissions)

**New distribution_partner users will automatically get these permissions.**

---

## Testing

1. **Login as Distribution Partner**
2. **Verify Header Shows Only:**
   - Distribution Hub
   - Revenue Reporting
   - User dropdown (Profile, Messages, Settings)
3. **Verify Cannot Access:**
   - Any admin pages (user management, analytics, etc.)
   - Any finance pages (earnings, wallet, splits)
   - Any content pages (asset library, roster)

---

## Future Additions

If Distribution Partners need additional access in the future, add permissions for:
- `releases:read:any` - View all releases
- `analytics:read:partner` - View partner-specific analytics
- `support:create:own` - Create support tickets

---

## Notes

- This is now the **default permission set** for all distribution_partner role users
- Existing distribution partners will have their permissions updated when the SQL script runs
- No code changes needed - the AdminHeader already respects permissions
- The header will automatically hide navigation items based on these permissions

