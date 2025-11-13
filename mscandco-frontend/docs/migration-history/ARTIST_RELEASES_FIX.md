# Artist Releases Database Connection Fix

## Issue
The artist releases page is not showing releases from the database. The page shows "0" releases even though there should be 2 draft releases visible on staging.

## Root Cause
**RLS (Row Level Security) Permission Error:**
```
❌ Database error: { message: 'permission denied for table releases' }
GET /api/artist/releases-simple 500 in 536ms
```

The `releases` table has RLS enabled, but there are no policies allowing artists to read their own releases.

## Server Logs
```
📋 Fetching releases for artist: 0a060de5-1c94-4060-a1c2-860224fc348d
❌ Database error: { message: 'permission denied for table releases' }
```

## Solution
Create RLS policies for the `releases` table to allow:
1. Artists to view their own releases (`artist_id = auth.uid()`)
2. Artists to create their own releases
3. Artists to update their own releases
4. Artists to delete their own draft releases
5. Admins and distribution partners to view/update all releases

## SQL Script
Run `fix-releases-rls.sql` in Supabase SQL Editor to:
- Enable RLS on releases table
- Create 4 policies for artists (SELECT, INSERT, UPDATE, DELETE)
- Allow admins to view/update all releases
- Verify policies were created correctly

## Policies to Create

### 1. Artists can view their own releases
```sql
CREATE POLICY "Artists can view their own releases"
ON releases
FOR SELECT
TO authenticated
USING (
  artist_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'company_admin', 'distribution_partner', 'labeladmin')
  )
);
```

### 2. Artists can create their own releases
```sql
CREATE POLICY "Artists can create their own releases"
ON releases
FOR INSERT
TO authenticated
WITH CHECK (artist_id = auth.uid());
```

### 3. Artists can update their own releases
```sql
CREATE POLICY "Artists can update their own releases"
ON releases
FOR UPDATE
TO authenticated
USING (artist_id = auth.uid() OR [admin check])
WITH CHECK (artist_id = auth.uid() OR [admin check]);
```

### 4. Artists can delete their own draft releases
```sql
CREATE POLICY "Artists can delete their own draft releases"
ON releases
FOR DELETE
TO authenticated
USING (
  artist_id = auth.uid() AND status = 'draft'
  OR [admin check]
);
```

## How the API Works

### Client Side (`ReleasesClient.js`)
```javascript
// Line 403: Fetch releases from API
const releasesResponse = await fetch('/api/artist/releases-simple', {
  headers: token ? { 'Authorization': `Bearer ${token}` } : {}
});
```

### API Route (`/api/artist/releases-simple.js`)
```javascript
// Line 42: Query releases with RLS
const { data: releases, error } = await supabase
  .from('releases')
  .select('*')
  .eq('artist_id', user.id)  // Filter by artist
  .order('created_at', { ascending: false });
```

## Expected Behavior After Fix

1. Artist logs in as `info@htay.co.uk`
2. Navigates to `/artist/releases`
3. API calls `/api/artist/releases-simple` with auth token
4. API queries `releases` table with `artist_id = user.id`
5. RLS policy allows the query because `artist_id = auth.uid()`
6. Returns 2 draft releases
7. Page displays the releases

## Testing Steps

1. **Run the SQL script** in Supabase SQL Editor
2. **Verify policies** were created (check output of script)
3. **Refresh the artist releases page** in browser
4. **Check server logs** for success:
   ```
   📋 Fetching releases for artist: 0a060de5-1c94-4060-a1c2-860224fc348d
   ✅ Found 2 releases
   ```
5. **Verify releases appear** on the page

## Files Involved

- ✅ `app/artist/releases/ReleasesClient.js` - Client component (already correct)
- ✅ `pages/api/artist/releases-simple.js` - API route (already correct)
- ⚠️ **Database RLS policies** - Need to be created

## Status
- ❌ **Current**: RLS policies missing → Permission denied
- ✅ **After Fix**: RLS policies in place → Releases load correctly

## Next Step
**Run `fix-releases-rls.sql` in Supabase SQL Editor** to create the missing RLS policies.

