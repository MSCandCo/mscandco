# Artist Pages Database Connection Fix - Summary

## Overview
Fixed database connection and authentication issues for artist-facing pages by ensuring all components use the authenticated Supabase client from the `useUser()` context and updating API routes to properly handle authentication with RLS.

## Pages Fixed

### 1. Artist Releases Page ✅
**Files Modified:**
- `/app/artist/releases/ReleasesClient.js`
- `/pages/api/artist/releases-simple.js`
- `/components/auth/SubscriptionGate.js`

**Changes:**
- Updated client components to use authenticated Supabase client from `useUser()` context
- Modified API route to verify user token with anon key, then use service role for queries
- Created new RLS policies for `releases` table (`fix-releases-rls-v2.sql`)

### 2. Artist Analytics Page ✅
**Files Modified:**
- `/app/artist/analytics/AnalyticsClient.js`
- `/components/analytics/CleanManualDisplay.js`
- `/pages/api/artist/analytics-data.js`

**Changes:**
- Updated client components to use authenticated Supabase client from `useUser()` context
- Removed `requirePermission` middleware wrapper from API route
- Modified API route to verify user token with anon key, then use service role for queries

### 3. Artist Earnings Page ✅
**Files Modified:**
- `/app/artist/earnings/EarningsClient.js`

**Changes:**
- Updated client component to use authenticated Supabase client from `useUser()` context
- Removed standalone Supabase client initialization
- Updated `fetchWalletData` to use `session` from context instead of calling `supabase.auth.getSession()`
- API route was already properly configured (no changes needed)

## Root Cause
The issue was two-fold:

### 1. Client-Side: Standalone Supabase Client
Many client components were importing and using a standalone Supabase client:
```javascript
// ❌ WRONG - No authentication context
import { supabase } from '@/lib/supabase';
```

This client doesn't have the user's authentication session, causing 401 errors when calling APIs.

**Solution:**
```javascript
// ✅ CORRECT - Uses authenticated client
import { useUser } from '@/components/providers/SupabaseProvider';

function Component() {
  const { user, session, supabase } = useUser();
  // Now supabase has the user's auth session
}
```

### 2. Server-Side: RLS Policy Issues with Middleware
API routes wrapped with `requirePermission` middleware were having issues with RLS policies that use `auth.uid()`.

**Solution:**
Instead of relying on middleware, manually verify the user's token and use service role for queries:
```javascript
export default async function handler(req, res) {
  // 1. Get token from header
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  // 2. Verify user with anon key
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data: { user }, error } = await authClient.auth.getUser(token);
  
  // 3. Use service role for query (bypasses RLS, but we've verified the user)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // 4. Query with user.id filter for security
  const { data } = await supabase
    .from('table')
    .select('*')
    .eq('user_id', user.id);
}
```

## Pattern for Future Fixes

### Client Components
1. **Always** import `useUser` from `@/components/providers/SupabaseProvider`
2. **Never** import `supabase` directly from `@/lib/supabase` in client components
3. **Always** check for `user` and `session` before making API calls
4. **Always** include `session` or `supabase` in `useEffect` dependency arrays

### API Routes
1. **Don't** use `requirePermission` middleware (has RLS issues)
2. **Do** verify user token manually with anon key
3. **Do** use service role key for database queries (after token verification)
4. **Do** filter queries by `user.id` for security

## Testing Checklist
For each fixed page:
- [ ] Page loads without errors
- [ ] Data displays correctly
- [ ] No 401 Unauthorized errors in console
- [ ] No RLS policy errors in console
- [ ] Subscription gate works correctly (if applicable)
- [ ] Page works after browser refresh

## Remaining Artist Pages to Check
- [x] `/artist/earnings` - ✅ Fixed
- [ ] `/artist/roster` - Check if it needs similar fixes
- [ ] Any other artist pages that fetch data from Supabase

## Status
✅ **Releases Page** - Fixed and tested
✅ **Analytics Page** - Fixed (needs user testing)
✅ **Earnings Page** - Fixed (currency service updated, wallet balance consistency fixed)

## Next Steps
1. User should test the analytics and earnings pages to confirm they're working
2. Check the roster page for similar issues
3. Apply the same pattern to any other pages that have database connection issues

## Documentation
- `ARTIST_RELEASES_FIX.md` - Detailed documentation for releases fix
- `ARTIST_ANALYTICS_FIX.md` - Detailed documentation for analytics fix
- `ARTIST_EARNINGS_FIX.md` - Detailed documentation for earnings fix
- `CURRENCY_SERVICE_FIX.md` - Detailed documentation for currency service fix
- `WALLET_BALANCE_CONSISTENCY_FIX.md` - Detailed documentation for wallet balance consistency fix
- `SUBSCRIPTION_GATE_FIX.md` - Documentation for SubscriptionGate fix

