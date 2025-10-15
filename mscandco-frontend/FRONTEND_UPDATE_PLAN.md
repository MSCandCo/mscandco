# Frontend Code Update Plan

## Files to Update

### 1. Page-Level Permission Checks (Change to Universal)

**Artist Pages:**
- `pages/artist/analytics.js:29` - `artist:analytics:access` → `analytics:access`
- `pages/artist/earnings.js:103` - `artist:earnings:access` → `earnings:access`
- `pages/artist/roster.js:41` - `artist:roster:access` → `roster:access`
- `pages/artist/releases.js:58` - `artist:release:access` → `releases:access`
- `pages/artist/settings.js` - `artist:settings:access` → `settings:access`
- `pages/artist/messages.js:22` - `artist:messages:access` → `messages:access`

**Label Admin Pages:**
- `pages/labeladmin/analytics.js:29` - `labeladmin:analytics:access` → `analytics:access`
- `pages/labeladmin/earnings.js:160` - `labeladmin:earnings:access` → `earnings:access`
- `pages/labeladmin/roster.js:20` - `labeladmin:roster:access` → `roster:access`
- `pages/labeladmin/releases.js:61` - `labeladmin:releases:access` → `releases:access`
- `pages/labeladmin/settings.js` - `labeladmin:settings:access` → `settings:access`
- `pages/labeladmin/messages.js` - `labeladmin:messages:access` → `messages:access`
- `pages/labeladmin/profile/index.js:42` - `labeladmin:profile:access` → `profile:access`

**Admin Pages:**
- `pages/admin/profile/index.js:44` - `profile:view:own + profile:edit:own` → `profile:access`

### 2. Message Tab Permissions (Add Granular Checks)

**Artist Messages** (`pages/artist/messages.js`):
- Line 243: Filter tabs array - check `messages:invitations:view`, `messages:earnings:view`, `messages:payouts:view`
- Hide tabs if user doesn't have permission

**Label Admin Messages** (`pages/labeladmin/messages.js`):
- Filter tabs array - check `messages:invitation_responses:view`, `messages:earnings:view`, `messages:payouts:view`
- Hide tabs if user doesn't have permission

**Admin Messages** (`pages/admin/messages.js`):
- Filter tabs array - check `messages:system:view`, `messages:releases:view`, `messages:earnings:view`, `messages:payouts:view`
- Hide tabs if user doesn't have permission

**Super Admin Messages** (`pages/superadmin/messages.js`):
- Use `messages:all:view` permission (or keep as-is since superadmin has *:*:*)

### 3. Settings Tab Permissions (Add Granular Checks)

**All Settings Pages** (artist, labeladmin, admin, distributionpartner):
- Check permissions for each tab:
  - `settings:preferences:edit` - Preferences tab
  - `settings:security:edit` - Security tab
  - `settings:notifications:edit` - Notifications tab
  - `settings:billing:view` - Billing tab (view)
  - `settings:billing:edit` - Billing tab (edit)
  - `settings:api_keys:view` - API Keys tab (view)
  - `settings:api_keys:manage` - API Keys tab (manage)
- Hide tabs if user doesn't have permission
- Disable edit buttons if user only has :view permission

### 4. Analytics Tab Permissions (Add Granular Checks)

**Artist Analytics** (`pages/artist/analytics.js`):
- Line 63-85: Tab buttons
- Check `analytics:basic:view` for Basic tab
- Check `analytics:advanced:view` for Advanced tab
- Hide tabs if user doesn't have permission

**Label Admin Analytics** (`pages/labeladmin/analytics.js`):
- Same as artist

### 5. Navigation (Already Updated ✅)

`components/auth/PermissionBasedNavigation.js` - Already updated to use universal permissions

## Implementation Order

1. ✅ Update PermissionBasedNavigation.js (DONE)
2. Update page-level permission checks (artist pages)
3. Update page-level permission checks (labeladmin pages)
4. Update page-level permission checks (admin pages)
5. Add granular message tab permissions
6. Add granular settings tab permissions
7. Add granular analytics tab permissions
8. Test everything

## Testing Checklist

- [ ] Artist can access all pages with universal permissions
- [ ] Label Admin can access all pages with universal permissions
- [ ] Distribution Partner sees correct navigation
- [ ] Message tabs show/hide based on permissions
- [ ] Settings tabs show/hide based on permissions
- [ ] Analytics tabs show/hide based on permissions
- [ ] Permission toggles in admin panel work correctly
- [ ] Navigation updates when permissions change

