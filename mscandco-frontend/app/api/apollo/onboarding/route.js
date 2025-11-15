/**
 * Apollo Intelligence - Onboarding API
 * Handles AI-guided onboarding conversations and profile completion
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { apolloThink } from '@/lib/apollo/brain';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { userId, message, currentStage, conversationHistory = [] } = await request.json();

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

    // Get conversation history from database if not provided
    let fullHistory = conversationHistory;
    if (fullHistory.length === 0 && progress?.conversation_history) {
      fullHistory = JSON.parse(progress.conversation_history);
    }

    const stage = currentStage || progress?.stage || 'welcome';

    // Build intelligent system prompt with full context
    const systemPrompt = getIntelligentOnboardingPrompt(profile, progress, fullHistory);

    // Build conversation messages for GPT
    const messages = [
      { role: 'system', content: systemPrompt },
      ...fullHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: message },
    ];

    // Get intelligent response from GPT
    const response = await openai.chat.completions.create({
      ...APOLLO_CONFIG,
      messages,
      temperature: 0.8, // More creative and conversational
      max_tokens: 500,
    });

    const apolloResponse = response.choices[0].message.content;

    // Use GPT to intelligently extract information and understand intent
    const analysis = await analyzeUserIntent(message, apolloResponse, profile, progress, fullHistory);

    // Update profile with extracted information
    if (Object.keys(analysis.profileUpdates).length > 0) {
      await supabase
        .from('user_profiles')
        .update(analysis.profileUpdates)
        .eq('id', userId);
    }

    // Update onboarding progress
    const progressUpdates = {
      ...analysis.progressUpdates,
      stage: analysis.nextStage || stage,
      conversation_history: JSON.stringify([
        ...fullHistory,
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: apolloResponse, timestamp: new Date().toISOString() }
      ])
    };

    if (Object.keys(progressUpdates).length > 0) {
      await supabase
        .from('onboarding_progress')
        .update(progressUpdates)
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
      nextStage: analysis.nextStage,
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
 * Get intelligent onboarding prompt with full context awareness
 */
function getIntelligentOnboardingPrompt(profile, progress, conversationHistory) {
  const completedFields = {
    first_name: !!profile?.first_name,
    last_name: !!profile?.last_name,
    date_of_birth: !!profile?.date_of_birth,
    nationality: !!profile?.nationality,
    city: !!profile?.city,
    postal_code: !!profile?.postal_code,
    phone: !!profile?.phone,
    artist_name: !!profile?.artist_name,
    primary_genre: !!profile?.primary_genre,
    bio: !!profile?.bio,
  };

  const missingFields = Object.entries(completedFields)
    .filter(([field, completed]) => !completed)
    .map(([field]) => field);

  return `You are Apollo, an exceptionally intelligent AI assistant for MSC & Co music distribution platform. You're having a natural, flowing conversation to help a new user set up their profile.

## YOUR PERSONALITY
- Warm, friendly, and genuinely helpful
- Highly intelligent and context-aware
- Patient and understanding
- Conversational and natural (like ChatGPT)
- Able to handle ANY user request naturally

## CRITICAL CAPABILITIES
1. **GO BACK / EDIT**: If user wants to "go back", "change", or "edit" previous answers, ALWAYS allow it. Say something like "Of course! Let's update that. What should it be instead?"

2. **UNDERSTAND INTENT**: Recognize when users are:
   - Asking questions (answer them helpfully)
   - Wanting to go back/edit (let them)
   - Providing information (extract and acknowledge it)
   - Confused (clarify patiently)
   - Making small talk (engage naturally)

3. **NATURAL CONVERSATION**: Don't be robotic. Have a real conversation. Users can ask questions, make comments, or provide info in any order.

4. **FLEXIBILITY**: Users don't have to follow a strict order. If they mention multiple pieces of info at once, extract all of it.

## CURRENT USER PROFILE
Email: ${profile?.email || 'Not set'}
First Name: ${profile?.first_name || 'Not provided yet'}
Last Name: ${profile?.last_name || 'Not provided yet'}
Date of Birth: ${profile?.date_of_birth || 'Not provided yet'}
Nationality: ${profile?.nationality || 'Not provided yet'}
City: ${profile?.city || 'Not provided yet'}
Postal Code: ${profile?.postal_code || 'Not provided yet'}
Phone: ${profile?.phone || 'Not provided yet'}
Artist Name: ${profile?.artist_name || 'Not provided yet'}
Music Genre: ${profile?.primary_genre || 'Not provided yet'}
Bio: ${profile?.bio || 'Not provided yet'}

## WHAT WE STILL NEED
${missingFields.length > 0 ? missingFields.join(', ') : 'Nothing! Profile is complete.'}

## YOUR TASK
1. If this is the first message, warmly welcome them and explain the onboarding
2. Have a natural conversation to collect missing information
3. Allow users to go back, edit, ask questions, or chat naturally
4. Keep responses SHORT (2-4 sentences max)
5. Be encouraging and make it feel effortless
6. When all info is collected, celebrate and mark as complete

## IMPORTANT RULES
- NEVER refuse to let users go back or change answers
- NEVER be rigid or robotic
- ALWAYS understand context and intent
- If user provides info you already have, acknowledge and ask what they'd like to update
- Be genuinely helpful and conversational

Remember: You're having a conversation, not interrogating. Make it natural and enjoyable!`;
}

/**
 * Intelligently analyze user intent and extract information using GPT
 */
async function analyzeUserIntent(userMessage, apolloResponse, profile, progress, conversationHistory) {
  const analysisPrompt = `You are an intelligent data extraction system. Analyze the user's message and extract any profile information they provided.

USER MESSAGE: "${userMessage}"
APOLLO'S RESPONSE: "${apolloResponse}"

CURRENT PROFILE:
- First Name: ${profile?.first_name || 'Not set'}
- Last Name: ${profile?.last_name || 'Not set'}
- Date of Birth: ${profile?.date_of_birth || 'Not set'}
- Nationality: ${profile?.nationality || 'Not set'}
- City: ${profile?.city || 'Not set'}
- Postal Code: ${profile?.postal_code || 'Not set'}
- Phone: ${profile?.phone || 'Not set'}
- Artist Name: ${profile?.artist_name || 'Not set'}
- Primary Genre: ${profile?.primary_genre || 'Not set'}
- Bio: ${profile?.bio || 'Not set'}

TASK: Extract any new or updated information from the user's message. Return ONLY valid JSON in this exact format:

{
  "profileUpdates": {
    "first_name": "value or null",
    "last_name": "value or null",
    "date_of_birth": "value or null",
    "nationality": "value or null",
    "city": "value or null",
    "postal_code": "value or null",
    "phone": "value or null",
    "artist_name": "value or null",
    "primary_genre": "value or null",
    "bio": "value or null"
  },
  "allFieldsComplete": true/false
}

RULES:
1. Only include fields that have NEW values or UPDATES
2. If user is asking questions or going back, return empty profileUpdates
3. Extract info intelligently - user might provide multiple fields at once
4. Set allFieldsComplete to true ONLY if ALL fields above are now filled
5. Return ONLY the JSON, nothing else`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(response.choices[0].message.content);

    // Clean up the profile updates - remove null/undefined values
    const cleanedProfileUpdates = {};
    for (const [key, value] of Object.entries(analysis.profileUpdates || {})) {
      if (value && value !== 'null' && value.trim() !== '') {
        cleanedProfileUpdates[key] = value.trim();
      }
    }

    // Build progress updates
    const progressUpdates = {};

    // Mark fields as completed
    if (cleanedProfileUpdates.first_name) progressUpdates.has_first_name = true;
    if (cleanedProfileUpdates.last_name) progressUpdates.has_last_name = true;
    if (cleanedProfileUpdates.date_of_birth) progressUpdates.has_dob = true;
    if (cleanedProfileUpdates.nationality) progressUpdates.has_nationality = true;
    if (cleanedProfileUpdates.city) progressUpdates.has_city = true;
    if (cleanedProfileUpdates.postal_code) progressUpdates.has_postal = true;
    if (cleanedProfileUpdates.phone) progressUpdates.has_phone = true;
    if (cleanedProfileUpdates.artist_name) progressUpdates.has_artist_name = true;
    if (cleanedProfileUpdates.primary_genre) progressUpdates.has_genre = true;
    if (cleanedProfileUpdates.bio) progressUpdates.has_bio = true;

    // Check if all fields are complete
    const allComplete = analysis.allFieldsComplete || (
      (profile?.first_name || cleanedProfileUpdates.first_name) &&
      (profile?.last_name || cleanedProfileUpdates.last_name) &&
      (profile?.date_of_birth || cleanedProfileUpdates.date_of_birth) &&
      (profile?.nationality || cleanedProfileUpdates.nationality) &&
      (profile?.city || cleanedProfileUpdates.city) &&
      (profile?.postal_code || cleanedProfileUpdates.postal_code) &&
      (profile?.phone || cleanedProfileUpdates.phone) &&
      (profile?.artist_name || cleanedProfileUpdates.artist_name) &&
      (profile?.primary_genre || cleanedProfileUpdates.primary_genre) &&
      (profile?.bio || cleanedProfileUpdates.bio)
    );

    if (allComplete) {
      progressUpdates.is_completed = true;
      progressUpdates.completed_at = new Date().toISOString();
      progressUpdates.stage = 'completed';
      cleanedProfileUpdates.immutable_data_locked = true;
    }

    // Calculate completion percentage
    const totalFields = 10;
    const completedFieldsCount = [
      profile?.first_name || cleanedProfileUpdates.first_name,
      profile?.last_name || cleanedProfileUpdates.last_name,
      profile?.date_of_birth || cleanedProfileUpdates.date_of_birth,
      profile?.nationality || cleanedProfileUpdates.nationality,
      profile?.city || cleanedProfileUpdates.city,
      profile?.postal_code || cleanedProfileUpdates.postal_code,
      profile?.phone || cleanedProfileUpdates.phone,
      profile?.artist_name || cleanedProfileUpdates.artist_name,
      profile?.primary_genre || cleanedProfileUpdates.primary_genre,
      profile?.bio || cleanedProfileUpdates.bio,
    ].filter(Boolean).length;

    progressUpdates.completion_percentage = Math.round((completedFieldsCount / totalFields) * 100);

    return {
      profileUpdates: cleanedProfileUpdates,
      progressUpdates,
      nextStage: allComplete ? 'completed' : progress?.stage || 'onboarding'
    };

  } catch (error) {
    console.error('Error analyzing user intent:', error);
    return {
      profileUpdates: {},
      progressUpdates: {},
      nextStage: progress?.stage || 'onboarding'
    };
  }
}

