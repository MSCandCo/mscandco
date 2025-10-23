# Releases RLS Final Fix

## Issue
Even after running the RLS SQL script, the artist releases API was still getting "permission denied" errors.

## Root Cause
The API was not properly setting the auth session context for Supabase. The RLS policies check `auth.uid()`, but without a properly set session, `auth.uid()` returns `null`, causing all queries to fail.

## The Problem in the API

**Before (WRONG):**
```javascript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    global: {
      headers: {
        Authorization: `Bearer ${token}`  // ❌ This doesn't set auth.uid()
      }
    }
  }
);
```

Setting the Authorization header is not enough. The Supabase client needs to have the session properly set for RLS to work.

## The Solution

**After (CORRECT):**
```javascript
// 1. Create client with anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 2. Get user from token
const { data: { user }, error: userError } = await supabase.auth.getUser(token);

// 3. Set the session (CRITICAL for RLS)
await supabase.auth.setSession({
  access_token: token,
  refresh_token: ''
});

// 4. Now queries will work with RLS because auth.uid() is set
const { data: releases } = await supabase
  .from('releases')
  .select('*')
  .eq('artist_id', user.id);
```

## What Changed

### File: `pages/api/artist/releases-simple.js`

1. **Removed** the Authorization header from client creation
2. **Added** `await supabase.auth.setSession()` call
3. This properly sets the auth context so `auth.uid()` works in RLS policies

## How RLS Works

RLS policies use `auth.uid()` to get the current authenticated user's ID:

```sql
CREATE POLICY "Enable read access for authenticated users"
ON releases
FOR SELECT
TO authenticated
USING (
  artist_id = auth.uid()  -- ✅ This now works!
);
```

Without `setSession()`, `auth.uid()` returns `null`, and the policy fails.

## Steps to Complete the Fix

1. ✅ **Code Fix** - Updated `pages/api/artist/releases-simple.js` (done)
2. ⚠️ **SQL Fix** - Run `fix-releases-rls-v2.sql` in Supabase SQL Editor
3. 🔄 **Test** - Refresh browser and check if releases load

## Expected Result

**After both fixes:**
1. Artist logs in
2. Navigates to `/artist/releases`
3. API calls `/api/artist/releases-simple` with auth token
4. API sets session with `setSession()`
5. RLS policy allows query because `auth.uid()` matches `artist_id`
6. Returns 2 releases
7. Page displays releases ✅

## Files Modified
- ✅ `pages/api/artist/releases-simple.js` - Added `setSession()` call
- ⚠️ `fix-releases-rls-v2.sql` - New SQL script (needs to be run)

## Testing
1. **Run the new SQL script:** `fix-releases-rls-v2.sql`
2. **Refresh the browser**
3. **Check server logs** for:
   ```
   📋 Fetching releases for artist: 0a060de5-1c94-4060-a1c2-860224fc348d
   ✅ Found 2 releases
   ```
4. **Verify releases appear** on the page

## Status
✅ **Code Fixed** - API now properly sets auth session  
⚠️ **SQL Needed** - Run `fix-releases-rls-v2.sql` to update RLS policies  
🔄 **Ready to Test** - After running SQL, releases should load!

