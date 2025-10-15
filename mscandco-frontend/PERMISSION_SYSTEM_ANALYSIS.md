# Comprehensive Permission System Analysis

## Current Situation

You've requested that we consolidate permissions and create granular permission switches for tabs within pages. This analysis identifies all pages with tabs/filters that should have granular permissions.

## Pages with Tabs - Detailed Analysis

### 1. **Messages Pages** (All roles have this)

#### Artist Messages (`pages/artist/messages.js`)
**Tabs:** `all`, `invitation`, `earning`, `payout`
- Invitations from labels to join their roster
- Earning notifications (new earnings added)
- Payout notifications (payout processed/approved)

#### Label Admin Messages (`pages/labeladmin/messages.js`)
**Tabs:** `all`, `invitation_response`, `earning`, `payout`
- Invitation responses (artist accepted/declined)
- Earning notifications
- Payout notifications

#### Admin/Company Admin Messages (`pages/admin/messages.js`)
**Tabs:** `all`, `system`, `release`, `earning`, `payout`
- System messages (platform-wide announcements)
- Release notifications
- Earning notifications
- Payout notifications

#### Super Admin Messages (`pages/superadmin/messages.js`)
**Tabs:** `all`, `system`, `release`, `earning`, `payout`, `invitation`
- All message types (master view)
- Can see all platform notifications

**Recommended Permission Structure:**
```
messages:access                    # Base permission to access messages page
messages:invitations:view          # View invitation messages
messages:invitation_responses:view # View invitation response messages
messages:earnings:view             # View earning notifications
messages:payouts:view              # View payout notifications
messages:system:view               # View system/platform messages
messages:releases:view             # View release notifications
```

### 2. **Settings Pages** (Multiple roles)

#### Artist Settings (`pages/artist/settings.js`)
**Tabs:** `preferences`, `security`, `notifications`, `billing`, `api-keys`
- Preferences (language, timezone, etc.)
- Security (password, 2FA, sessions)
- Notifications (email/push preferences)
- Billing (subscription, invoices)
- API Keys (developer access)

#### Label Admin Settings (`pages/labeladmin/settings.js`)
Similar tabs to artist

#### Admin Settings (`pages/admin/settings.js`)
**Tabs:** `profile`, `security`, `notifications`, `account`
- Profile information
- Security settings
- Notification preferences
- Account information

#### Distribution Partner Settings (`pages/distributionpartner/settings.js`)
Similar structure

**Recommended Permission Structure:**
```
settings:access                # Base permission to access settings
settings:preferences:edit      # Edit preferences tab
settings:security:edit         # Edit security tab
settings:notifications:edit    # Edit notifications tab
settings:billing:view          # View billing tab
settings:billing:edit          # Edit billing information
settings:api_keys:view         # View API keys tab
settings:api_keys:manage       # Create/revoke API keys
```

### 3. **Analytics Pages**

#### Artist Analytics (`pages/artist/analytics.js`)
**Tabs:** `basic`, `advanced`
- Basic analytics (included for all)
- Advanced analytics (Pro subscription required)

**Recommended Permission Structure:**
```
analytics:access           # Base permission to access analytics
analytics:basic:view       # View basic analytics tab
analytics:advanced:view    # View advanced analytics tab (Pro feature)
```

### 4. **Admin Portal Pages with Tabs**

#### User Management (`pages/admin/usermanagement.js`)
Likely has filters/tabs for user types

#### Requests (`pages/admin/requests.js`)
Likely has tabs for different request types

#### Asset Library (`pages/admin/assetlibrary.js`)
Likely has filters for asset types

**These already use CRUD permissions from refactor_permission_system_v2.sql**

## Recommended Consolidated Permission System

### Universal Page-Level Permissions
These permissions work the same across all roles - just toggle on/off:

```sql
-- Core Pages (Universal)
analytics:access          -- View analytics page
earnings:access           -- View earnings page
releases:access           -- View releases page
roster:access             -- View roster page
profile:access            -- View/edit own profile
platform:access           -- Access platform features
messages:access           -- Access messages page
settings:access           -- Access settings page
```

### Granular Feature Permissions (Message Tabs)
These control what tabs/features users can see within the Messages page:

```sql
-- Messages Tab Permissions
messages:invitations:view           -- View invitation messages (artists)
messages:invitation_responses:view  -- View invitation responses (label admins)
messages:earnings:view              -- View earning notifications
messages:payouts:view               -- View payout notifications
messages:system:view                -- View system messages (admin/superadmin)
messages:releases:view              -- View release notifications
messages:all:view                   -- Master permission (superadmin)
```

### Granular Feature Permissions (Settings Tabs)
```sql
-- Settings Tab Permissions
settings:preferences:edit     -- Edit preferences
settings:security:edit        -- Edit security settings
settings:notifications:edit   -- Edit notification preferences
settings:billing:view         -- View billing
settings:billing:edit         -- Edit billing
settings:api_keys:view        -- View API keys
settings:api_keys:manage      -- Manage API keys
```

### Granular Feature Permissions (Analytics Tabs)
```sql
-- Analytics Tab Permissions
analytics:basic:view       -- View basic analytics
analytics:advanced:view    -- View advanced analytics (Pro)
```

## Role Default Permissions

### Artist Role
**Page Access:**
- analytics:access ✓
- earnings:access ✓
- releases:access ✓
- roster:access ✓
- profile:access ✓
- platform:access ✓
- messages:access ✓
- settings:access ✓

**Messages Tabs:**
- messages:invitations:view ✓
- messages:earnings:view ✓
- messages:payouts:view ✓

**Settings Tabs:**
- settings:preferences:edit ✓
- settings:security:edit ✓
- settings:notifications:edit ✓
- settings:billing:view ✓
- settings:billing:edit ✓
- settings:api_keys:view ✓
- settings:api_keys:manage ✓

**Analytics Tabs:**
- analytics:basic:view ✓
- analytics:advanced:view ✓ (if Pro subscription)

### Label Admin Role
**Page Access:**
- analytics:access ✓
- earnings:access ✓
- releases:access ✓
- roster:access ✓
- profile:access ✓
- platform:access ✓
- messages:access ✓
- settings:access ✓

**Messages Tabs:**
- messages:invitation_responses:view ✓
- messages:earnings:view ✓
- messages:payouts:view ✓

**Settings Tabs:**
- (Same as artist)

**Analytics Tabs:**
- (Same as artist)

### Distribution Partner Role
**Page Access:**
- distribution:distribution_hub:access ✓
- distribution:revenue_reporting:access ✓
- distribution:releases:access ✓
- distribution:settings:access ✓
- messages:access ✓

**Messages Tabs:**
- messages:system:view ✓ (optional - if we want them to receive notifications)
- messages:earnings:view ✓
- messages:payouts:view ✓

**Settings Tabs:**
- (Same as artist)

### Super Admin Role
**Page Access:**
- *:*:* (wildcard - all permissions)

**Messages Tabs:**
- messages:all:view ✓ (master permission to see all message types)

## Implementation Strategy

### Phase 1: Universal Page Permissions ✅ IN PROGRESS
1. Create universal permissions (analytics:access, earnings:access, etc.)
2. Assign to artist and label_admin roles
3. Update frontend pages to use new permission names
4. Test navigation

### Phase 2: Granular Message Permissions
1. Create message tab permissions
2. Assign default permissions to roles
3. Update message pages to check tab permissions
4. Hide tabs if user doesn't have permission
5. Test with permission toggles

### Phase 3: Granular Settings Permissions
1. Create settings tab permissions
2. Assign default permissions to roles
3. Update settings pages to check tab permissions
4. Hide/disable tabs if user doesn't have permission
5. Test with permission toggles

### Phase 4: Granular Analytics Permissions
1. Create analytics tab permissions
2. Link advanced analytics to Pro subscription
3. Update analytics pages to check tab permissions
4. Test with permission toggles

## Benefits of This Approach

1. **Super Admin Control:** Can toggle any feature on/off for any user
2. **Granular Access:** Individual tabs can be enabled/disabled
3. **Subscription Integration:** Pro features can require both permission AND subscription
4. **Distribution Partner Flexibility:** Can give them access to specific message types
5. **Scalability:** Easy to add new tabs/features with new permissions
6. **Consistency:** Same permission pattern across all roles

## Next Steps

1. Get user approval on this permission structure
2. Create SQL migration with all new permissions
3. Update frontend components to check granular permissions
4. Test thoroughly with permission toggles
5. Document the permission system for future reference

---

**Date:** October 14, 2025
**Status:** Awaiting user approval
