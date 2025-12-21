# Community Features Setup Instructions

## Complete Implementation Summary

All code changes have been completed for the community features toggle system. This allows users to control which community feature links appear in their navigation header through Settings → Preferences.

## What's Been Implemented

### 1. Database Schema (Ready to Run)
- 6 preference columns for `user_profiles` table
- 6 permissions in `permissions` table
- Role assignments for both `artist` and `label_admin` roles

### 2. API Routes (Complete ✅)
- `app/api/artist/settings/preferences/route.js` - Handles all 6 preferences
- `app/api/labeladmin/settings/preferences/route.js` - Handles all 6 preferences

### 3. Settings UI (Complete ✅)
- `app/artist/settings/SettingsClient.js` - 6 toggle switches
- `app/labeladmin/settings/SettingsClient.js` - 6 toggle switches

### 4. Header Navigation (Complete ✅)
- `components/header.js` - Permission + preference checks for all 6 features

## Features Covered

1. **Accessibility** - `accessibility:use` permission
2. **Open Data** - `features:open_data:use` permission
3. **Sustainability** - `sustainability:track` permission
4. **Lyrics Analysis** - `features:lyrics:use` permission
5. **Copyright** - `features:copyright:use` permission
6. **Learning** - `learning:access` permission

## Required: Run Database Migration

**YOU MUST RUN THIS STEP** for the features to work:

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Run the Migration

1. Open the file: `database/migrations/RUN_THIS_IN_SUPABASE_SQL_EDITOR.sql`
2. Copy the ENTIRE contents
3. Paste into the Supabase SQL Editor
4. Click "Run" button

### Step 3: Verify Success

After running, you should see 4 result sets at the bottom:

1. **6 columns** in user_profiles (all the show_*_features columns)
2. **6 permissions** in the permissions table
3. **6 permissions** assigned to artist role
4. **6 permissions** assigned to label_admin role

You should also see NOTICE messages:
- "Successfully assigned all permissions to artist role"
- "Successfully assigned all permissions to label_admin role"

## Testing the Features

### Test as Artist:

1. Login as an artist user
2. Go to Settings → Preferences
3. You should see 6 toggle switches:
   - Accessibility Features
   - Open Data Features
   - Sustainability Features
   - Lyrics Analysis Features
   - Copyright Features
   - Learning Features
4. Toggle any feature ON
5. Click "Save Preferences"
6. Page will reload
7. Check the header - the link should now appear in "Community" dropdown

### Test as Label Admin:

Same steps as artist, but login as label admin user.

## How It Works

For a community link to appear in the header, the user must have:

1. ✅ **Permission** - Assigned via `role_permissions` table
2. ✅ **Toggle Enabled** - Set to `true` in `user_profiles` table via Settings

Both conditions must be true:
```javascript
hasPermission && showToggle
```

## Default Behavior

All toggles default to `false`, meaning:
- Users won't see any community links by default
- They must explicitly enable features they want to use
- This gives users full control over their navigation

## File Locations

### Database Migration
- `database/migrations/RUN_THIS_IN_SUPABASE_SQL_EDITOR.sql` ⬅️ **RUN THIS**

### API Routes
- `app/api/artist/settings/preferences/route.js`
- `app/api/labeladmin/settings/preferences/route.js`

### Settings UI
- `app/artist/settings/SettingsClient.js`
- `app/labeladmin/settings/SettingsClient.js`

### Header Navigation
- `components/header.js`

### Documentation
- `COMMUNITY_FEATURES_TOGGLE_IMPLEMENTATION.md` - Complete technical details
- `OPEN_DATA_TOGGLE_IMPLEMENTATION.md` - Initial Open Data implementation

## Troubleshooting

### Links Don't Appear After Toggling

1. **Check the browser console** for any errors
2. **Verify the migration ran successfully** - Run the verification queries in Supabase SQL Editor
3. **Check user permissions** - Ensure the user's role has the required permission
4. **Hard refresh** the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Toggles Don't Save

1. **Check browser console** for API errors
2. **Verify API routes** are accessible
3. **Check Supabase connection** in the Network tab

### Migration Errors

If you get errors when running the migration:

1. **Check if columns already exist** - The migration uses `IF NOT EXISTS` so it's safe to re-run
2. **Verify roles exist** - The script looks for 'artist' and 'label_admin' roles
3. **Check permissions table** - Ensure the permissions table exists

## Next Steps

1. ✅ Run the database migration (most important!)
2. ✅ Test as artist user
3. ✅ Test as label admin user
4. ✅ Verify links appear/disappear based on toggles
5. ✅ Verify permission logic works (users without permissions can't see links)

## Success Criteria

You'll know it's working when:

- ✅ Settings page shows 6 toggles under Preferences
- ✅ Toggling a feature ON and saving makes the link appear in header
- ✅ Toggling a feature OFF and saving makes the link disappear
- ✅ Page auto-reloads after saving preferences
- ✅ Links only appear if user has BOTH permission AND toggle enabled

## Support

If you encounter any issues, check:
1. Browser console for JavaScript errors
2. Supabase SQL Editor for database errors
3. Network tab for API request/response issues
4. The verification queries in the migration file
