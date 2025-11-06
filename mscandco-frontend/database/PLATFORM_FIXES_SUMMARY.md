# Platform Fixes Summary

## Issues Fixed

### 1. ✅ onboarding_progress RLS Policies
**Problem**: Authenticated users couldn't INSERT into `onboarding_progress` table, causing Apollo onboarding to fail.

**Solution**: Added INSERT policy for authenticated users in `database/fix-onboarding-rls.sql`

**SQL to Run**:
```sql
-- Run this in Supabase SQL Editor
-- See: database/fix-onboarding-rls.sql
```

### 2. ✅ artist_requests Table Schema Mismatch
**Problem**: API was querying columns that didn't exist (`requested_by_user_id`, `requested_by_email`, etc.)

**Solution**: Updated `/app/api/admin/artist-requests/route.js` to use actual table columns:
- `from_label_id` (instead of `requested_by_user_id`)
- `label_admin_name`, `label_admin_email` (instead of `requested_by_email`, `label_name`)
- `message` (instead of `notes`)
- `status` values: 'pending', 'accepted', 'declined' (mapped from 'pending', 'approved', 'rejected')

**Files Changed**:
- `app/api/admin/artist-requests/route.js`

### 3. ✅ Missing Asset Library API Routes
**Problem**: Asset library page was calling `/api/admin/assetlibrary` and `/api/admin/assetlibrary/stats` but these routes didn't exist.

**Solution**: Created both API routes:
- `/app/api/admin/assetlibrary/route.js` - Lists files from Supabase Storage `asset-library` bucket
- `/app/api/admin/assetlibrary/stats/route.js` - Returns statistics about files

**Files Created**:
- `app/api/admin/assetlibrary/route.js`
- `app/api/admin/assetlibrary/stats/route.js`

**Note**: These routes require:
1. Supabase Storage bucket named `asset-library` to exist
2. User must have admin role (`super_admin`, `company_admin`, or `label_admin`)

### 4. ✅ Login Page Client-Side bcrypt Import
**Problem**: `bcryptjs` was imported client-side in `app/login/page.js`, which won't work (bcrypt is Node.js only).

**Solution**: Removed `bcryptjs` import and simplified recovery code verification (currently shows a message that recovery codes need server-side implementation).

**Files Changed**:
- `app/login/page.js`

## Next Steps

1. **Run SQL Migration**: Execute `database/fix-onboarding-rls.sql` in Supabase SQL Editor
2. **Verify Asset Library Bucket**: Ensure `asset-library` bucket exists in Supabase Storage
3. **Test Asset Library**: Navigate to `/admin/assetlibrary` and verify files load
4. **Test Artist Requests**: Verify `/api/admin/artist-requests` returns data correctly
5. **Test Apollo Onboarding**: Verify new users can go through onboarding

## Testing Checklist

- [ ] Run `fix-onboarding-rls.sql` in Supabase
- [ ] Test asset library page loads files
- [ ] Test artist requests API returns correct data
- [ ] Test Apollo onboarding creates records
- [ ] Test login page works without bcrypt errors

