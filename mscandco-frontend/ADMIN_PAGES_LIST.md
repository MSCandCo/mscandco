# Admin & Superadmin Pages Reference

A comprehensive list of all admin and superadmin pages in the MSC & Co platform.

## Superadmin Pages

Superadmin pages are accessible only to users with super_admin role.

### Core Pages
- `/superadmin/dashboard` - Superadmin Dashboard
- `/superadmin/permissionsroles` - Permissions & Roles Management
- `/superadmin/ghostlogin` - Ghost Mode (User Impersonation)
- `/superadmin/messages` - Superadmin Messages

---

## Admin Pages

Admin pages are accessible based on role and permissions.

### User & Access Management
- `/admin/usermanagement` - User Management
- `/admin/masterroster` - Master Roster
- `/admin/requests` - Requests Management

### Insights (Analytics & Finance)
- `/admin/analyticsmanagement` - Analytics Management
- `/admin/platformanalytics` - Platform Analytics
- `/admin/earningsmanagement` - Earnings Management
- `/admin/walletmanagement` - Wallet Management
- `/admin/splitconfiguration` - Split Configuration
- `/admin/touring` - Touring Administration

### Community Empowerment
- `/admin/accessibility` - Accessibility Admin
- `/admin/copyright` - Copyright Management
- `/admin/sustainability` - Carbon Management
- `/admin/skills` - Skills Management
- `/admin/open-data` - Open Data Admin

### Content & Distribution
- `/admin/assetlibrary` - Asset Library

### Systems (Infrastructure & Operations)
- `/admin/systems` - Systems Overview
- `/admin/systems/analytics` - User Analytics
- `/admin/systems/backups` - Backups
- `/admin/systems/docs` - Documentation
- `/admin/systems/email` - Email System
- `/admin/systems/errors` - Error Tracking
- `/admin/systems/logs` - Logs
- `/admin/systems/performance` - Performance
- `/admin/systems/ratelimit` - Rate Limiting
- `/admin/systems/security` - Security
- `/admin/systems/uptime` - Uptime Monitoring

### Marketing
- `/admin/marketing` - Marketing Email Campaigns

### Feature Management
- `/admin/artwork-generator` - AI Artwork (Admin)
- `/admin/playlist-pitching` - Playlist Campaigns
- `/admin/social-media` - Social Media Admin
- `/admin/fans` - Fan Analytics
- `/admin/performances` - Performance Analytics
- `/admin/merch` - Merch Management

### User Account
- `/admin/profile` - Admin Profile
- `/admin/messages` - Admin Messages
- `/admin/settings` - Admin Settings

---

## Summary

**Superadmin Pages:** 4 pages
**Admin Pages:** 33 pages total
  - Core Management: 9 pages
  - Insights: 6 pages
  - Community: 5 pages
  - Systems: 11 pages
  - Features: 6 pages
  - User Account: 3 pages

**Total:** 37 admin/superadmin pages

---

## Permission-Based Access

All pages (except superadmin pages) are protected by specific permissions. Users will only see pages they have access to based on their role and assigned permissions.

For example:
- `users_access:user_management:read` → User Management
- `analytics:platform_analytics:read` → Platform Analytics
- `finance:earnings_management:read` → Earnings Management
- `systems:access` → Systems Overview
- `touring:admin:read` → Touring Administration

Super Admin users (with `*:*:*` wildcard permission) have access to all pages.

