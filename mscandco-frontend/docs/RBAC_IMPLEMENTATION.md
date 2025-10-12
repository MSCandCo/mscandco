# RBAC Implementation Documentation

## Overview

This document describes the Role-Based Access Control (RBAC) system implemented for the AudioStems platform. The system provides fine-grained permission checking for both API routes and UI components.

## Roles

The platform supports 5 distinct roles with hierarchical permissions:

### 1. **Artist** (`artist`)
- Base level user role
- Can manage their own releases, profile, and analytics
- Can view their own earnings and wallet
- Can create content and upload media
- Cannot manage other users or access admin features

### 2. **Label Admin** (`label_admin`)
- Manages artists within their label
- Can invite and remove artists from their label
- Can view and manage releases for their label's artists
- Can access aggregated analytics for their label
- Can send notifications to label artists

### 3. **Company Admin** (`company_admin`)
- Manages company-wide operations
- Can manage all labels and artists within the company
- Can approve/reject change requests
- Can manage revenue splits and earnings
- Can access comprehensive analytics and reports
- Can manage company settings

### 4. **Super Admin** (`super_admin`)
- Highest privilege level with full system access
- Can create, edit, and delete any user
- Can impersonate users (ghost mode)
- Can manage system settings and configurations
- Can access all features and data across the platform
- Can manage subscriptions and wallets for any user

### 5. **Distribution Partner** (`distribution_partner`)
- External partner role for content distribution
- Can view content and analytics
- Can manage content distribution
- Limited to distribution-specific features

## File Structure

### Core RBAC Files

```
lib/rbac/
├── roles.js          # Role definitions and permission mappings
└── middleware.js     # API route protection middleware

hooks/
└── usePermissions.js # React hooks for UI permission checking

components/rbac/
└── PermissionGate.js # Permission-gated UI components
```

### File Purposes

#### `lib/rbac/roles.js`
- Exports `ROLES` constant with all role identifiers
- Exports `PERMISSIONS` object mapping permissions to roles
- Provides utility functions:
  - `hasPermission(role, permission)` - Check single permission
  - `hasAnyPermission(role, permissions)` - Check multiple (OR logic)
  - `hasAllPermissions(role, permissions)` - Check all (AND logic)
  - `getRolePermissions(role)` - Get all permissions for a role
  - `isRoleHigher(role1, role2)` - Compare role hierarchy
  - `getRoleName(role)` - Get formatted role name

#### `lib/rbac/middleware.js`
- Provides API route protection middleware
- Integrates with Supabase authentication
- Logs permission denials to audit_logs table
- Exports:
  - `requirePermission(permission, options)` - Permission-based middleware
  - `requireRole(role)` - Role-based middleware
  - `requireAuth(handler)` - Authentication-only middleware
  - `getUserAndRole(req)` - Extract user and role from request
  - `isOwner(userId, resourceOwnerId)` - Helper for ownership checks

#### `hooks/usePermissions.js`
- React hooks for client-side permission checking
- Fetches user role from Supabase session
- Exports:
  - `usePermissions()` - Main hook with permission checking functions
  - `useRequireAuth()` - Hook that redirects if not authenticated
  - `useUserRole()` - Lightweight hook for role only

#### `components/rbac/PermissionGate.js`
- Declarative permission-gated components
- Exports:
  - `<PermissionGate>` - Render based on permissions
  - `<RoleGate>` - Render based on roles
  - `<WithoutPermission>` - Inverse permission check
  - `withPermission(Component, permission)` - HOC wrapper
  - `withRole(Component, role)` - HOC wrapper

## Permissions System

### Permission Naming Convention

Permissions follow the pattern: `resource:action:scope`

- **resource**: The entity being accessed (e.g., `profile`, `release`, `analytics`)
- **action**: The operation being performed (e.g., `view`, `create`, `edit`, `delete`)
- **scope**: The access level (e.g., `own`, `label`, `any`)

### Key Permission Categories

#### Profile Permissions
```
profile:view:own      # View own profile
profile:edit:own      # Edit own profile
profile:view:any      # View any user's profile (admin)
profile:edit:any      # Edit any user's profile (admin)
profile:delete:any    # Delete any profile (super admin only)
```

#### Release Permissions
```
release:view:own      # View own releases
release:create        # Create new releases
release:edit:own      # Edit own releases
release:delete:own    # Delete own releases
release:view:label    # View label's releases
release:edit:label    # Edit label's releases
release:view:any      # View all releases (admin)
release:approve       # Approve releases for publication
release:publish       # Publish releases to platforms
```

#### Analytics Permissions
```
analytics:view:own    # View own analytics
analytics:view:label  # View label analytics
analytics:view:any    # View all analytics (admin)
analytics:edit:any    # Edit analytics data (admin)
analytics:export      # Export analytics reports
```

#### Wallet & Earnings Permissions
```
wallet:view:own       # View own wallet balance
wallet:topup:own      # Add funds to own wallet
wallet:withdraw:own   # Withdraw from own wallet
wallet:view:any       # View any wallet (admin)
wallet:manage:any     # Manage any wallet (super admin)

earnings:view:own     # View own earnings
earnings:view:label   # View label earnings
earnings:view:any     # View all earnings (admin)
earnings:approve      # Approve earnings/payouts
```

#### User Management Permissions
```
user:view:any         # View all users
user:create           # Create new users
user:edit:any         # Edit any user
user:delete:any       # Delete users
user:impersonate      # Ghost mode / impersonate users
```

#### Artist Management Permissions
```
artist:view:label     # View label's artists
artist:invite         # Invite artists to label
artist:remove:label   # Remove artists from label
artist:manage:any     # Manage all artists (admin)
```

#### System Permissions
```
system:settings       # Access system settings
system:logs           # View system logs
system:reports        # Generate reports
company:settings      # Manage company settings
label:create          # Create new labels
```

## Usage Examples

### API Route Protection

#### Example 1: Single Permission
```javascript
// pages/api/releases/create.js
import { requirePermission } from '@/lib/rbac/middleware';

async function handler(req, res) {
  // req.user and req.userRole are automatically attached
  const release = await createRelease(req.body, req.user.id);
  return res.json({ release });
}

export default requirePermission('release:create')(handler);
```

#### Example 2: Multiple Permissions (OR Logic)
```javascript
// pages/api/releases/[id]/edit.js
import { requirePermission } from '@/lib/rbac/middleware';

async function handler(req, res) {
  const { id } = req.query;

  // User needs either permission to access
  const release = await updateRelease(id, req.body);
  return res.json({ release });
}

export default requirePermission([
  'release:edit:own',
  'release:edit:label'
])(handler);
```

#### Example 3: Multiple Permissions (AND Logic)
```javascript
// pages/api/admin/analytics.js
import { requirePermission } from '@/lib/rbac/middleware';

async function handler(req, res) {
  // User must have ALL permissions
  const analytics = await getComprehensiveAnalytics();
  return res.json({ analytics });
}

export default requirePermission(
  ['release:view:any', 'analytics:view:any'],
  { requireAll: true }
)(handler);
```

#### Example 4: Role-Based Protection
```javascript
// pages/api/admin/users.js
import { requireRole } from '@/lib/rbac/middleware';

async function handler(req, res) {
  const users = await getAllUsers();
  return res.json({ users });
}

// Only company_admin and super_admin can access
export default requireRole(['company_admin', 'super_admin'])(handler);
```

#### Example 5: Custom Permission Logic
```javascript
// pages/api/releases/[id]/edit.js
import { requireAuth, isOwner } from '@/lib/rbac/middleware';
import { hasPermission } from '@/lib/rbac/roles';

async function handler(req, res) {
  const { id } = req.query;
  const release = await getRelease(id);

  // Custom logic: Own release OR has label/admin permission
  const canEdit =
    isOwner(req.user.id, release.user_id) ||
    hasPermission(req.userRole, 'release:edit:label') ||
    hasPermission(req.userRole, 'release:edit:any');

  if (!canEdit) {
    return res.status(403).json({ error: 'Cannot edit this release' });
  }

  const updated = await updateRelease(id, req.body);
  return res.json({ release: updated });
}

export default requireAuth(handler);
```

### UI Component Permission Gates

#### Example 1: Simple Permission Gate
```jsx
import { PermissionGate } from '@/components/rbac/PermissionGate';

function ReleaseDashboard() {
  return (
    <div>
      <h1>Releases</h1>

      <PermissionGate permission="release:create">
        <CreateReleaseButton />
      </PermissionGate>

      {/* Rest of dashboard */}
    </div>
  );
}
```

#### Example 2: Multiple Permissions (OR)
```jsx
import { PermissionGate } from '@/components/rbac/PermissionGate';

function ReleaseCard({ release }) {
  return (
    <Card>
      <h3>{release.title}</h3>

      {/* Show edit button if user can edit own OR label releases */}
      <PermissionGate permission={['release:edit:own', 'release:edit:label']}>
        <EditButton releaseId={release.id} />
      </PermissionGate>
    </Card>
  );
}
```

#### Example 3: With Fallback Content
```jsx
import { PermissionGate } from '@/components/rbac/PermissionGate';

function PremiumFeature() {
  return (
    <PermissionGate
      permission="analytics:export"
      fallback={
        <UpgradePrompt>
          Upgrade to export analytics
        </UpgradePrompt>
      }
    >
      <ExportAnalyticsButton />
    </PermissionGate>
  );
}
```

#### Example 4: Role-Based Gate
```jsx
import { RoleGate } from '@/components/rbac/PermissionGate';

function AdminPanel() {
  return (
    <RoleGate role={['company_admin', 'super_admin']}>
      <CompanySettings />
      <UserManagement />
      <SystemLogs />
    </RoleGate>
  );
}
```

#### Example 5: Using the Hook Directly
```jsx
import { usePermissions } from '@/hooks/usePermissions';

function Dashboard() {
  const { hasPermission, hasAnyPermission, role, isLoading } = usePermissions();

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1>Dashboard</h1>

      {hasPermission('release:create') && (
        <CreateReleaseButton />
      )}

      {hasAnyPermission(['analytics:view:label', 'analytics:view:any']) && (
        <AnalyticsSection />
      )}

      {role === 'super_admin' && (
        <SuperAdminTools />
      )}
    </div>
  );
}
```

#### Example 6: Higher-Order Component
```jsx
import { withPermission, withRole } from '@/components/rbac/PermissionGate';

// Wrap component with permission check
const ProtectedCreateButton = withPermission(
  CreateReleaseButton,
  'release:create'
);

// Wrap component with role check
const SuperAdminPanel = withRole(
  AdminPanel,
  'super_admin',
  { fallback: <AccessDenied /> }
);

function App() {
  return (
    <div>
      <ProtectedCreateButton />
      <SuperAdminPanel />
    </div>
  );
}
```

## Permission Matrix

### Artist Role
- ✅ Own profile, releases, analytics, wallet
- ✅ Create and manage own content
- ✅ Upload media files
- ❌ View/manage other users
- ❌ Admin features

### Label Admin Role
- ✅ Everything Artist can do
- ✅ Manage label's artists
- ✅ View/edit label releases
- ✅ Label-wide analytics
- ✅ Send label notifications
- ❌ Company-wide management
- ❌ System configuration

### Company Admin Role
- ✅ Everything Label Admin can do
- ✅ Manage all labels and artists
- ✅ Approve change requests
- ✅ Company-wide analytics
- ✅ Revenue management
- ✅ Company settings
- ❌ System-level changes
- ❌ User impersonation

### Super Admin Role
- ✅ Full platform access
- ✅ User management (CRUD)
- ✅ User impersonation
- ✅ System configuration
- ✅ All data access
- ✅ Override all restrictions

### Distribution Partner Role
- ✅ View content and analytics
- ✅ Manage content distribution
- ✅ Distribution-specific features
- ❌ User management
- ❌ Financial operations

## Security Features

### Audit Logging
Failed permission checks are automatically logged to the `audit_logs` table:
```javascript
{
  event_type: 'permission_denied',
  user_id: 'uuid',
  user_email: 'user@example.com',
  user_role: 'artist',
  details: {
    permission: 'release:edit:label',
    path: '/api/releases/123/edit',
    ip: '192.168.1.1',
    timestamp: '2025-10-03T12:00:00Z'
  }
}
```

### Error Responses
Unauthorized requests receive structured error responses:
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions to access this resource",
  "required_permissions": ["release:edit:label"],
  "user_role": "artist"
}
```

## Database Schema

### user_role_assignments Table
```sql
CREATE TABLE user_role_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role_name TEXT NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### audit_logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  user_role TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Migration Guide

### Converting Existing Routes
Before:
```javascript
export default async function handler(req, res) {
  const { user } = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Manual role check
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Handler logic
}
```

After:
```javascript
import { requireRole } from '@/lib/rbac/middleware';

async function handler(req, res) {
  // req.user and req.userRole already attached
  // Handler logic
}

export default requireRole('admin')(handler);
```

## TODO: Next Steps

### Apply Middleware to Existing API Routes

The RBAC foundation is complete. The next step is to systematically apply the middleware to existing API routes in `pages/api/`:

#### Priority Routes to Protect:
1. **Release Management** (`pages/api/releases/`)
   - Create, edit, delete, approve releases
   - Apply `requirePermission('release:*')` middleware

2. **Analytics** (`pages/api/analytics/`, `pages/api/admin/analytics/`)
   - Ensure proper scope-based access (own/label/any)
   - Apply `requirePermission('analytics:view:*')` middleware

3. **User Management** (`pages/api/admin/users.js`, `pages/api/superadmin/`)
   - Restrict to admin roles
   - Apply `requireRole(['company_admin', 'super_admin'])` middleware

4. **Wallet Operations** (`pages/api/wallet/`)
   - Protect topup, withdrawal, admin operations
   - Apply `requirePermission('wallet:*')` middleware

5. **Profile Updates** (`pages/api/profile/`, `pages/api/*/profile.js`)
   - Ensure users can only edit own profiles (unless admin)
   - Apply `requirePermission('profile:edit:own')` with custom logic

6. **Change Requests** (`pages/api/admin/change-requests.js`)
   - Restrict approval to admins
   - Apply `requirePermission('change_request:approve')` middleware

#### Implementation Checklist:
- [ ] Audit all routes in `pages/api/` for permission requirements
- [ ] Apply appropriate middleware to each route
- [ ] Add custom permission logic where needed (e.g., ownership checks)
- [ ] Test each route with different roles
- [ ] Update frontend to use `<PermissionGate>` components
- [ ] Remove old manual permission checks
- [ ] Add audit logging queries to admin dashboard

## Testing

### Testing Permissions in Development

```javascript
// Test with different roles
import { hasPermission } from '@/lib/rbac/roles';

console.log(hasPermission('artist', 'release:create')); // true
console.log(hasPermission('artist', 'user:delete:any')); // false
console.log(hasPermission('super_admin', 'user:delete:any')); // true
```

### Testing Middleware

```javascript
// Mock request for testing
const mockReq = {
  headers: { authorization: 'Bearer test-token' },
  user: { id: 'user-123' },
  userRole: 'artist'
};

// Test protected route
const protectedHandler = requirePermission('release:create')(handler);
await protectedHandler(mockReq, mockRes);
```

## Resources

- **Role Definitions**: `lib/rbac/roles.js`
- **API Middleware**: `lib/rbac/middleware.js`
- **React Hooks**: `hooks/usePermissions.js`
- **UI Components**: `components/rbac/PermissionGate.js`
- **Permission List**: See PERMISSIONS object in `lib/rbac/roles.js` (80+ permissions)

## Support

For questions or issues with the RBAC system:
1. Check this documentation first
2. Review the source code comments (extensive JSDoc)
3. Test with different roles in development
4. Check audit logs for permission denials
