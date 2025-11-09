# 🧠 AI Learning System - Comprehensive Profile & Intelligent Releases

## Overview

The MSC & Co platform now includes an **AI learning system** that:
- Collects comprehensive profile information **once** in the Aiverse
- Learns from your releases (2-3 releases) to make future ones easier
- Uses location and other key data for intelligent interactions
- Avoids redundant questions by remembering what it already knows

## Key Features

### 1. Comprehensive Profile Creation (One-Time Setup)

**When no profile is found**, the system guides users to create a comprehensive profile with this message:

> "🎯 No MSC profile found. Let's set up your comprehensive profile - **this only needs to be done once in the Aiverse!**"

The AI intelligently collects:
- **Location** (country, city) - helps understand market
- **Music info** (genre, artist type, years active)
- **Social media** links - for cross-platform promotion
- **Payment preferences** - for royalty distribution
- **Release preferences** - preferred types, territories

**No redundant questions** - AI knows what to ask based on context.

### 2. Learning from Releases

After **2-3 releases**, the AI learns:
- **Most common genre** - suggests it automatically
- **Preferred release type** - remembers your pattern
- **Release frequency** - suggests optimal release dates
- **Territory preferences** - remembers where you distribute

**Intelligence Levels:**
- **New**: First-time user, collects comprehensive info
- **Learning**: 1-2 releases, starting to learn patterns
- **Experienced**: 3+ releases, uses learned preferences automatically

### 3. Intelligent Defaults

When creating a release, the AI:
- Uses your **most common genre** from previous releases
- Suggests your **preferred release type**
- Remembers your **location** for market insights
- Applies **learned preferences** automatically

### 4. Location Intelligence

The system uses:
- **Detected location** (from IP/browser)
- **Profile location** (country, city)
- **Market insights** based on location
- **Timezone** for release scheduling

## API Endpoints

### `/api/profile/create-comprehensive`
Creates comprehensive profile with all necessary information.

**Features:**
- Parses location strings intelligently
- Handles missing fields gracefully
- Stores learning preferences in `ai_learning_data` JSONB field
- Updates existing profiles if found

### `/api/profile/learning-data?profileId=xxx`
Gets AI learning insights for a profile.

**Returns:**
- Release history analysis
- Most common genres/types
- Suggested defaults
- Intelligence level
- Location data

### `/api/profile/update-learning`
Updates learning data after each release.

**Tracks:**
- Release count
- Common genres
- Last release type/genre
- Release patterns

## Database Schema

### New Column: `ai_learning_data` (JSONB)

Stores:
```json
{
  "releaseCount": 3,
  "lastReleaseDate": "2025-01-09T12:00:00Z",
  "commonGenres": ["Hip-Hop", "R&B"],
  "lastReleaseType": "single",
  "preferredReleaseType": "single",
  "preferredTerritories": ["US", "UK"],
  "conversationContext": "...",
  "createdAt": "2025-01-09T12:00:00Z",
  "updatedAt": "2025-01-09T12:00:00Z"
}
```

## MCP Tools

### `create_comprehensive_profile`
Creates comprehensive profile - only needs to be done once in the Aiverse.

**Input:** All profile fields (email, artistName, location, genre, social media, etc.)

**Output:** Profile created with learning data initialized

### `quick_start_release` (Enhanced)
Now includes:
- Profile matching
- Learning data loading
- Intelligent defaults from previous releases
- Learning data updates after release

## User Experience Flow

1. **User says**: "I want to release music"
2. **If no profile**: 
   - AI explains: "This only needs to be done once in the Aiverse"
   - Collects comprehensive info intelligently
   - No redundant questions
3. **If profile exists**:
   - Loads learning data
   - Uses intelligent defaults
   - Creates release with learned preferences
4. **After release**:
   - Updates learning data
   - Tracks patterns
   - Makes next release easier

## Benefits

✅ **One-time setup** - Comprehensive profile only needed once
✅ **No redundant questions** - AI remembers what it knows
✅ **Learning system** - Gets smarter with each release
✅ **Location intelligence** - Uses location for better insights
✅ **Intelligent defaults** - Suggests based on history
✅ **Better UX** - Easier releases over time

## Migration

Run migration: `20250109000003_add_ai_learning_data.sql`

Adds `ai_learning_data` JSONB column to `user_profiles` table.

