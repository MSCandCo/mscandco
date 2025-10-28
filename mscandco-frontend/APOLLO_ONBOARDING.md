# 🚀 Apollo Intelligence - AI-Powered Onboarding System

## Overview
Revolutionary AI-guided onboarding experience where Apollo personally welcomes new users and collects essential information through natural conversation.

## Features

### 1. **Conversational Onboarding**
- Apollo greets users immediately after registration
- Natural, friendly conversation (not forms!)
- Collects information one question at a time
- Adapts responses based on user's answers

### 2. **Progress Tracking**
- Real-time completion percentage (0-100%)
- Visual progress bar
- Stage-based progression
- Automatic profile updates

### 3. **Required Information**
Apollo collects these essential fields:
- ✅ Artist Name / Stage Name
- ✅ Music Genre
- ✅ Phone Number
- ✅ Music Goals / Bio
- ⚠️ Payment Info (optional for now)

### 4. **Platform Gating**
- Users see onboarding modal on first login
- Modal cannot be closed until 80%+ complete
- Full platform access unlocked after completion
- Dashboard reloads with complete profile

## Database Schema

### `onboarding_progress` Table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- stage: TEXT (welcome, artist_info, contact_info, music_goals, completed)
- is_completed: BOOLEAN
- completed_at: TIMESTAMP
- has_artist_name: BOOLEAN
- has_genre: BOOLEAN
- has_phone: BOOLEAN
- has_bio: BOOLEAN
- has_payment_info: BOOLEAN
- completion_percentage: INTEGER (0-100)
- conversation_data: JSONB
- started_at: TIMESTAMP
- last_interaction_at: TIMESTAMP
```

## API Endpoints

### GET `/api/acceber/onboarding?userId={id}`
Get current onboarding status and progress

**Response:**
```json
{
  "success": true,
  "progress": {
    "stage": "artist_info",
    "completion_percentage": 40,
    "is_completed": false,
    ...
  }
}
```

### POST `/api/acceber/onboarding`
Process onboarding conversation

**Request:**
```json
{
  "userId": "uuid",
  "message": "My artist name is Charles Dada",
  "currentStage": "welcome"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Love it! Charles Dada sounds great! 🎵\n\nWhat genre of music do you create?",
  "progress": { ... },
  "nextStage": "artist_info"
}
```

## Onboarding Flow

### Stage 1: Welcome
**Apollo:** "Hey! 👋 I'm Apollo, your AI music assistant. I'm here to help you get started with MSC & Co. First things first - what should I call you? What's your artist name or stage name?"

**User:** "Charles Dada"

**Updates:** `has_artist_name = true`, `stage = 'artist_info'`

---

### Stage 2: Artist Info
**Apollo:** "Love it! Charles Dada sounds great! 🎵 What genre of music do you create? (e.g., Gospel, Afrobeats, Hip-Hop, R&B, etc.)"

**User:** "Gospel"

**Updates:** `has_genre = true`, `stage = 'contact_info'`

---

### Stage 3: Contact Info
**Apollo:** "Perfect! Now I need a way to reach you if anything important comes up. What's the best phone number to contact you?"

**User:** "+234 123 456 7890"

**Updates:** `has_phone = true`, `stage = 'music_goals'`

---

### Stage 4: Music Goals
**Apollo:** "Almost there! Last question - what brings you to MSC & Co? Are you looking to:
- Distribute your music to streaming platforms
- Track your earnings and analytics
- Grow your fanbase
- All of the above?

Tell me what you're most excited about! 🚀"

**User:** "I want to distribute my music and track my earnings"

**Updates:** `has_bio = true`, `stage = 'completed'`, `is_completed = true`

---

### Stage 5: Completed
**Apollo:** "That's it! 🎉 You're all set up, Charles Dada! Your profile is complete and you now have full access to the platform. Ready to upload your first release or explore your dashboard?"

**Result:** Modal closes, dashboard reloads, full platform access granted

## Component Usage

### In Dashboard
```jsx
import ApolloOnboarding from '@/components/ApolloOnboarding'

<ApolloOnboarding 
  user={user} 
  onComplete={() => {
    setOnboardingComplete(true);
    loadDashboardData();
  }}
/>
```

## Automatic Triggers

### 1. New User Registration
- `initialize_user_onboarding` trigger creates onboarding record
- Automatically sets `stage = 'welcome'`

### 2. First Login
- Dashboard checks onboarding status
- If `is_completed = false`, modal appears
- User cannot access platform until 80%+ complete

### 3. Profile Updates
- Each answer updates `user_profiles` table
- Onboarding progress tracks completion
- Percentage auto-calculates (5 fields × 20% each)

## Completion Logic

### Minimum Requirements (80%)
User must complete at least 4 out of 5 fields:
- Artist Name (required)
- Genre (required)
- Phone (required)
- Bio/Goals (required)
- Payment Info (optional)

### Auto-Completion
When `completion_percentage >= 80`:
- `is_completed = true`
- `completed_at = NOW()`
- `stage = 'completed'`
- Modal closes after 2 seconds
- Full platform access granted

## Future Enhancements

### Phase 2
- [ ] Voice input for onboarding responses
- [ ] Multi-language support
- [ ] Skip option for returning users
- [ ] Social media integration questions
- [ ] Collaborative artist onboarding

### Phase 3
- [ ] Personalized onboarding based on role (artist vs label)
- [ ] Video tutorial integration
- [ ] Sample music upload during onboarding
- [ ] Referral code collection
- [ ] Genre-specific questions

## Benefits

### For Users
✅ **No boring forms** - Natural conversation
✅ **Guided experience** - Apollo knows what to ask next
✅ **Quick setup** - 2-3 minutes to complete
✅ **Personalized** - Responses adapt to user's answers
✅ **Welcoming** - Feels like talking to a friend

### For Platform
✅ **Higher completion rates** - Conversational > forms
✅ **Better data quality** - Apollo can ask follow-ups
✅ **Reduced support tickets** - Users understand platform
✅ **Competitive advantage** - No other platform has this
✅ **Brand differentiation** - AI-first experience

## Technical Stack

- **AI Model:** OpenAI GPT-4o-mini
- **Database:** Supabase PostgreSQL
- **Frontend:** Next.js 14 + React
- **Styling:** Tailwind CSS
- **Real-time:** Supabase Realtime (for future notifications)

## Setup Instructions

### 1. Run Database Migration
```sql
-- Run: database/apollo-onboarding-system.sql
```

### 2. Environment Variables
Already configured:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Deploy
```bash
git add -A
git commit -m "Add Apollo AI-powered onboarding system"
git push origin main
vercel --prod
```

## Testing

### Test Flow
1. Create new account at `/register`
2. Complete email verification
3. Login for first time
4. Apollo onboarding modal appears
5. Answer Apollo's questions
6. Watch progress bar fill up
7. Complete onboarding (80%+)
8. Modal closes, dashboard loads

### Test Users
Create test accounts to verify:
- Different artist names
- Various genres
- International phone numbers
- Different music goals

## Support

If users encounter issues:
1. Check `onboarding_progress` table for their status
2. Verify profile fields are updating
3. Check API logs for errors
4. Manual completion: Update `is_completed = true`

## Metrics to Track

- **Completion Rate:** % of users who finish onboarding
- **Time to Complete:** Average duration
- **Drop-off Stage:** Where users abandon
- **Field Accuracy:** Quality of collected data
- **User Satisfaction:** Post-onboarding survey

---

**Built with ❤️ by Apollo Intelligence**
*The future of music distribution onboarding*

