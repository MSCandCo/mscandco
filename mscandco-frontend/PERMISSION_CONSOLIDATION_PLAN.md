# Permission Consolidation Plan

## Current Issues
1. Duplicate permissions for same resources (e.g., `artist:analytics:access`, `label_admin:analytics:access`, `labeladmin:analytics:access`)
2. Inconsistent naming (distribution needs `:access` suffix)
3. Messages and Settings use role prefixes but need to stay separate (different functionality per role)

## New Universal Permissions (Consolidated)

These permissions work the same across all roles - just toggle on/off:

```
analytics:access          # View analytics page (replaces artist/label_admin/labeladmin:analytics:access)
earnings:access           # View earnings page (replaces artist/label_admin/labeladmin:earnings:access)
releases:access           # View releases page (replaces artist/label_admin/labeladmin:release:access)
roster:access             # View roster page (replaces artist/label_admin/labeladmin:roster:access)
profile:access            # View/edit own profile (replaces profile:view:own + profile:edit:own)
platform:access           # Access platform features (replaces artist/label_admin:platform:access)
```

## Role-Specific Permissions (Keep Separate)

These have different functionality per role:

```
# Messages - Different notification types per role
artist:messages:access              # Artist invitations, earnings, payouts
labeladmin:messages:access          # Invitation responses, earnings, payouts
superadmin:messages:access          # Platform messages
dropdown:platform_messages:read     # Admin platform-wide messaging

# Settings - Different tabs/options per role
artist:settings:access              # Artist-specific settings
labeladmin:settings:access          # Label admin settings
dropdown:settings:read              # Admin settings
distribution:settings:access        # Distribution partner settings
```

## Distribution Permissions (Add `:access` suffix)

```
distribution:releases:access        # ✅ Already exists
distribution:settings:access        # ✅ Already exists
distribution:distribution_hub:access     # ✅ NEW - Add for navigation
distribution:revenue_reporting:access    # ✅ NEW - Add for navigation
```

## Admin Permissions (Keep as-is)

These use resource:action:scope pattern for CRUD operations:

```
# Analytics Management
analytics:analytics_management:read
analytics:analytics_management:create
analytics:analytics_management:update
analytics:analytics_management:delete

# And all other admin CRUD permissions...
```

## Migration Steps

1. Create new universal permissions
2. Assign universal permissions to all roles that had old role-specific ones
3. Add missing distribution `:access` permissions
4. Update frontend pages to use new permission names
5. Update API endpoints
6. Delete old duplicate permissions
7. Update header navigation for distribution partner

