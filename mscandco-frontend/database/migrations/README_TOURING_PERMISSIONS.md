# Touring Permissions Setup

## Overview
This migration adds comprehensive touring permissions to the platform, enabling fine-grained access control for touring administration.

## Running the Migration

1. **Connect to your Supabase database** (via SQL Editor or CLI)

2. **Run the migration SQL:**
   ```sql
   -- Run the contents of add_touring_permissions.sql
   ```

3. **Verify the permissions were created:**
   ```sql
   SELECT * FROM permissions WHERE name LIKE 'touring:%';
   ```

## Permissions Added

The following permissions are created:

### Admin Permissions
- `touring:admin:read` - Read access to touring administration
- `touring:admin:manage` - Full management access to touring administration

### Finance Permissions
- `touring:finance:read` - Read access to touring financial data
- `touring:finance:manage` - Full management access to touring finances

### Analytics Permissions
- `touring:analytics:read` - Read access to touring analytics and reports
- `touring:analytics:manage` - Full management access to touring analytics

### Tour Management Permissions
- `touring:tours:read` - Read access to tours
- `touring:tours:create` - Create new tours
- `touring:tours:update` - Update existing tours
- `touring:tours:delete` - Delete tours

### User Activity Permissions
- `touring:users:read` - Read access to touring user activity

### Statistics Permissions
- `touring:stats:read` - Read access to touring statistics

## Creating a Touring Admin Role

After running the migration, you can create a "Touring Admin" role:

1. Go to `/superadmin/permissionsroles`
2. Click "Create New Role"
3. Name: `touring_admin`
4. Description: "Manages all aspects of touring platform - tours, finance, analytics"
5. Select the following permissions:
   - `touring:admin:read`
   - `touring:admin:manage`
   - `touring:finance:read`
   - `touring:finance:manage`
   - `touring:analytics:read`
   - `touring:analytics:manage`
   - `touring:tours:read`
   - `touring:tours:create`
   - `touring:tours:update`
   - `touring:tours:delete`
   - `touring:users:read`
   - `touring:stats:read`

6. Click "Create Role"

## Assigning Touring Admin Role to Users

1. Go to `/admin/usermanagement`
2. Find the user you want to make a touring admin
3. Update their role to `touring_admin`
4. The user will now have access to `/admin/touring` and all touring features

## Notes

- `super_admin` and `company_admin` roles automatically have all touring permissions granted via the migration
- The permissions follow the pattern: `touring:resource:action:scope`
- All touring permissions are scoped to admin-level access

