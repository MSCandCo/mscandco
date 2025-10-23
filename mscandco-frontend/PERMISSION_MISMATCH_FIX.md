# Permission Mismatch - Company Admin Header Issue

## Problem
Company Admin header is blank because the permission names in the AdminHeader don't match the actual permissions in the database.

## Current Mismatch

### AdminHeader Checks vs Database Permissions

| Page | AdminHeader Checks | Database Has (company_admin) | Match? |
|------|-------------------|------------------------------|--------|
| **Requests** | `requests:read` | `analytics:requests:read` | ❌ NO |
| **User Management** | `user:read:any` | `users_access:user_management:read` | ❌ NO |
| **Permissions & Roles** | `role:read:any` | `users_access:permissions_roles:read` | ❌ NO |
| **Ghost Login** | `user:impersonate` | ❌ NOT IN DB | ❌ NO |
| **Analytics Management** | `analytics:read:any` | `analytics:analytics_management:read` | ❌ NO |
| **Platform Analytics** | `analytics:read:any` | `analytics:platform_analytics:read` | ❌ NO |
| **Earnings Management** | `earnings:read:any` | `finance:earnings_management:read` | ❌ NO |
| **Wallet Management** | `wallet:view:any` | `finance:wallet_management:read` | ❌ NO |
| **Split Configuration** | `splits:read` | `finance:split_configuration:read` | ❌ NO |
| **Asset Library** | `content:read:any` | `content:asset_library:read` | ❌ NO |
| **Master Roster** | `roster:view:any` | `content:master_roster:read` | ❌ NO |
| **Distribution Hub** | `distribution:read:any` | ❌ NOT IN DB | ❌ NO |
| **Revenue Reporting** | `revenue:read` | ❌ NOT IN DB | ❌ NO |

## Solution Options

### Option 1: Update AdminHeader to use Database Permission Names (RECOMMENDED)
Update the AdminHeader to check for the actual permissions that exist in the database.

### Option 2: Update Database Permissions
Change all database permissions to match what AdminHeader expects (more disruptive).

## Recommended Fix: Update AdminHeader

```javascript
// OLD (doesn't work)
hasPermission('requests:read')
hasPermission('user:read:any')
hasPermission('analytics:read:any')

// NEW (will work)
hasPermission('analytics:requests:read')
hasPermission('users_access:user_management:read')
hasPermission('analytics:analytics_management:read') || hasPermission('analytics:platform_analytics:read')
```

## Action Required
Update AdminHeader.js to use the correct permission names from the database.

