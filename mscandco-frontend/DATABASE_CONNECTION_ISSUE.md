# Database Connection Issue - App Router vs Pages Router

## Problem
- **Staging (Pages Router)**: https://staging.mscandco.com/artist/releases ✅ WORKS - Shows releases
- **Localhost (App Router)**: http://localhost:3013/artist/releases ❌ BLANK - No releases showing

## Root Cause Analysis

### ✅ What's Working
1. **App Router page structure** (`app/artist/releases/page.js`) - Exists and correct
2. **Client component** (`app/artist/releases/ReleasesClient.js`) - Has all the database fetch logic (lines 382-396)
3. **API endpoint** (`pages/api/artist/releases.js`) - Exists and has correct Supabase queries
4. **Database queries** - The code fetches from `/api/artist/releases` correctly

### ❌ What's NOT Working
The releases are not loading on localhost. The `ReleasesClient.js` has this code:

```javascript
// Line 382-396 in ReleasesClient.js
const releasesResponse = await fetch('/api/artist/releases', {
  headers: token ? { 'Authorization': `Bearer ${token}` } : {}
});
if (releasesResponse.ok) {
  const artistReleases = await releasesResponse.json();
  console.log(`✅ Loaded ${artistReleases.length} releases from database`);
  setReleases(artistReleases);
} else {
  console.error('❌ Failed to load releases from database, using fallback');
  // Fallback to mock data if API fails
  const artistReleases = getReleasesByArtist('msc_co');
  setReleases(artistReleases);
}
```

## Possible Causes

### 1. **API Route Not Accessible in App Router**
- Pages Router API routes (`pages/api/*`) should still work in App Router
- But there might be a routing conflict or middleware issue

### 2. **Authentication Token Issue**
- The token might not be passed correctly
- RLS policies might be blocking the query
- Session might not be established properly

### 3. **Environment Variables**
- `NEXT_PUBLIC_SUPABASE_URL` might not be set on localhost
- `SUPABASE_SERVICE_ROLE_KEY` might not be set

### 4. **CORS or Network Issue**
- Localhost might have CORS restrictions
- The fetch might be failing silently

## How to Debug

### Step 1: Check Browser Console
Open localhost:3013/artist/releases and check console for:
```
📋 Fetching releases from database...
✅ Loaded X releases from database
```
OR
```
❌ Failed to load releases from database, using fallback
```

### Step 2: Check Network Tab
- Look for the request to `/api/artist/releases`
- Check if it returns 200 OK or an error
- Check the response body

### Step 3: Check Terminal Logs
Look for these logs in the Next.js terminal:
```
📋 Fetching releases for artist: [user-id]
✅ Found X releases for artist [user-id]
```

### Step 4: Test API Directly
Try accessing the API directly in browser:
```
http://localhost:3013/api/artist/releases
```

## Quick Fix Options

### Option A: Use Direct Supabase Query (Bypass API)
Replace the fetch call with direct Supabase query in `ReleasesClient.js`:

```javascript
const { data: releases, error } = await supabase
  .from('releases')
  .select('*')
  .eq('artist_id', user.id)
  .order('created_at', { ascending: false });

if (!error && releases) {
  setReleases(releases);
}
```

### Option B: Check Environment Variables
Make sure `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Option C: Add Error Logging
Add more detailed logging to see exactly what's failing:

```javascript
const releasesResponse = await fetch('/api/artist/releases', {
  headers: token ? { 'Authorization': `Bearer ${token}` } : {}
});

console.log('API Response Status:', releasesResponse.status);
console.log('API Response OK:', releasesResponse.ok);

if (!releasesResponse.ok) {
  const errorText = await releasesResponse.text();
  console.error('API Error Response:', errorText);
}
```

## Expected Behavior
Once fixed, you should see:
1. Console log: `📋 Fetching releases from database...`
2. Console log: `✅ Loaded X releases from database`
3. Releases displayed on the page (cards or list)

## Files to Check
1. `/app/artist/releases/ReleasesClient.js` - Client component with fetch logic
2. `/pages/api/artist/releases.js` - API endpoint
3. `.env.local` - Environment variables
4. Browser console - Network requests and errors
5. Terminal logs - Server-side errors

---

**Next Step**: Check the browser console and network tab to see what error is occurring when fetching releases.


