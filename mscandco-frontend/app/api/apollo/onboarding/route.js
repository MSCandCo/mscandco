/**
 * Apollo Intelligence - Onboarding API
 * Handles AI-guided onboarding conversations and profile completion
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { openai, APOLLO_CONFIG } from '@/lib/apollo/client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET - Get onboarding status
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }
    
    const { data: progress, error } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    // If no onboarding record exists, create one
    if (!progress) {
      const { data: newProgress } = await supabase
        .from('onboarding_progress')
        .insert({ user_id: userId, stage: 'welcome' })
        .select()
        .single();
      
      return NextResponse.json({
        success: true,
        progress: newProgress,
      });
    }
    
    return NextResponse.json({
      success: true,
      progress,
    });
    
  } catch (error) {
    console.error('❌ Error fetching onboarding status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding status', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Process onboarding conversation
 */
export async function POST(request) {
  try {
    const { userId, message, currentStage } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }
    
    console.log('🎯 Processing onboarding message for user:', userId);
    
    // Get current onboarding progress
    const { data: progress } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    const stage = currentStage || progress?.stage || 'welcome';
    
    // Generate Apollo's response based on stage
    const systemPrompt = getOnboardingPrompt(stage, profile, progress);
    
    const response = await openai.chat.completions.create({
      ...APOLLO_CONFIG,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    });
    
    const apolloResponse = response.choices[0].message.content;
    
    // Extract information from user's message and update profile
    const updates = await extractProfileUpdates(message, stage, profile);
    
    if (Object.keys(updates.profileUpdates).length > 0) {
      await supabase
        .from('user_profiles')
        .update(updates.profileUpdates)
        .eq('id', userId);
    }
    
    // Update onboarding progress
    if (Object.keys(updates.progressUpdates).length > 0) {
      await supabase
        .from('onboarding_progress')
        .update(updates.progressUpdates)
        .eq('user_id', userId);
    }
    
    // Get updated progress
    const { data: updatedProgress } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return NextResponse.json({
      success: true,
      response: apolloResponse,
      progress: updatedProgress,
      nextStage: updates.nextStage,
    });
    
  } catch (error) {
    console.error('❌ Error processing onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to process onboarding', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get onboarding prompt based on stage
 */
function getOnboardingPrompt(stage, profile, progress) {
  const basePrompt = `You are Apollo, the AI assistant for MSC & Co music distribution platform. You're guiding a new user through their one-time onboarding.

IMPORTANT: This is a ONE-TIME opportunity to collect personal information. After onboarding, these fields will be LOCKED and can only be changed through a profile change request.

Be warm, friendly, and conversational. Keep responses SHORT (2-3 sentences max). Ask ONE question at a time.

User's current info:
- Email: ${profile?.email || 'Not set'}
- Name: ${profile?.first_name || 'Not set'} ${profile?.last_name || 'Not set'}
- Artist Name: ${profile?.artist_name || 'Not set'}
- Completion: ${progress?.completion_percentage || 0}%

`;

  const stagePrompts = {
    welcome: `${basePrompt}
STAGE: Welcome
This is the user's FIRST interaction with the platform.

Say: "Hey! 👋 I'm Apollo, your AI music assistant. Welcome to MSC & Co!

I'm going to help you set up your profile. This is important - the personal information you provide will be locked for security, so make sure everything is accurate. Ready to get started?

What's your first name?"

Be warm and welcoming, but emphasize the importance!`,

    personal_info_last: `${basePrompt}
STAGE: Personal Info - Last Name
You're collecting their last name.

Say: "Nice to meet you, ${profile?.first_name || 'you'}! 😊

What's your last name?"

Keep it friendly!`,

    personal_info_dob: `${basePrompt}
STAGE: Personal Info - Date of Birth
You're collecting date of birth for age verification and KYC.

Say: "Thanks! Now I need your date of birth for verification and compliance.

Please enter it as DD/MM/YYYY (for example: 15/03/1995)"

Be respectful and professional.`,

    personal_info_nationality: `${basePrompt}
STAGE: Personal Info - Nationality
You're collecting their nationality.

Say: "Great! What's your nationality?

(This is required for royalty payments and tax purposes)"

Be professional.`,

    personal_info_city: `${basePrompt}
STAGE: Personal Info - City
You're collecting their city.

Say: "What city do you currently live in?

(We need this for your payment information)"

Keep it conversational.`,

    personal_info_postal: `${basePrompt}
STAGE: Personal Info - Postal Code
You're collecting their postal/zip code.

Say: "And what's your postal code or zip code?"

Keep it brief!`,

    personal_info_phone: `${basePrompt}
STAGE: Personal Info - Phone
You're collecting their phone number.

Say: "Almost done with the essentials! What's your phone number?

(Include country code if outside the UK, e.g., +1 555-1234)"

Be encouraging!`,

    artist_info: `${basePrompt}
STAGE: Artist Info
You're collecting their artist name and music genre.

Say: "Perfect! Now for the fun part - what should your fans call you? What's your artist name or stage name?

(This is the name that will appear on all your releases)"

Be encouraging and exciting!`,

    music_genre: `${basePrompt}
STAGE: Music Genre
You're collecting their primary music genre.

Say: "Love it! ${profile?.artist_name || 'That name'} sounds great! 🎵

What genre of music do you create? (e.g., Gospel, Afrobeats, Hip-Hop, R&B, Pop, etc.)"

Be enthusiastic!`,

    music_bio: `${basePrompt}
STAGE: Music Bio
You're collecting their artist bio.

Say: "Almost there! Tell me about your music journey in a few sentences.

(This will be your artist bio - make it compelling! 🎵)"

Be enthusiastic about their story!`,

    completed: `${basePrompt}
STAGE: Completed
Onboarding is done!

Say: "That's it! 🎉 You're all set up, ${profile?.artist_name || profile?.first_name}!

Your personal information is now secured and locked. If you ever need to update it, you'll submit a profile change request that our team will review.

Ready to upload your first release or explore your dashboard?"

Celebrate their completion and remind them about the locked fields!`,
  };

  return stagePrompts[stage] || stagePrompts.welcome;
}

/**
 * Extract profile updates from user message
 */
async function extractProfileUpdates(message, stage, profile) {
  const profileUpdates = {};
  const progressUpdates = {};
  let nextStage = stage;

  switch (stage) {
    case 'welcome':
      // Extract first name
      if (message && message.trim().length > 0) {
        profileUpdates.firstName = message.trim();
        progressUpdates.has_first_name = true;
        nextStage = 'personal_info_last';
      }
      break;

    case 'personal_info_last':
      // Extract last name
      if (message && message.trim().length > 0) {
        profileUpdates.lastName = message.trim();
        progressUpdates.has_last_name = true;
        nextStage = 'personal_info_dob';
      }
      break;

    case 'personal_info_dob':
      // Extract date of birth
      if (message && message.trim().length > 0) {
        profileUpdates.dateOfBirth = message.trim();
        progressUpdates.has_dob = true;
        nextStage = 'personal_info_nationality';
      }
      break;

    case 'personal_info_nationality':
      // Extract nationality
      if (message && message.trim().length > 0) {
        profileUpdates.nationality = message.trim();
        progressUpdates.has_nationality = true;
        nextStage = 'personal_info_city';
      }
      break;

    case 'personal_info_city':
      // Extract city
      if (message && message.trim().length > 0) {
        profileUpdates.city = message.trim();
        progressUpdates.has_city = true;
        nextStage = 'personal_info_postal';
      }
      break;

    case 'personal_info_postal':
      // Extract postal code
      if (message && message.trim().length > 0) {
        profileUpdates.postalCode = message.trim();
        progressUpdates.has_postal = true;
        nextStage = 'personal_info_phone';
      }
      break;

    case 'personal_info_phone':
      // Extract phone
      if (message && message.trim().length > 0) {
        profileUpdates.phone = message.trim();
        progressUpdates.has_phone = true;
        nextStage = 'artist_info';
      }
      break;

    case 'artist_info':
      // Extract artist name
      if (message && message.trim().length > 0) {
        profileUpdates.artistName = message.trim();
        progressUpdates.has_artist_name = true;
        nextStage = 'music_genre';
      }
      break;

    case 'music_genre':
      // Extract primary genre
      if (message && message.trim().length > 0) {
        profileUpdates.primaryGenre = message.trim();
        progressUpdates.has_genre = true;
        nextStage = 'music_bio';
      }
      break;

    case 'music_bio':
      // Extract bio
      if (message && message.trim().length > 0) {
        profileUpdates.bio = message.trim();
        progressUpdates.has_bio = true;
        progressUpdates.is_completed = true;
        progressUpdates.completed_at = new Date().toISOString();

        // LOCK the personal information
        profileUpdates.immutableDataLocked = true;

        nextStage = 'completed';
      }
      break;
  }

  // Update stage
  if (nextStage !== stage) {
    progressUpdates.stage = nextStage;
  }

  return { profileUpdates, progressUpdates, nextStage };
}

