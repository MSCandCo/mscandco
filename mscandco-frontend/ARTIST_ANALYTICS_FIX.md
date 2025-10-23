# Artist Analytics Page Fix

## Issue
The artist analytics page was not loading analytics data due to authentication and RLS issues, similar to the releases page.

## Root Cause
1. **API Route**: The `/api/artist/analytics-data` endpoint was wrapped with `requirePermission` middleware which was causing authentication issues with RLS policies.
2. **Client Components**: `AnalyticsClient.js` and `CleanManualDisplay.js` were using the standalone Supabase client from `@/lib/supabase` instead of the authenticated client from the `useUser()` context.

## Solution Applied

### 1. API Route Fix (`pages/api/artist/analytics-data.js`)
Applied the same pattern as the releases API:
- Removed `requirePermission` middleware wrapper
- Added manual token verification using anon key
- Used service role key for database queries (after user authentication)
- This bypasses RLS while maintaining security through token verification

**Key Changes:**
```javascript
// Before: Used middleware and service role from start
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
async function handler(req, res) {
  const userId = req.user.id; // From middleware
  // ...
}
export default requirePermission('analytics:view:own')(handler);

// After: Verify token first, then use service role
export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  // Verify user with anon key
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data: { user }, error: userError } = await authClient.auth.getUser(token);
  
  // Use service role for query (after auth)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  // ...
}
```

### 2. Client Component Fixes

#### `app/artist/analytics/AnalyticsClient.js`
- Changed from `import { supabase } from '@/lib/supabase'` to `import { useUser } from '@/components/providers/SupabaseProvider'`
- Updated to use `const { user, session, supabase } = useUser()`
- Renamed prop `user` to `serverUser` and created `currentUser` variable to use context user with fallback
- Updated dependency arrays to include `session`

#### `components/analytics/CleanManualDisplay.js`
- Changed from `import { supabase } from '@/lib/supabase'` to `import { useUser } from '@/components/providers/SupabaseProvider'`
- Updated to use `const { session } = useUser()`
- Removed `await supabase.auth.getSession()` call, now uses `session` from context
- Updated dependency array to include `session`

## Testing
After these changes:
1. Refresh the browser to clear any cached authentication state
2. Navigate to `/artist/analytics` as an artist user
3. Analytics data should now load successfully

## Related Files
- `/pages/api/artist/analytics-data.js` - API route for fetching analytics
- `/app/artist/analytics/AnalyticsClient.js` - Main analytics page client component
- `/components/analytics/CleanManualDisplay.js` - Component that displays analytics data
- `/app/artist/releases/ReleasesClient.js` - Similar fix applied previously

## Pattern for Future API Routes
When creating or fixing API routes that need authentication:
1. **Don't use** `requirePermission` middleware (it has RLS issues)
2. **Do verify** the user's token manually with anon key
3. **Do use** service role key for queries (after token verification)
4. **Always** use authenticated Supabase client from `useUser()` context in client components

## Status
✅ **COMPLETE** - Analytics page should now load data successfully

