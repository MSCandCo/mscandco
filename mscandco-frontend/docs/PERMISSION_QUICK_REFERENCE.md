# Permission Quick Reference Guide

## Permission Format

All permissions follow the format: `resource:action:scope`

### Components
- **resource**: The entity being accessed (user, release, analytics, etc.)
- **action**: The operation being performed (read, create, update, delete)
- **scope**: The permission scope (own, any, team)

### Examples
- `user:read:own` - Read own user data
- `user:read:any` - Read any user's data
- `release:create:own` - Create own releases
- `release:update:any` - Update any user's releases

## Wildcard Permissions

### SuperAdmin Wildcard
```
*:*:* - Full platform access (SuperAdmin only)
```

### Resource Wildcards
```
user:*:* - All user operations, all scopes
release:*:own - All release operations on own resources
```

### Action Wildcards
```
user:read:* - Read users in any scope
analytics:*:any - All analytics operations, any scope
```

## Role-Based Permissions

### Artist Role

**Profile & Account**
- `user:read:own` - View own profile
- `user:update:own` - Update own profile
- `user:delete:own` - Delete own account

**Releases**
- `release:create:own` - Create releases
- `release:read:own` - View own releases
- `release:update:own` - Update own releases
- `release:delete:own` - Delete own releases

**Tracks**
- `track:create:own` - Add tracks to releases
- `track:read:own` - View own tracks
- `track:update:own` - Update track metadata
- `track:delete:own` - Delete tracks

**Analytics**
- `analytics:read:own` - View own analytics
- `analytics:export:own` - Export own analytics data

**Earnings & Wallet**
- `wallet:read:own` - View wallet balance
- `wallet:withdraw:own` - Request withdrawals
- `transaction:read:own` - View transaction history

**Messages**
- `message:read:own` - Read own messages
- `message:create:own` - Send messages
- `message:delete:own` - Delete own messages

**Contracts**
- `contract:read:own` - View own contracts
- `contract:sign:own` - Sign contracts

### Label Admin Role

**Inherits all Artist permissions, plus:**

**User Management (Limited)**
- `user:read:team` - View artists under their label
- `user:update:team` - Update label artists' info
- `user:invite:team` - Invite artists to label

**Releases (Team)**
- `release:read:team` - View label releases
- `release:update:team` - Update label releases
- `release:approve:team` - Approve releases for distribution

**Analytics (Team)**
- `analytics:read:team` - View label analytics
- `analytics:export:team` - Export label analytics

**Earnings (Team)**
- `wallet:read:team` - View label earnings
- `transaction:read:team` - View label transactions
- `split:manage:team` - Manage royalty splits

**Roster Management**
- `roster:read:team` - View label roster
- `roster:update:team` - Update roster information

### Admin Role

**Inherits Label Admin permissions, plus:**

**User Management (Full)**
- `user:read:any` - View all users
- `user:create:any` - Create user accounts
- `user:update:any` - Update any user
- `user:suspend:any` - Suspend user accounts
- `user:delete:any` - Delete user accounts

**Releases (Full)**
- `release:read:any` - View all releases
- `release:update:any` - Update any release
- `release:approve:any` - Approve any release
- `release:delete:any` - Delete any release
- `release:feature:any` - Feature releases on platform

**Analytics (Full)**
- `analytics:read:any` - View all analytics
- `analytics:export:any` - Export all analytics
- `analytics:platform:read` - View platform-wide analytics

**Wallet & Payments**
- `wallet:read:any` - View all wallets
- `wallet:adjust:any` - Adjust wallet balances
- `transaction:read:any` - View all transactions
- `transaction:process:any` - Process payments
- `withdrawal:approve:any` - Approve withdrawals

**Platform Management**
- `platform:read:any` - View platform settings
- `platform:update:any` - Update platform settings
- `message:read:any` - View all messages
- `message:broadcast:any` - Send broadcast messages

**Content Management**
- `content:create:any` - Create platform content
- `content:update:any` - Update platform content
- `content:delete:any` - Delete platform content

**Support**
- `support:read:any` - View support tickets
- `support:respond:any` - Respond to tickets
- `support:close:any` - Close tickets

### SuperAdmin Role

**All Admin permissions, plus:**

**System Administration**
- `*:*:*` - Full platform access (wildcard)
- `permission:create:any` - Create permissions
- `permission:update:any` - Update permissions
- `permission:delete:any` - Delete permissions
- `permission:assign:any` - Assign permissions to users/roles
- `permission:revoke:any` - Revoke permissions

**Role Management**
- `role:create:any` - Create roles
- `role:update:any` - Update roles
- `role:delete:any` - Delete roles
- `role:assign:any` - Assign roles to users

**Database & System**
- `database:read:any` - View database directly
- `database:update:any` - Execute database operations
- `system:read:any` - View system logs
- `system:update:any` - Update system configuration

**Ghost Mode**
- `ghost:login:any` - Log in as any user
- `ghost:impersonate:any` - Impersonate users

**Security**
- `security:audit:any` - View security logs
- `security:configure:any` - Configure security settings

## Permission Hierarchy

```
SuperAdmin (*)
    ↓
Admin (any)
    ↓
Label Admin (team)
    ↓
Artist (own)
```

### Scope Inheritance
- `any` includes `team` and `own`
- `team` includes `own` (within team context)
- `own` is most restrictive

## Common Permission Checks

### Frontend (Client Component)
```javascript
'use client';
import { useUser } from '@/app/context/UserContext';

export default function ProtectedComponent() {
  const { permissions } = useUser();

  const canCreateRelease = permissions.some(p =>
    p.permission_name === 'release:create:own' ||
    p.permission_name === 'release:*:own' ||
    p.permission_name === '*:*:*'
  );

  if (!canCreateRelease) {
    return <NoAccessMessage />;
  }

  return <ReleaseCreator />;
}
```

### Backend (Server Component)
```javascript
// app/admin/users/page.js
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { userHasPermission } from '@/lib/permissions';

export default async function UsersPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const hasPermission = await userHasPermission(
    user.id,
    'user:read:any',
    true // use service role
  );

  if (!hasPermission) {
    redirect('/dashboard');
  }

  // User has permission, render page
  return <UserManagement />;
}
```

### API Route
```javascript
// app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/permissions';

export async function GET(request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check permission
  const hasPermission = await requirePermission(
    user.id,
    'user:read:any'
  );

  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // Fetch users
  const { data } = await supabase
    .from('user_profiles')
    .select('*');

  return NextResponse.json(data);
}
```

### Middleware
```javascript
// middleware.js
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { getUserPermissions } from '@/lib/permissions';

export async function middleware(request) {
  const response = NextResponse.next();
  const supabase = createServerClient(/* ... */);

  const { data: { user } } = await supabase.auth.getUser();

  // Check if accessing admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check admin permissions
    const permissions = await getUserPermissions(user.id);
    const hasAdminAccess = permissions.some(p =>
      p.permission_name === '*:*:*' ||
      p.permission_name === 'user:read:any'
    );

    if (!hasAdminAccess) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}
```

## Permission Utilities

### Check Single Permission
```javascript
import { userHasPermission } from '@/lib/permissions';

const canUpdate = await userHasPermission(
  userId,
  'release:update:own',
  true // use service role for server-side
);
```

### Check Multiple Permissions (OR)
```javascript
import { userHasAnyPermission } from '@/lib/permissions';

const canAccessAnalytics = await userHasAnyPermission(
  userId,
  ['analytics:read:own', 'analytics:read:team', 'analytics:read:any']
);
```

### Check Multiple Permissions (AND)
```javascript
import { userHasAllPermissions } from '@/lib/permissions';

const canManageAndApprove = await userHasAllPermissions(
  userId,
  ['release:update:team', 'release:approve:team']
);
```

## Custom Permission Logic

### Resource Ownership Check
```javascript
async function canAccessRelease(userId, releaseId) {
  const supabase = createServerClient();

  // Check if user owns the release
  const { data: release } = await supabase
    .from('releases')
    .select('artist_id')
    .eq('id', releaseId)
    .single();

  if (release.artist_id === userId) {
    return await userHasPermission(userId, 'release:read:own');
  }

  // Check if user can read any releases
  return await userHasPermission(userId, 'release:read:any');
}
```

### Team Membership Check
```javascript
async function canAccessTeamResource(userId, resourceOwnerId) {
  const supabase = createServerClient();

  // Check if users are in same label/team
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('label_id')
    .eq('id', userId)
    .single();

  const { data: ownerProfile } = await supabase
    .from('user_profiles')
    .select('label_id')
    .eq('id', resourceOwnerId)
    .single();

  if (userProfile.label_id === ownerProfile.label_id) {
    return await userHasPermission(userId, 'release:read:team');
  }

  return await userHasPermission(userId, 'release:read:any');
}
```

## Denied Permissions

Users can have explicitly denied permissions that override role permissions.

### Example Scenario
```javascript
// User is an Artist with release:create:own from role
// But admin denies this specific permission

// In database:
// user_permissions table:
// { user_id: 'uuid', permission_id: 'release:create', denied: true }

// Result: User cannot create releases despite role permission
```

### Checking Denied Permissions
```javascript
// The getUserPermissions() function automatically handles denials
const permissions = await getUserPermissions(userId);
// Returns permissions with denials already filtered out
```

## Troubleshooting Permissions

### Debug User Permissions
```javascript
// scripts/check-user-permissions.js
import { getUserPermissions } from '@/lib/permissions';

const permissions = await getUserPermissions('user-id-here', true);
console.log('User Permissions:', permissions.map(p => p.permission_name));
```

### Check Role Permissions
```sql
-- View permissions for a role
SELECT p.name, p.description
FROM permissions p
JOIN role_permissions rp ON rp.permission_id = p.id
JOIN roles r ON r.id = rp.role_id
WHERE r.name = 'Artist';
```

### Check User-Specific Overrides
```sql
-- View user-specific permission overrides
SELECT p.name, up.denied
FROM permissions p
JOIN user_permissions up ON up.permission_id = p.id
WHERE up.user_id = 'user-uuid-here';
```

## Best Practices

### 1. Always Check Server-Side
Never trust client-side permission checks alone. Always validate on the server.

```javascript
// ❌ Bad: Only client-side check
'use client';
export default function DeleteButton({ releaseId }) {
  const { permissions } = useUser();
  const canDelete = permissions.includes('release:delete:own');

  if (!canDelete) return null;

  // User can manipulate client code and call this anyway!
  const handleDelete = () => {
    fetch(`/api/releases/${releaseId}`, { method: 'DELETE' });
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

```javascript
// ✅ Good: Client check for UX + Server validation
'use client';
export default function DeleteButton({ releaseId }) {
  const { permissions } = useUser();
  const canDelete = permissions.includes('release:delete:own');

  if (!canDelete) return null; // Hide button

  const handleDelete = async () => {
    // API route validates permissions server-side
    const response = await fetch(`/api/releases/${releaseId}`, {
      method: 'DELETE'
    });

    if (response.status === 403) {
      alert('You do not have permission');
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

### 2. Use Specific Permissions
Avoid giving broad wildcards unless necessary.

```javascript
// ❌ Bad: Too broad
'release:*:any'

// ✅ Good: Specific permissions
['release:read:any', 'release:update:team']
```

### 3. Document Custom Permissions
When adding new permissions, document them:

```javascript
// lib/rbac/permissions-registry.js
export const PERMISSIONS = {
  // User Management
  USER_READ_OWN: 'user:read:own', // View own profile
  USER_UPDATE_OWN: 'user:update:own', // Update own profile

  // Release Management
  RELEASE_CREATE_OWN: 'release:create:own', // Create releases
  RELEASE_READ_OWN: 'release:read:own', // View own releases
  // ... etc
};
```

### 4. Test Permissions Thoroughly
Create test scripts to verify permissions work as expected:

```javascript
// tests/permissions.test.js
describe('Permission System', () => {
  it('Artist can view own releases', async () => {
    const hasPermission = await userHasPermission(
      artistUserId,
      'release:read:own'
    );
    expect(hasPermission).toBe(true);
  });

  it('Artist cannot view all users', async () => {
    const hasPermission = await userHasPermission(
      artistUserId,
      'user:read:any'
    );
    expect(hasPermission).toBe(false);
  });
});
```

## Permission Migration

When adding new permissions:

1. **Add to permissions table**:
```sql
INSERT INTO permissions (name, description, category)
VALUES ('feature:new:own', 'Access new feature', 'feature');
```

2. **Assign to roles**:
```sql
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Artist'
AND p.name = 'feature:new:own';
```

3. **Update documentation**
4. **Test thoroughly**
5. **Deploy with migration script**

## Support

For permission-related questions:
- Check existing permissions: `lib/rbac/default-role-permissions.js`
- Database schema: See RBAC_IMPLEMENTATION.md
- Debug scripts: `scripts/debug-permissions.js`
- Contact: tech@mscandco.com
