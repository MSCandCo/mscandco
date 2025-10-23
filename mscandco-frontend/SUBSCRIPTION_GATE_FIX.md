# SubscriptionGate Fix - Artist Releases Page

## Issue
The artist releases page is showing the subscription paywall even though:
1. The artist has an active `artist_pro` subscription
2. The RLS policies were successfully created
3. The API successfully returns 2 releases

## Root Cause
The `SubscriptionGate` component was using the **standalone** Supabase client instead of the **authenticated** one from the `useUser()` context.

```javascript
// Before (WRONG):
import { supabase } from '@/lib/supabase';  // ❌ Standalone client
const { user } = useUser();

// After (CORRECT):
const { user, supabase } = useUser();  // ✅ Authenticated client
```

## The Problem
When `SubscriptionGate` calls the subscription API:
```javascript
const { data: { session } } = await supabase.auth.getSession();
```

The standalone client doesn't have the user's session, so:
- `session` is `null`
- `token` is `undefined`
- API call fails or returns no subscription
- User sees paywall instead of releases

## The Fix
Changed `SubscriptionGate.js` to use the authenticated Supabase client from context:

### Changes Made:
1. **Removed standalone import:**
   ```javascript
   - import { supabase } from '@/lib/supabase';
   ```

2. **Get supabase from context:**
   ```javascript
   - const { user } = useUser();
   + const { user, supabase } = useUser();
   ```

3. **Wait for supabase to be available:**
   ```javascript
   - if (!user) {
   + if (!user || !supabase) {
   ```

4. **Added to dependency array:**
   ```javascript
   - }, [user, userRole]);
   + }, [user, userRole, supabase]);
   ```

## Expected Result

**Before Fix:**
1. Artist logs in with `artist_pro` subscription
2. Navigates to `/artist/releases`
3. `SubscriptionGate` checks subscription with standalone client
4. Gets no session → no token → API fails
5. Shows paywall ❌

**After Fix:**
1. Artist logs in with `artist_pro` subscription
2. Navigates to `/artist/releases`
3. `SubscriptionGate` checks subscription with authenticated client
4. Gets valid session → valid token → API succeeds
5. Returns subscription status: `{ hasSubscription: true, isPro: true }`
6. Shows releases page ✅

## Server Logs (Before Fix)
```
Active subscription found: { tier: 'artist_pro', status: 'active', isPro: true }
✅ Profile loaded from database
📋 Fetching releases for artist: 0a060de5-1c94-4060-a1c2-860224fc348d
✅ Found 2 releases
```

The API was working, but `SubscriptionGate` wasn't detecting the subscription!

## Files Modified
- ✅ `components/auth/SubscriptionGate.js` - Fixed to use authenticated Supabase client

## Related Fixes
This is the **same pattern** we've fixed multiple times:
1. ✅ `AdminHeader.js` - Fixed
2. ✅ `header.js` - Fixed
3. ✅ `ReleasesClient.js` - Fixed
4. ✅ `usePermissions.js` - Fixed
5. ✅ `SubscriptionGate.js` - **Just Fixed**

**Rule**: Always use the authenticated Supabase client from `useUser()` context in client components!

## Testing
**Refresh the browser** and:
1. Log in as artist (`info@htay.co.uk`)
2. Navigate to `/artist/releases`
3. Should see the releases page with 2 draft releases
4. No paywall! ✅

## Status
✅ **FIXED** - Artist releases page will now show releases instead of paywall

