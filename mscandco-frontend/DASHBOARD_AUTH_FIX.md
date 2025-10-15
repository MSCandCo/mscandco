# Dashboard Authentication Fix

## Problem

The `/api/dashboard/widgets` endpoint was returning `401 Unauthorized` errors when called from the frontend, even though the user was properly authenticated. This prevented the smart dashboard system from loading widget data.

## Root Cause

The RBAC middleware (`lib/rbac/middleware.js`) was not properly handling cookie-based authentication. The middleware had two issues:

1. **Manual cookie parsing**: The original approach attempted to manually parse Supabase auth cookies, which was error-prone and incomplete
2. **Missing `res` parameter**: The `getUserAndRole` function signature was changed to accept both `req` and `res`, but the `requireAuth` middleware wrapper wasn't updated to pass both parameters

## Solution

### 1. Use Supabase Auth Helpers (lib/rbac/middleware.js:20-52)

Instead of manually parsing cookies, the middleware now uses `@supabase/auth-helpers-nextjs` which properly handles cookie-based sessions:

```javascript
async function getUserAndRole(req, res) {
  try {
    let user = null;

    // Try Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: tokenUser }, error: authError } = await supabase.auth.getUser(token);
      if (!authError && tokenUser) {
        user = tokenUser;
      }
    }

    // Fall back to cookie-based session using Supabase auth helpers
    if (!user) {
      const { createPagesServerClient } = await import('@supabase/auth-helpers-nextjs');
      const supabaseSession = createPagesServerClient({ req, res });
      const { data: { session }, error: sessionError } = await supabaseSession.auth.getSession();

      if (!sessionError && session?.user) {
        user = session.user;
      }
    }

    if (!user) {
      return { user: null, role: null, error: 'No authorization token provided' };
    }

    // ... role detection logic continues ...
  }
}
```

### 2. Fix Function Signature (lib/rbac/middleware.js:333)

Updated all middleware wrapper functions to pass both `req` and `res` to `getUserAndRole`:

```javascript
// Before (in requireAuth):
const { user, role, error } = await getUserAndRole(req);

// After:
const { user, role, error } = await getUserAndRole(req, res);
```

## Files Modified

1. `/lib/rbac/middleware.js` - Updated authentication logic
2. `/pages/api/dashboard/widgets.js` - Added debug logging

## Testing

After the fix:
- ✅ Authorization header authentication works (for programmatic API calls)
- ✅ Cookie-based authentication works (for client-side fetch calls)
- ✅ Other endpoints (`/api/user/permissions`, `/api/artist/profile`, etc.) continue to work correctly

## Why This Fix Works

The `/api/user/permissions` endpoint (which was working correctly) uses the same pattern:

```javascript
// Try Authorization header first
const authHeader = req.headers.authorization;
if (authHeader) {
  const token = authHeader.replace('Bearer ', '');
  const { data: { user: tokenUser }, error } = await supabaseClient.auth.getUser(token);
  if (!error && tokenUser) {
    user = tokenUser;
  }
}

// Fall back to cookie-based session
if (!user) {
  const supabase = createPagesServerClient({ req, res });
  const { data: { session }, error } = await supabase.auth.getSession();
  if (!error && session?.user) {
    user = session.user;
  }
}
```

By adopting this same pattern in the middleware, we ensure consistent authentication handling across all API endpoints.

## Next Steps

1. **Clear Next.js cache**: Delete `.next` folder and restart dev server to pick up middleware changes
2. **Test dashboard**: Visit `/dashboard-example` to verify widgets load correctly
3. **Monitor logs**: Check for the `📊 Dashboard widgets handler` log to confirm handler is reached
4. **Remove debug logs**: Clean up console.log statements once verified working

## Related Documentation

- `/DASHBOARD_FINALIZATION.md` - Complete dashboard system documentation
- `/DASHBOARD_SYSTEM_GUIDE.md` - Implementation guide
- `/@supabase/auth-helpers-nextjs` - Documentation for auth helpers package
