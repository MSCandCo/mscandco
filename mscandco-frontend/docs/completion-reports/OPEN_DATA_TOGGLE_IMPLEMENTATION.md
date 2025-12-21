# Open Data Toggle Implementation

This document describes the implementation of the Open Data toggle feature, which allows users to show/hide the Open Data link in the header navigation.

## Overview

The Open Data toggle feature mirrors the existing Accessibility Features toggle functionality. Users can control whether the "Open Data" link appears in their navigation header through their settings page.

## Implementation Details

### 1. Database Schema
**File**: `database/migrations/add_open_data_preference.sql`

Added a new column to the `user_profiles` table:
```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_open_data_features BOOLEAN DEFAULT false;
```

**Note**: This migration needs to be run manually in the Supabase SQL Editor.

### 2. API Routes Updated

#### Artist Settings API
**File**: `app/api/artist/settings/preferences/route.js`

- **GET endpoint**: Returns `showOpenDataFeatures` preference
- **POST endpoint**: Accepts and saves `showOpenDataFeatures` preference

#### Label Admin Settings API
**File**: `app/api/labeladmin/settings/preferences/route.js`

- **GET endpoint**: Returns `showOpenDataFeatures` preference
- **POST endpoint**: Accepts and saves `showOpenDataFeatures` preference

### 3. Settings UI Updated

#### Artist Settings Client
**File**: `app/artist/settings/SettingsClient.js`

Added:
- `showOpenDataFeatures` to preferences state (line 148)
- Open Data Features toggle UI (lines 606-635)

#### Label Admin Settings Client
**File**: `app/labeladmin/settings/SettingsClient.js`

Added:
- `showOpenDataFeatures` to preferences state (line 149)
- Open Data Features toggle UI (lines 612-641)

### 4. Header Navigation Updated
**File**: `components/header.js`

Changes:
- Added `showOpenDataLink` state (line 22)
- Fetch `showOpenDataFeatures` from preferences API (line 151)
- Conditionally show Open Data link in artist navigation (line 499)
- Conditionally show Open Data link in label admin navigation (line 602)

## How It Works

1. **User toggles the setting**: On the settings page, users can toggle "Open Data Features" on/off
2. **Preference is saved**: The toggle state is saved to `user_profiles.show_open_data_features`
3. **Header updates**: The header fetches preferences and shows/hides the Open Data link based on the preference
4. **Page reload**: After saving, the page reloads to refresh the header with the new setting

## Testing Steps

1. **Run the database migration**:
   - Open Supabase SQL Editor
   - Run the SQL from `database/migrations/add_open_data_preference.sql`

2. **Test as Artist**:
   - Login as an artist
   - Navigate to Settings → Preferences tab
   - Toggle "Open Data Features" on
   - Click Save
   - Verify the Open Data link appears in the header after page reload
   - Toggle off, save, and verify the link disappears

3. **Test as Label Admin**:
   - Login as a label admin
   - Navigate to Settings → Preferences tab
   - Toggle "Open Data Features" on
   - Click Save
   - Verify the Open Data link appears in the header after page reload

## Files Modified

1. `database/migrations/add_open_data_preference.sql` (new)
2. `scripts/add-open-data-column.js` (new - migration helper)
3. `app/api/artist/settings/preferences/route.js`
4. `app/api/labeladmin/settings/preferences/route.js`
5. `app/artist/settings/SettingsClient.js`
6. `app/labeladmin/settings/SettingsClient.js`
7. `components/header.js`

## Migration Status

⚠️ **IMPORTANT**: The database migration has NOT been applied yet. You need to manually run the SQL in Supabase:

```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_open_data_features BOOLEAN DEFAULT false;

COMMENT ON COLUMN user_profiles.show_open_data_features IS 'Whether to show Open Data link in navigation';
```

## Default Behavior

- By default, `show_open_data_features` is `false`
- Users must explicitly enable the Open Data link through settings
- This matches the behavior of the Accessibility Features toggle
