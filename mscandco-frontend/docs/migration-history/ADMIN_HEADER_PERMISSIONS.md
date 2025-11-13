# Admin Header - Complete Permission Map

## Navigation Permissions

### User & Access Dropdown
| Page | Permission Required | Notes |
|------|-------------------|-------|
| **Requests** | `requests:read` | View and manage user requests |
| **User Management** | `user:read:any` | View and manage all users |
| **Permissions & Roles** | `role:read:any` | Manage roles and permissions |
| **Ghost Login** | `user:impersonate` | Impersonate other users |

### Analytics Dropdown
| Page | Permission Required | Notes |
|------|-------------------|-------|
| **Analytics Management** | `analytics:read:any` | Manage analytics for all users |
| **Platform Analytics** | `analytics:read:any` | View platform-wide analytics |

### Finance Dropdown
| Page | Permission Required | Notes |
|------|-------------------|-------|
| **Earnings Management** | `earnings:read:any` | Manage earnings for all users |
| **Wallet Management** | `wallet:view:any` | View and manage all wallets |
| **Split Configuration** | `splits:read` | Configure revenue splits |

### Content Dropdown
| Page | Permission Required | Notes |
|------|-------------------|-------|
| **Asset Library** | `content:read:any` | Manage platform content/assets |
| **Master Roster** | `roster:view:any` | View complete artist roster |

### Distribution Dropdown
| Page | Permission Required | Notes |
|------|-------------------|-------|
| **Distribution Hub** | `distribution:read:any` | Manage music distribution |
| **Revenue Reporting** | `revenue:read` | View revenue reports |

---

## Always Visible (No Permission Required)

### Top Navigation
- **Notification Bell** - Always visible for authenticated users
- **About** - Always visible (public page)
- **Support** - Always visible (public page)
- **Role Badge** - Always visible for authenticated users

### Unauthenticated Pages
- **Pricing** - Public page
- **Login** - Public page
- **Register** - Public page

### User Dropdown (Authenticated Users Only)
- **Dashboard** - Always visible for authenticated users
- **Logout** - Always visible for authenticated users

### User Dropdown (Permission Controlled)
| Page | Permission Required | Notes |
|------|-------------------|-------|
| **Profile** | None currently | Should add `profile:read:own` |
| **Platform Messages** | None currently | Should add `messages:platform:read` |
| **Messages** | None currently | Should add `messages:read:own` |
| **Settings** | None currently | Should add `settings:read:own` |

---

## Super Admin Override

**Super Admin** (`role === 'super_admin'`) or users with wildcard permission (`*:*:*`) will see ALL pages regardless of individual permissions.

---

## Testing Permissions

To test if a specific permission shows a page:

1. **Create a test user** with specific role
2. **Assign permission** via Supabase or admin panel
3. **Login as test user**
4. **Verify page appears** in header dropdown

### Example: Show only "Requests" page

```sql
-- In Supabase, add permission to user
INSERT INTO user_permissions (user_id, permission_key, granted_by_id)
VALUES 
  ('user-uuid-here', 'requests:read', 'admin-uuid-here');
```

User will see:
- ✅ User & Access dropdown (because it has 1 item)
- ✅ Requests page inside dropdown
- ❌ All other admin pages (no permission)

---

## Dropdown Visibility Rules (NEW)

1. **Empty Dropdown** → Don't show dropdown at all
2. **1 Item in Dropdown** → Show as standalone link (no dropdown)
3. **2-4 Items** → Show as dropdown
4. **5+ Items** → Show as dropdown

This ensures clean navigation that adapts to user permissions.

