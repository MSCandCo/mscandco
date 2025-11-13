# Artist Earnings Page Fix

## Issue
The artist earnings page needed to be updated to use the authenticated Supabase client from the `useUser()` context instead of a standalone client.

## Root Cause
The `EarningsClient.js` component was using a standalone Supabase client created at the module level:
```javascript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

This client doesn't have the user's authentication session, which could cause issues with session management and authentication state.

## Solution Applied

### 1. API Route Status
The `/api/artist/wallet-simple` endpoint was already properly configured:
- ✅ Verifies user token with anon key first
- ✅ Uses service role key for database queries (after authentication)
- ✅ Filters data by `artist_id` for security
- **No changes needed** to the API route

### 2. Client Component Fix (`app/artist/earnings/EarningsClient.js`)

**Key Changes:**
```javascript
// Before: Used standalone Supabase client
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function EarningsClient({ user }) {
  const fetchWalletData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    // ...
  };
}

// After: Uses authenticated client from context
import { useUser } from '@/components/providers/SupabaseProvider';

export default function EarningsClient({ user: serverUser }) {
  const { user, session } = useUser();
  const currentUser = user || serverUser;
  
  const fetchWalletData = async () => {
    if (!session) {
      throw new Error('Authentication required. Please log in again.');
    }
    const token = session.access_token;
    // ...
  };
  
  useEffect(() => {
    if (session) {
      fetchWalletData();
      fetchLiveExchangeRates();
    }
  }, [session]);
}
```

**Specific Updates:**
1. **Import Change**: Replaced `createClient` import with `useUser` from `@/components/providers/SupabaseProvider`
2. **Removed Standalone Client**: Deleted the module-level `supabase` client initialization
3. **Component Updates**:
   - Renamed prop `user` to `serverUser`
   - Added `const { user, session } = useUser()`
   - Created `currentUser` variable with fallback logic
4. **fetchWalletData Function**:
   - Removed `await supabase.auth.getSession()` call
   - Now uses `session` directly from context
   - Added early return if `session` is not available
5. **useEffect Update**:
   - Added `session` check before calling `fetchWalletData()`
   - Updated dependency array from `[]` to `[session]`

## Testing
After these changes:
1. Refresh the browser to clear any cached authentication state
2. Navigate to `/artist/earnings` as an artist user
3. Wallet data should load successfully
4. Currency conversion should work correctly
5. Payout requests should function properly

## Related Files
- `/pages/api/artist/wallet-simple.js` - API route (already properly configured)
- `/app/artist/earnings/EarningsClient.js` - Main earnings page client component (updated)
- `/app/artist/earnings/page.js` - Server component (no changes needed)

## Pattern Consistency
This fix follows the same pattern applied to:
- ✅ Artist Releases Page
- ✅ Artist Analytics Page
- ✅ Artist Earnings Page (this fix)

All artist pages now consistently use the authenticated Supabase client from the `useUser()` context.

## Status
✅ **COMPLETE** - Earnings page should now use proper authentication context

