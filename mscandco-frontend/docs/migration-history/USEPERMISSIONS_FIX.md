# usePermissions Hook Fix

## Problem
The `usePermissions` hook was returning an empty permissions array for all users (including company_admin), causing the AdminHeader dropdowns to be blank.

## Root Cause
The `usePermissions` hook was importing and using the **standalone** Supabase client from `@/lib/supabase`:

```javascript
import { supabase } from '@/lib/supabase';
```

This standalone client does not have access to the authenticated user's session, so when it tried to call `/api/user/permissions`, the API couldn't authenticate the request properly.

## Solution
Changed `usePermissions` hook to use the **authenticated** Supabase client from the `useUser` context:

```javascript
import { useUser } from '@/contexts/UserContext';

export function usePermissions(userId = null) {
  const { user: contextUser, session: contextSession, supabase } = useUser();
  // ... rest of hook
}
```

### Changes Made:
1. **Import**: Changed from `import { supabase } from '@/lib/supabase'` to `import { useUser } from '@/contexts/UserContext'`
2. **Get Supabase Client**: Added `const { user: contextUser, session: contextSession, supabase } = useUser();` at the top of the hook
3. **Wait for Client**: Added check `if (!supabase) return;` in `fetchPermissions` to wait for the client to be available
4. **Updated Dependencies**: Added `supabase` to all relevant dependency arrays in `useCallback` and `useEffect`

## Files Modified
- `/hooks/usePermissions.js` - Fixed to use authenticated Supabase client from context

## Testing
After this fix:
1. The `/api/user/permissions` endpoint should be called successfully
2. Server logs should show `🔑 /api/user/permissions - Request received`
3. The `usePermissions` hook should return the correct permissions array
4. AdminHeader dropdowns should populate correctly based on user permissions
5. Company admin users should see only the pages they have permissions for

## Why This Matters
This is the **same pattern** we've fixed in multiple components:
- `AdminHeader.js` ✅
- `header.js` ✅
- `ReleasesClient.js` ✅
- `usePermissions.js` ✅ (just fixed)

**Rule**: Always use the authenticated Supabase client from `useUser()` context in client components, never import the standalone client directly.

## Next Steps
1. Refresh the browser and log in as company_admin
2. Check browser console for `🔑 usePermissions: Fetching permissions from API...`
3. Check server logs for `🔑 /api/user/permissions - Request received`
4. Verify that the AdminHeader shows the correct dropdowns based on permissions

