/**
 * Apollo Intelligence - Onboarding API
 * Handles AI-guided onboarding conversations and profile completion
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { openai, ACCEBER_CONFIG } from '@/lib/acceber/client';

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
      ...ACCEBER_CONFIG,
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
  const basePrompt = `You are Apollo, the AI assistant for MSC & Co music distribution platform. You're guiding a new user through onboarding.

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

Say: "Hey! 👋 I'm Apollo, your AI music assistant. I'm here to help you get started with MSC & Co. 

Before we dive in, I need to know a bit about you. Let's start with the basics - what's your first name?"

Be warm and welcoming!`,

    personal_info: `${basePrompt}
STAGE: Personal Info
You're collecting their first and last name.

If they just gave you their first name, say: "Nice to meet you, ${profile?.first_name || 'you'}! 😊

And what's your last name?"

Keep it friendly and conversational!`,

    artist_info: `${basePrompt}
STAGE: Artist Info
You're collecting their artist name and music genre.

Say: "Perfect! Now, what should your fans call you? What's your artist name or stage name?

(This is the name that will appear on all your releases)"

Be encouraging!`,

    contact_info: `${basePrompt}
STAGE: Contact Info
You're collecting phone number and location.

If they just gave you their artist name, say: "Love it! ${profile?.artist_name || 'That name'} sounds great! 🎵

Now I need your phone number so we can reach you about important updates. What's the best number to contact you?"

Be professional but friendly.`,

    identity_info: `${basePrompt}
STAGE: Identity Info
You're collecting date of birth for age verification.

Say: "Great! One more thing for verification - what's your date of birth?

(Format: DD/MM/YYYY or MM/DD/YYYY)"

Be respectful and explain it's for age verification.`,

    music_goals: `${basePrompt}
STAGE: Music Goals
You're understanding what they want to achieve and collecting their bio.

Say: "Almost there! Tell me about your music journey. What genre do you create, and what brings you to MSC & Co?

(This will be your artist bio - make it good! 🎵)"

Be enthusiastic about their goals!`,

    completed: `${basePrompt}
STAGE: Completed
Onboarding is done!

Say: "That's it! 🎉 You're all set up, ${profile?.artist_name || profile?.first_name}!

Your profile is complete and you now have full access to the platform. Ready to upload your first release or explore your dashboard?"

Celebrate their completion!`,
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
        profileUpdates.first_name = message.trim();
        progressUpdates.has_first_name = true;
        nextStage = 'personal_info';
      }
      break;
      
    case 'personal_info':
      // Extract last name
      if (message && message.trim().length > 0) {
        profileUpdates.last_name = message.trim();
        progressUpdates.has_last_name = true;
        nextStage = 'artist_info';
      }
      break;
      
    case 'artist_info':
      // Extract artist name
      if (message && message.trim().length > 0) {
        profileUpdates.artist_name = message.trim();
        progressUpdates.has_artist_name = true;
        nextStage = 'contact_info';
      }
      break;
      
    case 'contact_info':
      // Extract phone and location
      if (message && message.trim().length > 0) {
        // If message contains country/location keywords, extract it
        // For now, just store phone
        profileUpdates.phone = message.trim();
        progressUpdates.has_phone = true;
        
        // Ask for location next time or move to next stage
        // For simplicity, we'll ask for location separately
        if (!profile.location) {
          profileUpdates.location = 'To be updated'; // Placeholder
          progressUpdates.has_location = true;
        }
        nextStage = 'identity_info';
      }
      break;
      
    case 'identity_info':
      // Extract date of birth
      if (message && message.trim().length > 0) {
        profileUpdates.date_of_birth = message.trim();
        progressUpdates.has_dob = true;
        nextStage = 'music_goals';
      }
      break;
      
    case 'music_goals':
      // Extract bio/goals and genre
      if (message && message.trim().length > 0) {
        profileUpdates.bio = message.trim();
        progressUpdates.has_bio = true;
        
        // Try to extract genre from bio
        const genreKeywords = ['gospel', 'afrobeats', 'hip-hop', 'hip hop', 'r&b', 'rnb', 'pop', 'rock', 'jazz', 'reggae', 'dancehall', 'amapiano'];
        const lowerMessage = message.toLowerCase();
        for (const genre of genreKeywords) {
          if (lowerMessage.includes(genre)) {
            profileUpdates.genre = genre.charAt(0).toUpperCase() + genre.slice(1);
            progressUpdates.has_genre = true;
            break;
          }
        }
        
        // If no genre detected, mark as completed anyway
        if (!progressUpdates.has_genre) {
          progressUpdates.has_genre = true;
          profileUpdates.genre = 'Other';
        }
        
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

