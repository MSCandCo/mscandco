# Community Features Toggle Implementation

Complete implementation of toggles for all community features in the MSC & Co platform.

## Overview

Users can now control the visibility of all community feature links in their navigation header through their settings page. This includes:

1. ✅ Accessibility Features
2. ✅ Open Data Features
3. ✅ Sustainability Features
4. ✅ Lyrics Analysis Features
5. ✅ Copyright Features
6. ✅ Learning Features

## Database Schema

**Migration File**: `database/migrations/add_community_feature_preferences.sql`

### New Columns Added to `user_profiles`:

```sql
-- Sustainability features
show_sustainability_features BOOLEAN DEFAULT false

-- Lyrics Analysis features
show_lyrics_features BOOLEAN DEFAULT false

-- Copyright features
show_copyright_features BOOLEAN DEFAULT false

-- Learning features
show_learning_features BOOLEAN DEFAULT false
```

**Note**: `show_accessibility_features` and `show_open_data_features` were added in previous migrations.

## Implementation Details

### 1. API Routes

Both artist and label admin preference APIs have been updated:

- **`app/api/artist/settings/preferences/route.js`**
- **`app/api/labeladmin/settings/preferences/route.js`**

**GET Endpoint Returns**:
```javascript
{
  showAccessibilityFeatures: boolean,
  showOpenDataFeatures: boolean,
  showSustainabilityFeatures: boolean,
  showLyricsFeatures: boolean,
  showCopyrightFeatures: boolean,
  showLearningFeatures: boolean
}
```

**POST Endpoint Accepts**:
All the same fields as above for saving preferences.

### 2. Settings UI

#### Artist Settings (`app/artist/settings/SettingsClient.js`)

Added 6 toggle switches in the Preferences tab:
- Accessibility Features (lines 575-604)
- Open Data Features (lines 610-639)
- Sustainability Features (lines 641-670)
- Lyrics Analysis Features (lines 672-701)
- Copyright Features (lines 703-732)
- Learning Features (lines 734-763)

#### Label Admin Settings (`app/labeladmin/settings/SettingsClient.js`)

Added 6 toggle switches in the Preferences tab:
- Accessibility Features (lines 581-610)
- Open Data Features (lines 616-645)
- Sustainability Features (lines 647-676)
- Lyrics Analysis Features (lines 678-707)
- Copyright Features (lines 709-738)
- Learning Features (lines 740-769)

### 3. Header Navigation (`components/header.js`)

**State Variables Added** (lines 21-26):
```javascript
const [showAccessibilityLink, setShowAccessibilityLink] = useState(false);
const [showOpenDataLink, setShowOpenDataLink] = useState(false);
const [showSustainabilityLink, setShowSustainabilityLink] = useState(false);
const [showLyricsLink, setShowLyricsLink] = useState(false);
const [showCopyrightLink, setShowCopyrightLink] = useState(false);
const [showLearningLink, setShowLearningLink] = useState(false);
```

**Preferences Fetch** (lines 149-163):
Fetches all toggle preferences from the API and sets state.

**Artist Navigation** (lines 485-516):
Community features array now checks both permission AND toggle state:
```javascript
hasSustainabilityPermission && showSustainabilityLink && { ... }
hasLyricsPermission && showLyricsLink && { ... }
hasCopyrightPermission && showCopyrightLink && { ... }
hasLearningPermission && showLearningLink && { ... }
```

**Label Admin Navigation** (lines 602-619):
Same conditional logic applied for label admin links.

## How It Works

1. **User navigates to Settings → Preferences**
2. **User toggles community features on/off**
3. **User clicks Save**
4. **Page reloads automatically**
5. **Header fetches updated preferences**
6. **Links appear/disappear based on toggles**

## Permission + Toggle Logic

For a community link to appear in the header, the user must have:
1. ✅ The required permission (e.g., `sustainability:track`)
2. ✅ The toggle enabled in settings (e.g., `showSustainabilityFeatures: true`)

Both conditions must be true for the link to display.

## Files Modified

### Database
1. `database/migrations/add_community_feature_preferences.sql` (new)
2. `database/migrations/add_open_data_preference.sql` (previous)

### API Routes
3. `app/api/artist/settings/preferences/route.js`
4. `app/api/labeladmin/settings/preferences/route.js`

### Settings UI
5. `app/artist/settings/SettingsClient.js`
6. `app/labeladmin/settings/SettingsClient.js`

### Navigation
7. `components/header.js`

## Migration Required

⚠️ **IMPORTANT**: Run this SQL in Supabase SQL Editor before testing:

```sql
-- Add community feature preferences to user_profiles table

-- Sustainability features
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_sustainability_features BOOLEAN DEFAULT false;

-- Lyrics Analysis features
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_lyrics_features BOOLEAN DEFAULT false;

-- Copyright features
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_copyright_features BOOLEAN DEFAULT false;

-- Learning features
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_learning_features BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.show_sustainability_features IS 'Whether to show Sustainability link in navigation';
COMMENT ON COLUMN user_profiles.show_lyrics_features IS 'Whether to show Lyrics Analysis link in navigation';
COMMENT ON COLUMN user_profiles.show_copyright_features IS 'Whether to show Copyright link in navigation';
COMMENT ON COLUMN user_profiles.show_learning_features IS 'Whether to show Learning link in navigation';
```

## Testing Steps

1. **Run both SQL migrations**:
   - `add_open_data_preference.sql`
   - `add_community_feature_preferences.sql`

2. **Test as Artist**:
   - Login as artist
   - Go to Settings → Preferences
   - Toggle each community feature on/off
   - Click Save
   - Verify links appear/disappear in header after reload

3. **Test as Label Admin**:
   - Login as label admin
   - Go to Settings → Preferences
   - Toggle each community feature on/off
   - Click Save
   - Verify links appear/disappear in header after reload

4. **Test Permission Logic**:
   - User without permission should NOT see link even if toggle is on
   - User with permission should see link only if toggle is on

## Default Behavior

All community feature toggles default to `false`:
- Users must explicitly enable each feature through settings
- This gives users full control over their navigation experience
- Reduces clutter for users who don't use certain features

## Benefits

1. **Personalized Navigation**: Users only see links they actually use
2. **Cleaner Interface**: Reduces navigation clutter
3. **User Control**: Full control over their workspace
4. **Progressive Disclosure**: Users can discover features at their own pace
5. **Role-Based + Preference-Based**: Combines permissions with user preferences
