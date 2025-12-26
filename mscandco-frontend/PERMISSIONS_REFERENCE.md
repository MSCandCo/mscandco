# Permissions Reference Guide

Complete reference of all permissions in the MSC & Co platform, organized by resource and CRUD operations (Create, Read, Update, Delete).

## Permission Format

Permissions follow the pattern: `resource:action:scope`

- **Resource**: The feature/area (e.g., `user`, `release`, `earnings`)
- **Action**: The operation (e.g., `read`, `create`, `update`, `delete`, `manage`)
- **Scope**: Access level (e.g., `own`, `label`, `partner`, `any`, `admin`, `universal`)

---

## Special Permissions

| Permission | Description |
|------------|-------------|
| `*:*:*` | **Super Admin Wildcard** - Full access to everything in the system. Grants all permissions automatically. Only assigned to super_admin role. |

---

## User Management Permissions

Control access to user accounts and profiles.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `user:read:own` | **Read** | View own user profile |
| `user:read:label` | **Read** | View users in own label |
| `user:read:partner` | **Read** | View users in own partner network |
| `user:read:any` | **Read** | View any user in the system |
| `user:create:label` | **Create** | Create users in own label |
| `user:create:partner` | **Create** | Create users in own partner network |
| `user:create:any` | **Create** | Create any user |
| `user:update:own` | **Update** | Update own profile |
| `user:update:label` | **Update** | Update users in own label |
| `user:update:partner` | **Update** | Update users in own partner network |
| `user:update:any` | **Update** | Update any user |
| `user:delete:label` | **Delete** | Delete users in own label |
| `user:delete:partner` | **Delete** | Delete users in own partner network |
| `user:delete:any` | **Delete** | Delete any user |
| `user:suspend:any` | **Update** | Suspend/unsuspend users |
| `user:impersonate:any` | **Read** | Impersonate users (Ghost Mode) |

---

## User & Access Management (Admin Portal)

Permissions for admin pages related to user management and access control.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `users_access:user_management:read` | **Read** | View User Management page (`/admin/usermanagement`) |
| `users_access:user_management:create` | **Create** | Create users in User Management |
| `users_access:user_management:update` | **Update** | Update users in User Management |
| `users_access:user_management:delete` | **Delete** | Delete users in User Management |
| `users_access:permissions_roles:read` | **Read** | View Permissions & Roles page (`/superadmin/permissionsroles`) |
| `users_access:permissions_roles:create` | **Create** | Create permissions/roles |
| `users_access:permissions_roles:update` | **Update** | Update permissions/roles |
| `users_access:permissions_roles:delete` | **Delete** | Delete permissions/roles |
| `users_access:master_roster:read` | **Read** | View Master Roster page (`/admin/masterroster`) |
| `users_access:master_roster:create` | **Create** | Add artists to master roster |
| `users_access:master_roster:update` | **Update** | Update master roster entries |
| `users_access:master_roster:delete` | **Delete** | Remove artists from master roster |

---

## Release Management Permissions

Control access to music releases and distribution.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `release:read:own` | **Read** | View own releases |
| `release:read:label` | **Read** | View releases in own label |
| `release:read:partner` | **Read** | View releases in partner network |
| `release:read:any` | **Read** | View any release |
| `release:create:own` | **Create** | Create own releases |
| `release:create:label` | **Create** | Create releases for label artists |
| `release:create:partner` | **Create** | Create releases for partner artists |
| `release:update:own` | **Update** | Update own releases |
| `release:update:label` | **Update** | Update releases in own label |
| `release:update:partner` | **Update** | Update releases in partner network |
| `release:update:any` | **Update** | Update any release |
| `release:delete:own` | **Delete** | Delete own releases |
| `release:delete:label` | **Delete** | Delete releases in own label |
| `release:delete:partner` | **Delete** | Delete releases in partner network |
| `release:delete:any` | **Delete** | Delete any release |
| `release:approve:label` | **Update** | Approve releases for label |
| `release:approve:partner` | **Update** | Approve releases for partner |
| `release:approve:any` | **Update** | Approve any release |
| `release:distribute:any` | **Update** | Distribute releases to platforms |
| `release:reject:any` | **Update** | Reject releases |
| `release:takedown:any` | **Delete** | Takedown releases from platforms |

---

## Earnings Management Permissions

Control access to earnings data and financial information.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `earnings:read:own` | **Read** | View own earnings |
| `earnings:read:label` | **Read** | View label earnings |
| `earnings:read:partner` | **Read** | View partner earnings |
| `earnings:read:any` | **Read** | View all earnings |
| `earnings:export:own` | **Read** | Export own earnings data |
| `earnings:export:label` | **Read** | Export label earnings data |
| `earnings:export:partner` | **Read** | Export partner earnings data |
| `earnings:export:any` | **Read** | Export any earnings data |
| `earnings:update:any` | **Update** | Update earnings records |
| `earnings:distribute:any` | **Update** | Distribute earnings to users |
| `earnings:calculate:any` | **Update** | Calculate and process earnings |

---

## Finance Management (Admin Portal)

Permissions for admin finance management pages.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `finance:earnings_management:read` | **Read** | View Earnings Management page (`/admin/earningsmanagement`) |
| `finance:earnings_management:create` | **Create** | Create earnings entries |
| `finance:earnings_management:update` | **Update** | Update earnings entries |
| `finance:earnings_management:delete` | **Delete** | Delete earnings entries |
| `finance:wallet_management:read` | **Read** | View Wallet Management page (`/admin/walletmanagement`) |
| `finance:wallet_management:create` | **Create** | Create wallet entries |
| `finance:wallet_management:update` | **Update** | Update wallet entries |
| `finance:wallet_management:delete` | **Delete** | Delete wallet entries |
| `finance:split_configuration:read` | **Read** | View Split Configuration page (`/admin/splitconfiguration`) |
| `finance:split_configuration:create` | **Create** | Create split configurations |
| `finance:split_configuration:update` | **Update** | Update split configurations |
| `finance:split_configuration:delete` | **Delete** | Delete split configurations |

---

## Payout Management Permissions

Control access to payout requests and processing.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `payout:read:own` | **Read** | View own payout requests |
| `payout:read:label` | **Read** | View label payout requests |
| `payout:read:partner` | **Read** | View partner payout requests |
| `payout:read:any` | **Read** | View all payout requests |
| `payout:create:own` | **Create** | Create own payout requests |
| `payout:approve:label` | **Update** | Approve label payout requests |
| `payout:approve:partner` | **Update** | Approve partner payout requests |
| `payout:approve:any` | **Update** | Approve any payout request |
| `payout:reject:any` | **Update** | Reject payout requests |
| `payout:process:any` | **Update** | Process approved payouts |
| `payout:cancel:any` | **Update** | Cancel payout requests |

---

## Split Agreement Management Permissions

Control access to revenue split agreements.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `split:read:own` | **Read** | View own split agreements |
| `split:read:label` | **Read** | View label split agreements |
| `split:read:partner` | **Read** | View partner split agreements |
| `split:read:any` | **Read** | View all split agreements |
| `split:create:own` | **Create** | Create own split agreements |
| `split:create:label` | **Create** | Create split agreements for label |
| `split:create:partner` | **Create** | Create split agreements for partner |
| `split:update:own` | **Update** | Update own split agreements |
| `split:update:label` | **Update** | Update label split agreements |
| `split:delete:own` | **Delete** | Delete own split agreements |
| `split:delete:label` | **Delete** | Delete label split agreements |
| `split:approve:any` | **Update** | Approve split agreements |
| `split:accept:own` | **Update** | Accept split agreements |
| `split:decline:own` | **Update** | Decline split agreements |

---

## Analytics Permissions

Control access to analytics and reporting.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `analytics:read:own` | **Read** | View own analytics |
| `analytics:read:label` | **Read** | View label analytics |
| `analytics:read:partner` | **Read** | View partner analytics |
| `analytics:read:any` | **Read** | View all analytics |
| `analytics:export:label` | **Read** | Export label analytics |
| `analytics:export:partner` | **Read** | Export partner analytics |
| `analytics:export:any` | **Read** | Export any analytics |

---

## Analytics Management (Admin Portal)

Permissions for admin analytics pages.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `analytics:requests:read` | **Read** | View Requests page (`/admin/requests`) |
| `analytics:requests:update` | **Update** | Approve/reject requests |
| `analytics:platform_analytics:read` | **Read** | View Platform Analytics page (`/admin/platformanalytics`) |
| `analytics:analytics_management:read` | **Read** | View Analytics Management page (`/admin/analyticsmanagement`) |
| `analytics:analytics_management:create` | **Create** | Create analytics entries |
| `analytics:analytics_management:update` | **Update** | Update analytics entries |
| `analytics:analytics_management:delete` | **Delete** | Delete analytics entries |

---

## Distribution Management Permissions

Control access to distribution operations.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `distribution:read:own` | **Read** | View own distribution status |
| `distribution:read:label` | **Read** | View label distribution status |
| `distribution:read:partner` | **Read** | View partner distribution status |
| `distribution:read:any` | **Read** | View all distribution status |
| `distribution:manage:partner` | **Update** | Manage partner distribution |
| `distribution:manage:any` | **Update** | Manage all distribution |
| `distribution:approve:partner` | **Update** | Approve partner distribution |
| `distribution:approve:any` | **Update** | Approve any distribution |
| `distribution:monitor:partner` | **Read** | Monitor partner distribution |
| `distribution:monitor:any` | **Read** | Monitor all distribution |

---

## Distribution Access Permissions

Permissions for distribution hub and revenue reporting pages.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `distribution:distribution_hub:access` | **Read** | Access Distribution Hub page |
| `distribution:distribution_hub:read` | **Read** | View distribution hub data |
| `distribution:distribution_hub:create` | **Create** | Create distribution entries |
| `distribution:distribution_hub:update` | **Update** | Update distribution entries |
| `distribution:distribution_hub:delete` | **Delete** | Delete distribution entries |
| `distribution:revenue_reporting:access` | **Read** | Access Revenue Reporting page |
| `distribution:revenue_reporting:read` | **Read** | View revenue reporting data |
| `distribution:releases:access` | **Read** | Access Distribution Releases |
| `distribution:settings:access` | **Read** | Access Distribution Settings |
| `revenue:read` | **Read** | View revenue data |
| `revenue:create` | **Create** | Create revenue reports |
| `revenue:update` | **Update** | Update revenue reports |

---

## Label Management Permissions

Control access to label information and roster management.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `label:read:own` | **Read** | View own label |
| `label:read:any` | **Read** | View any label |
| `label:create:any` | **Create** | Create new labels |
| `label:update:own` | **Update** | Update own label |
| `label:update:any` | **Update** | Update any label |
| `label:delete:any` | **Delete** | Delete labels |
| `label:roster:read:own` | **Read** | View own label roster |
| `label:roster:read:any` | **Read** | View any label roster |
| `label:roster:manage:own` | **Update** | Manage own label roster |
| `label:roster:manage:any` | **Update** | Manage any label roster |
| `label:affiliation:approve:any` | **Update** | Approve label affiliation requests |
| `label:remove_artists:any` | **Update** | Remove artists from labels |
| `artist:invite:label` | **Create** | Invite artists to label |
| `artist:manage:label` | **Update** | Manage artists in label |

---

## Subscription Management Permissions

Control access to subscription information and billing.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `subscription:read:own` | **Read** | View own subscription |
| `subscription:read:label` | **Read** | View label subscriptions |
| `subscription:read:any` | **Read** | View all subscriptions |
| `subscription:update:own` | **Update** | Update own subscription |
| `subscription:update:any` | **Update** | Update any subscription |
| `subscription:cancel:own` | **Update** | Cancel own subscription |
| `subscription:cancel:any` | **Update** | Cancel any subscription |
| `subscription:manage:any` | **Update** | Manage subscription plans |
| `subscription:billing:any` | **Read** | Access billing information |

---

## Support Ticket Permissions

Control access to support tickets and customer service.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `support:read:own` | **Read** | View own support tickets |
| `support:read:label` | **Read** | View label support tickets |
| `support:read:any` | **Read** | View all support tickets |
| `support:create:own` | **Create** | Create own support tickets |
| `support:update:own` | **Update** | Update own support tickets |
| `support:update:any` | **Update** | Update any support ticket |
| `support:close:own` | **Update** | Close own support tickets |
| `support:close:any` | **Update** | Close any support ticket |
| `support:assign:any` | **Update** | Assign support tickets |
| `support:escalate:any` | **Update** | Escalate support tickets |
| `support:respond:own` | **Update** | Respond to own tickets |
| `support:respond:any` | **Update** | Respond to any ticket |
| `support:delete:any` | **Delete** | Delete support tickets |

---

## Notification & Messaging Permissions

Control access to notifications and messaging features.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `notification:read:own` | **Read** | View own notifications |
| `notification:send:label` | **Create** | Send notifications to label |
| `notification:send:any` | **Create** | Send notifications to anyone |
| `notification:manage:own` | **Update** | Manage own notifications |
| `message:read:own` | **Read** | View own messages |
| `message:send:label` | **Create** | Send messages to label users |
| `message:send:any` | **Create** | Send messages to anyone |
| `announcement:create:any` | **Create** | Create platform announcements |
| `announcement:delete:any` | **Delete** | Delete announcements |

---

## Role & Permission Management Permissions

Control access to role and permission administration.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `permission:read:any` | **Read** | View all permissions |
| `permission:assign:label` | **Update** | Assign permissions to label users |
| `permission:assign:any` | **Update** | Assign permissions to anyone |
| `permission:revoke:label` | **Update** | Revoke permissions from label users |
| `permission:revoke:any` | **Update** | Revoke permissions from anyone |
| `role:manage:any` | **Update** | Manage roles (create, update, delete) |
| `role:assign:any` | **Update** | Assign roles to users |
| `role:read:any` | **Read** | View all roles |

---

## Platform Administration Permissions

Control access to platform-wide settings.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `settings:read:any` | **Read** | View platform settings |
| `settings:update:any` | **Update** | Update platform settings |

---

## Universal Page Access Permissions

Control access to main platform pages (works across all roles).

| Permission | Operation | Description |
|------------|-----------|-------------|
| `dashboard:access` | **Read** | Access Dashboard page |
| `profile:read` | **Read** | Read own profile |
| `profile:update` | **Update** | Update own profile |
| `analytics:access` | **Read** | Access Analytics page |
| `earnings:access` | **Read** | Access Earnings page |
| `releases:access` | **Read** | Access Releases page |
| `roster:access` | **Read** | Access Roster page |
| `platform:access` | **Read** | Access platform features |
| `messages:access` | **Read** | Access Messages page |
| `settings:access` | **Read** | Access Settings page |

---

## Message Tab Permissions

Control which message tabs users can see.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `messages:invitations:view` | **Read** | View invitation messages (for artists) |
| `messages:invitation_responses:view` | **Read** | View invitation response messages (for label admins) |
| `messages:earnings:view` | **Read** | View earning notifications |
| `messages:payouts:view` | **Read** | View payout notifications |
| `messages:system:view` | **Read** | View system/platform messages |
| `messages:releases:view` | **Read** | View release notifications |
| `messages:all:view` | **Read** | View all message types (super admin) |
| `platform_messages:read` | **Read** | View Platform Messages page (`/admin/messages`) |
| `platform_messages:create` | **Create** | Send platform messages |
| `platform_messages:update` | **Update** | Update platform messages |
| `platform_messages:delete` | **Delete** | Delete platform messages |

---

## Settings Tab Permissions

Control which settings tabs users can access.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `settings:preferences:edit` | **Update** | Edit preferences tab (language, timezone, etc.) |
| `settings:security:edit` | **Update** | Edit security settings (password, 2FA, sessions) |
| `settings:notifications:edit` | **Update** | Edit notification preferences |
| `settings:billing:view` | **Read** | View billing information |
| `settings:billing:edit` | **Update** | Edit billing information |
| `settings:api_keys:view` | **Read** | View API keys |
| `settings:api_keys:manage` | **Update** | Create and revoke API keys |

---

## Analytics Tab Permissions

Control which analytics tabs users can see.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `analytics:basic:view` | **Read** | View basic analytics tab |
| `analytics:advanced:view` | **Read** | View advanced analytics tab (Pro feature) |

---

## Content Management (Admin Portal)

Permissions for admin content management pages.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `content:asset_library:read` | **Read** | View Asset Library page (`/admin/assetlibrary`) |
| `content:asset_library:delete` | **Delete** | Delete assets from library |

---

## Community Empowerment Permissions

Permissions for community features and tools.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `copyright:manage` | **Update** | Manage copyright information (`/admin/copyright`) |
| `accessibility:manage` | **Update** | Manage accessibility features (`/admin/accessibility`) |
| `accessibility:use` | **Read** | Use accessibility features |
| `sustainability:manage` | **Update** | Manage sustainability features (`/admin/sustainability`) |
| `sustainability:track` | **Read** | Track environmental impact |
| `learning:manage` | **Update** | Manage learning/skills features (`/admin/skills`) |
| `learning:access` | **Read** | Access courses and tutorials |
| `opendata:manage` | **Update** | Manage open data features (`/admin/open-data`) |
| `features:open_data:use` | **Read** | Access open music industry data |
| `features:lyrics:use` | **Read** | Use lyrics analysis features |
| `features:copyright:use` | **Read** | Use copyright management features |

---

## Touring Permissions

Control access to touring and live event management.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `touring:access` | **Read** | Access touring platform features |
| `touring:create` | **Create** | Create tours |
| `touring:read:own` | **Read** | View own tours |
| `touring:update:own` | **Update** | Update own tours |
| `touring:delete:own` | **Delete** | Delete own tours |
| `touring:read:label` | **Read** | View label tours |
| `touring:update:label` | **Update** | Update label tours |
| `touring:delete:label` | **Delete** | Delete label tours |
| `touring:admin:read` | **Read** | View Touring Administration page (`/admin/touring`) |
| `touring:admin:manage` | **Update** | Manage touring administration (full access) |
| `touring:finance:read` | **Read** | Read touring financial data |
| `touring:finance:manage` | **Update** | Manage touring financial data |
| `touring:analytics:read` | **Read** | Read touring analytics data |

---

## Systems Management Permissions

Control access to system administration and infrastructure.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `systems:access` | **Read** | Access Systems Management section (`/admin/systems`) |
| `systems:errors:view` | **Read** | View error tracking dashboard (`/admin/systems/errors`) |
| `systems:errors:manage` | **Update** | Manage error tracking settings |
| `systems:ratelimit:view` | **Read** | View rate limiting configuration (`/admin/systems/ratelimit`) |
| `systems:ratelimit:manage` | **Update** | Manage rate limiting rules |
| `systems:logs:view` | **Read** | View system logs (`/admin/systems/logs`) |
| `systems:logs:manage` | **Update** | Manage logging configuration |
| `systems:backups:view` | **Read** | View backup status (`/admin/systems/backups`) |
| `systems:backups:manage` | **Update** | Manage backups |
| `systems:backups:restore` | **Update** | Restore from backups (critical operation) |
| `systems:uptime:view` | **Read** | View uptime monitoring (`/admin/systems/uptime`) |
| `systems:uptime:manage` | **Update** | Manage uptime monitoring configuration |
| `systems:security:view` | **Read** | View security settings (`/admin/systems/security`) |
| `systems:security:manage` | **Update** | Manage security policies |
| `systems:performance:view` | **Read** | View performance metrics (`/admin/systems/performance`) |
| `systems:performance:manage` | **Update** | Manage performance monitoring settings |
| `systems:analytics:view` | **Read** | View user analytics (`/admin/systems/analytics`) |
| `systems:analytics:manage` | **Update** | Manage analytics configuration |
| `systems:email:view` | **Read** | View email system status (`/admin/systems/email`) |
| `systems:email:manage` | **Update** | Manage email templates and configuration |
| `systems:email:send` | **Create** | Send test emails and broadcasts |
| `systems:docs:view` | **Read** | View system documentation (`/admin/systems/docs`) |
| `systems:docs:manage` | **Update** | Manage and edit system documentation |

---

## Feature Management Permissions

Control access to platform feature administration.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `features:artwork:manage` | **Update** | Manage AI Artwork feature (`/admin/artwork-generator`) |
| `features:playlists:manage` | **Update** | Manage Playlist Campaigns (`/admin/playlist-pitching`) |
| `features:social:manage` | **Update** | Manage Social Media Admin (`/admin/social-media`) |
| `features:fans:manage` | **Update** | Manage Fan Analytics (`/admin/fans`) |
| `features:performances:manage` | **Update** | Manage Performance Analytics (`/admin/performances`) |
| `features:merch:manage` | **Update** | Manage Merch Management (`/admin/merch`) |

---

## Superadmin Permissions

Special permissions for superadmin functionality.

| Permission | Operation | Description |
|------------|-----------|-------------|
| `superadmin:ghost_login:access` | **Read** | Access Ghost Login feature (`/superadmin/ghostlogin`) |
| `user:impersonate` | **Read** | Impersonate users (alias for Ghost Mode) |

---

## Artist-Specific Permissions

Page access permissions for artist role (legacy/non-admin).

| Permission | Operation | Description |
|------------|-----------|-------------|
| `artist:release:access` | **Read** | Access Release page |
| `artist:analytics:access` | **Read** | Access Analytics page |
| `artist:earnings:access` | **Read** | Access Earnings page |
| `artist:roster:access` | **Read** | Access Roster page |
| `artist:dashboard:access` | **Read** | Access Dashboard page |
| `artist:platform:access` | **Read** | Access Platform page |
| `artist:messages:access` | **Read** | Access Messages page |
| `artist:settings:access` | **Read** | Access Settings page |

---

## Label Admin-Specific Permissions

Page access permissions for label_admin role (legacy/non-admin).

| Permission | Operation | Description |
|------------|-----------|-------------|
| `labeladmin:my_artists:access` | **Read** | Access My Artists page |
| `labeladmin:release:access` | **Read** | Access Release page |
| `labeladmin:analytics:access` | **Read** | Access Analytics page |
| `labeladmin:earnings:access` | **Read** | Access Earnings page |
| `labeladmin:roster:access` | **Read** | Access Roster page |
| `labeladmin:dashboard:access` | **Read** | Access Dashboard page |
| `labeladmin:platform:access` | **Read** | Access Platform page |
| `labeladmin:messages:access` | **Read** | Access Messages page |
| `labeladmin:settings:access` | **Read** | Access Settings page |
| `labeladmin:profile:access` | **Read** | Access Label Admin profile page |

---

## Permission Scope Explained

### Scope Levels

- **`own`**: User can only access their own data/resources
- **`label`**: User can access data/resources for their label
- **`partner`**: User can access data/resources in their partner network
- **`any`**: User can access any data/resources in the system
- **`admin`**: Admin-level access (typically for admin portal pages)
- **`universal`**: Works across all roles (page-level access)

### Operation Types

- **`read`**: View/list data (GET operations)
- **`create`**: Create new resources (POST operations)
- **`update`**: Modify existing resources (PUT/PATCH operations)
- **`delete`**: Remove resources (DELETE operations)
- **`manage`**: Full management (typically includes create, update, delete)
- **`access`**: Page-level access (ability to view the page)
- **`view`**: View specific tabs/sections within a page

---

## Quick Reference: Common Permission Patterns

### Admin Portal Pages
Most admin pages follow this pattern:
- `{resource}:{page}:read` - View the page
- `{resource}:{page}:create` - Create entries
- `{resource}:{page}:update` - Update entries
- `{resource}:{page}:delete` - Delete entries

### Content Management
- `{resource}:read:{scope}` - View content
- `{resource}:create:{scope}` - Create content
- `{resource}:update:{scope}` - Update content
- `{resource}:delete:{scope}` - Delete content

### Page Access
- `{page}:access` - Universal page access
- `{role}:{page}:access` - Role-specific page access

---

## Total Permissions Count

Approximately **200+ permissions** across all categories, organized by:
- Resource/Feature area
- CRUD operation
- Scope/access level

**Note**: This is a comprehensive list. The exact count may vary as permissions are added or removed. Always check the database for the current complete list.

