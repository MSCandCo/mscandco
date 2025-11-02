# Apollo Onboarding Implementation Guide

## Overview

This document describes the enhanced Apollo onboarding system that collects and locks personal information during a user's first login to MSC & Co platform.

## Key Features

### 1. **Mandatory One-Time Onboarding**
- New artists and label admins must complete onboarding on first login
- Onboarding modal is non-dismissable until completion
- Modal appears automatically on dashboard load for incomplete profiles

### 2. **Comprehensive Personal Information Collection**

Apollo collects the following information through a conversational flow:

**Personal Information (Locked Fields):**
- First Name
- Last Name
- Date of Birth
- Nationality
- City
- Postal Code
- Phone Number

**Artist Information (Editable):**
- Artist Name
- Primary Genre
- Artist Bio

### 3. **Field Locking for Security**

After onboarding completes, the following fields are **permanently locked**:
- `firstName`
- `lastName`
- `dateOfBirth`
- `nationality`
- `city`
- `postalCode`

These fields can only be changed through a **Profile Change Request** that requires admin approval.

The `immutableDataLocked` flag is set to `true` in the `user_profiles` table when onboarding completes.

## Onboarding Flow

### Stage Progression

1. **welcome** - Greeting + First Name
2. **personal_info_last** - Last Name
3. **personal_info_dob** - Date of Birth (DD/MM/YYYY)
4. **personal_info_nationality** - Nationality
5. **personal_info_city** - City
6. **personal_info_postal** - Postal Code
7. **personal_info_phone** - Phone Number
8. **artist_info** - Artist/Stage Name
9. **music_genre** - Primary Genre
10. **music_bio** - Artist Bio
11. **completed** - Onboarding finished

### Completion Tracking

The system tracks completion via the `onboarding_progress` table:

```sql
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id),
  stage TEXT CHECK (stage IN (...)),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,

  -- Field completion tracking
  has_first_name BOOLEAN DEFAULT FALSE,
  has_last_name BOOLEAN DEFAULT FALSE,
  has_dob BOOLEAN DEFAULT FALSE,
  has_nationality BOOLEAN DEFAULT FALSE,
  has_city BOOLEAN DEFAULT FALSE,
  has_postal BOOLEAN DEFAULT FALSE,
  has_phone BOOLEAN DEFAULT FALSE,
  has_artist_name BOOLEAN DEFAULT FALSE,
  has_genre BOOLEAN DEFAULT FALSE,
  has_bio BOOLEAN DEFAULT FALSE,

  completion_percentage INTEGER DEFAULT 0,
  conversation_data JSONB DEFAULT '[]'::jsonb,
  -- ... timestamps
);
```

## Apollo Intelligence Integration

### Locked Fields Awareness & Enforcement

Apollo has been updated to both understand AND enforce locked personal information security:

**System-Level Protection:**
- The `update_profile` tool now checks the `immutableDataLocked` flag before allowing any updates
- If a user's personal information is locked, the tool returns `error: 'LOCKED_FIELDS'`
- The tool automatically blocks updates to: `first_name`, `last_name`, `dateOfBirth`, `nationality`, `city`, `postalCode`
- This is a **hard security boundary** that cannot be bypassed, even by AI

**Apollo's Response:**
When the tool returns a LOCKED_FIELDS error, Apollo will respond:

> "I can't change that field directly - your personal information (name, date of birth, nationality, city, postal code) is locked for security. To update this, you'll need to submit a Profile Change Request through your profile page, and our team will review it. This keeps your account secure! 🔒"

**Technical Implementation:**
```javascript
// In /lib/apollo/tool-executor.js - update_profile tool
if (currentProfile?.immutableDataLocked && attemptedLockedFields.length > 0) {
  return {
    success: false,
    error: 'LOCKED_FIELDS',
    message: "I can't change that field directly...",
    locked_fields: attemptedLockedFields,
    profile_change_request_url: '/artist/profile',
  };
}
```

### Profile Change Requests

Users can submit change requests through:
- **Artist Profile Page**: `/artist/profile`
- **Profile Client Component**: `ComprehensiveProfileForm.js`

Change requests are stored in the database and require admin approval.

## Files Modified

### Frontend Components
- `components/ApolloOnboarding.js` - Main onboarding modal component
- `app/dashboard/DashboardClient.js` - Shows onboarding on first load
- `components/profile/ComprehensiveProfileForm.js` - Already has locked field support

### Backend API
- `app/api/apollo/onboarding/route.js` - Onboarding API with enhanced stages

### Apollo AI
- `lib/apollo/prompts.js` - System prompt with locked field awareness
- `lib/apollo/tool-executor.js` - Tool implementations with `immutableDataLocked` enforcement
- `lib/apollo/tools-mvp.js` - Tool definitions including `update_profile`

### Database
- `database/apollo-onboarding-system.sql` - Schema definition
- Migration: `update_onboarding_progress_for_apollo_v2` - Applied to production

## User Experience

### For New Users

1. **Sign up** → Account created
2. **First login** → Redirected to dashboard
3. **Apollo appears** → Non-dismissable onboarding modal
4. **Conversational flow** → Apollo asks questions one by one
5. **Progress tracking** → Visual progress bar (0-100%)
6. **Completion** → Personal info locked, access granted to platform

### For Existing Users

- Onboarding already completed
- Personal information fields show as locked in profile
- Can request changes through Profile Change Request system

## Testing the Flow

### Test as a New User

1. Create a new test account
2. Log in for the first time
3. Apollo should greet you immediately
4. Complete all 10 questions
5. Verify that personal info is locked in profile page

### Test Apollo Locked Field Recognition

1. Complete Apollo onboarding (this sets `immutableDataLocked = true`)
2. Open Apollo chat
3. Ask: "Change my first name to John"
4. Apollo calls `update_profile` tool
5. Tool checks `immutableDataLocked` flag → returns `LOCKED_FIELDS` error
6. Apollo receives error and responds with security message
7. **Expected Response**: "I can't change that field directly - your personal information is locked for security..."
8. Verify the name was NOT changed in the database

## Security Benefits

✅ Personal information collected once during supervised onboarding
✅ KYC/AML compliance data locked for security at database AND tool level
✅ Reduces fraud and account takeover risks
✅ Audit trail for all personal information changes
✅ Admin oversight for sensitive data modifications
✅ **AI-proof security** - Even Apollo AI cannot bypass the `immutableDataLocked` flag
✅ Hard security boundary in `update_profile` tool prevents unauthorized changes

## Future Enhancements

- [ ] Email verification during onboarding
- [ ] ID document upload for KYC compliance
- [ ] Multi-factor authentication setup
- [ ] Stripe Connect onboarding for payouts
- [ ] Tax form collection (W-9/W-8BEN)

## Support

If users need to update locked personal information:

1. Go to **Artist Profile** page
2. Click **Request Profile Change** button
3. Fill out the change request form
4. Admin reviews and approves/rejects
5. Notification sent to user

---

## Changelog

### Version 2.1 (Latest) - January 31, 2025
**Security Enhancement**: Added hard enforcement of `immutableDataLocked` flag in Apollo tools
- ✅ `update_profile` tool now checks `immutableDataLocked` before allowing changes
- ✅ Returns `LOCKED_FIELDS` error when attempting to change locked personal information
- ✅ Apollo system prompts updated to handle locked field errors gracefully
- ✅ Created AI-proof security boundary that cannot be bypassed

### Version 2.0 - January 2025
**Initial Release**: Apollo-guided onboarding with 11 conversation stages
- ✅ Personal information collection and locking system
- ✅ Integration with user profile and onboarding progress tables
- ✅ Non-dismissable modal for first-time users

---

**Last Updated**: January 31, 2025
**Version**: 2.1
**Status**: ✅ Production Ready
