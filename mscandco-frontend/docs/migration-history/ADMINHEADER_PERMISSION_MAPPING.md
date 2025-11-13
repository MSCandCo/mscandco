# AdminHeader Permission Mapping

## Complete list of permissions that control visibility in AdminHeader

---

## Navigation Dropdowns

### User & Access Dropdown

| Item | Permission | URL |
|------|-----------|-----|
| **Requests** | `analytics:requests:read` | `/admin/requests` |
| **User Management** | `users_access:user_management:read` | `/admin/usermanagement` |
| **Permissions & Roles** | `users_access:permissions_roles:read` | `/superadmin/permissionsroles` |
| **Ghost Login** | `user:impersonate` | `/superadmin/ghostlogin` |

### Analytics Dropdown

| Item | Permission | URL |
|------|-----------|-----|
| **Analytics Management** | `analytics:analytics_management:read` | `/admin/analyticsmanagement` |
| **Platform Analytics** | `analytics:platform_analytics:read` | `/admin/platformanalytics` |

### Finance Dropdown

| Item | Permission | URL |
|------|-----------|-----|
| **Earnings Management** | `finance:earnings_management:read` | `/admin/earningsmanagement` |
| **Wallet Management** | `finance:wallet_management:read` | `/admin/walletmanagement` |
| **Split Configuration** | `finance:split_configuration:read` | `/admin/splitconfiguration` |

### Content Dropdown

| Item | Permission | URL |
|------|-----------|-----|
| **Asset Library** | `content:asset_library:read` | `/admin/assetlibrary` |
| **Master Roster** | `users_access:master_roster:read` | `/admin/masterroster` |

### Distribution Dropdown

| Item | Permission | URL |
|------|-----------|-----|
| **Distribution Hub** | `distribution:read:any` | `/distribution/hub` |
| **Revenue Reporting** | `revenue:read` | `/distribution/revenue` |

---

## Right Side Icons & Actions

| Item | Permission | URL | Notes |
|------|-----------|-----|-------|
| **Notification Bell** | `notifications:read` | `/notifications` | ⚠️ **NEEDS TO BE ADDED** |
| **About** | None (always visible) | `/about` | Public page |
| **Support** | None (always visible) | `/support` | Public page |
| **Role Badge** | None (always visible) | N/A | Display only |

---

## User Dropdown (Top Right)

| Item | Permission | URL | Notes |
|------|-----------|-----|-------|
| **Dashboard** | None (always visible) | `/dashboard` | Default landing |
| **Profile** | None (always visible) | `/admin/profile` | Always accessible |
| **Platform Messages** | `platform_messages:read` | `/superadmin/messages` | Super admin messages |
| **Messages** | `messages:read` | `/admin/messages` | Standard messages |
| **Settings** | `settings:read` | `/admin/settings` | User settings |
| **Logout** | None (always visible) | `/logout` | Sign out |

---

## Summary by Permission Type

### Always Visible (No Permission Required)
- Dashboard
- Profile
- About
- Support
- Role Badge
- Logout

### User & Access Permissions
- `analytics:requests:read` → Requests
- `users_access:user_management:read` → User Management
- `users_access:permissions_roles:read` → Permissions & Roles
- `user:impersonate` → Ghost Login

### Analytics Permissions
- `analytics:analytics_management:read` → Analytics Management
- `analytics:platform_analytics:read` → Platform Analytics

### Finance Permissions
- `finance:earnings_management:read` → Earnings Management
- `finance:wallet_management:read` → Wallet Management
- `finance:split_configuration:read` → Split Configuration

### Content Permissions
- `content:asset_library:read` → Asset Library
- `users_access:master_roster:read` → Master Roster

### Distribution Permissions
- `distribution:read:any` → Distribution Hub
- `revenue:read` → Revenue Reporting

### Communication Permissions
- `platform_messages:read` → Platform Messages
- `messages:read` → Messages

### System Permissions
- `settings:read` → Settings
- `notifications:read` → Notification Bell ⚠️ **TO BE ADDED**

---

## Action Items

### ⚠️ Missing Permission Implementation

**Notification Bell Icon** currently has NO permission check. It should be controlled by:
- **Permission**: `notifications:read`
- **Current Code**: 
  ```javascript
  <Link href="/notifications" className="relative">
    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
      <Bell className="h-5 w-5" />
    </button>
  </Link>
  ```
- **Should Be**:
  ```javascript
  {(showAll || hasPermission('notifications:read')) && (
    <Link href="/notifications" className="relative">
      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
        <Bell className="h-5 w-5" />
      </button>
    </Link>
  )}
  ```

---

## Database Requirements

Ensure these permissions exist in the `permissions` table:

```sql
-- Navigation permissions
INSERT INTO permissions (name, description) VALUES
  ('analytics:requests:read', 'View requests'),
  ('users_access:user_management:read', 'View user management'),
  ('users_access:permissions_roles:read', 'View permissions and roles'),
  ('user:impersonate', 'Ghost login capability'),
  ('analytics:analytics_management:read', 'View analytics management'),
  ('analytics:platform_analytics:read', 'View platform analytics'),
  ('finance:earnings_management:read', 'View earnings management'),
  ('finance:wallet_management:read', 'View wallet management'),
  ('finance:split_configuration:read', 'View split configuration'),
  ('content:asset_library:read', 'View asset library'),
  ('users_access:master_roster:read', 'View master roster'),
  ('distribution:read:any', 'View distribution hub'),
  ('revenue:read', 'View revenue reporting'),
  ('platform_messages:read', 'View platform messages'),
  ('messages:read', 'View messages'),
  ('settings:read', 'View settings'),
  ('notifications:read', 'View notifications'); -- ⚠️ ADD THIS
```

---

## Testing Checklist

For each admin role, verify:

- [ ] Super Admin sees all items (wildcard `*:*:*`)
- [ ] Company Admin sees only permitted items
- [ ] Limited Admin sees minimal items
- [ ] Notification bell appears/disappears based on `notifications:read` permission
- [ ] User dropdown shows only permitted items
- [ ] Dynamic dropdowns work (0 items = hidden, 1 item = standalone, 2+ = dropdown)

---

## Files
- `/components/AdminHeader.js` - Main implementation
- `/hooks/usePermissions.js` - Permission checking hook
- `/lib/permissions.js` - Server-side permission fetching

