/**
 * Apollo Intelligence - Onboarding API
 * Handles AI-guided onboarding conversations and profile completion
 */

import { NextResponse } from 'next/server';
// Enterprise pattern: Dynamic imports to prevent build-time analysis
// All imports deferred to runtime

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'
export const revalidate = 0


/**
 * GET - Get onboarding status
 */
export async function GET(request) {
  try {
    // Enterprise pattern: Dynamic imports prevent build-time analysis
    const { apolloThink } = await import('@/lib/apollo/brain');
    
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

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
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

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

    // Get intelligent response from GPT with timeout and function calling support
    let response = await Promise.race([
      openai.chat.completions.create({
        ...APOLLO_CONFIG,
        messages,
        temperature: 0.8, // More creative and conversational
        max_tokens: 500,
        tools: APOLLO_TOOLS, // Enable web search and enhanced capabilities
        tool_choice: 'auto', // Let GPT decide when to use tools
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Apollo thinking timeout')), 30000) // 30 second timeout
      )
    ]);

    let apolloResponse = response.choices[0].message.content;

    // Handle tool calls if GPT wants to use web search or other tools
    if (response.choices[0].message.tool_calls) {
      console.log('🔧 Apollo wants to use tools:', response.choices[0].message.tool_calls.length);

      // Execute all tool calls
      const toolResults = [];
      for (const toolCall of response.choices[0].message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        console.log(`🔧 Executing ${toolName} with args:`, toolArgs);
        const result = await executeTool(toolName, toolArgs);

        toolResults.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: toolName,
          content: JSON.stringify(result),
        });
      }

      // Send tool results back to GPT to get final response
      const followUpMessages = [
        ...messages,
        response.choices[0].message,
        ...toolResults,
      ];

      const followUpResponse = await Promise.race([
        openai.chat.completions.create({
          ...APOLLO_CONFIG,
          messages: followUpMessages,
          temperature: 0.8,
          max_tokens: 500,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Apollo thinking timeout')), 30000)
        )
      ]);

      apolloResponse = followUpResponse.choices[0].message.content;
      console.log('✅ Got enhanced response after using tools');
    }

    // Use GPT to intelligently extract information and understand intent
    const analysis = await analyzeUserIntent(message, apolloResponse, profile, progress, fullHistory);

    // Update profile with extracted information
    if (Object.keys(analysis.profileUpdates).length > 0) {
      // Check if email is being changed
      if (analysis.profileUpdates.email && analysis.profileUpdates.email !== profile?.email) {
        console.log('📧 Email change detected in onboarding:', {
          oldEmail: profile?.email,
          newEmail: analysis.profileUpdates.email
        })

        // Update Supabase auth email (this sends a verification email to the new address)
        // The email change will only take effect after the user verifies the new email
        const { error: authError } = await supabase.auth.admin.updateUserById(
          userId,
          {
            email: analysis.profileUpdates.email,
            email_confirm: false // Require email verification before change takes effect
          }
        )

        if (authError) {
          console.error('❌ Error updating auth email:', authError)
          return NextResponse.json(
            { error: 'Failed to update login email', details: authError.message },
            { status: 500 }
          )
        }

        console.log('✅ Verification email sent to new address:', analysis.profileUpdates.email)
        console.log('⚠️ Email change will take effect after verification')
      }

      // Update profile in database
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

    // Handle timeout errors
    if (error.message === 'Apollo thinking timeout' || error.message === 'Analysis timeout') {
      return NextResponse.json(
        {
          error: 'Apollo is taking too long',
          message: 'Apollo is thinking too hard! Please try again. If this keeps happening, try asking your question differently.',
          type: 'timeout_error'
        },
        { status: 408 }
      );
    }

    // Handle OpenAI quota exceeded error
    if (error.status === 429 && error.code === 'insufficient_quota') {
      return NextResponse.json(
        {
          error: 'Apollo is temporarily unavailable',
          message: 'Our AI service quota has been exceeded. Please contact support or try again later.',
          type: 'quota_exceeded'
        },
        { status: 429 }
      );
    }

    // Handle other OpenAI errors
    if (error.status >= 400 && error.status < 500) {
      return NextResponse.json(
        {
          error: 'Apollo encountered an issue',
          message: 'There was a problem communicating with Apollo. Please try again.',
          type: 'api_error'
        },
        { status: error.status }
      );
    }

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
- **SUPREME INTELLIGENCE**: You have exceptional analytical abilities and catch EVERYTHING
- Patient and understanding
- Conversational and natural (like ChatGPT)
- Able to handle ANY user request naturally
- **ULTIMATE DATA VALIDATOR**: You question ALL inconsistencies, spot typos, detect logical errors, and validate information before accepting it
- **INTERNET ACCESS**: You can search the web for real-time information about artists, music trends, and more!

## CRITICAL CAPABILITIES

**🔥 GOLDEN RULE: ALWAYS READ THE ENTIRE CONVERSATION HISTORY BEFORE RESPONDING! 🔥**
The user may have told you information 5 messages ago. Use it! Don't forget it!

1. **GO BACK / EDIT**: If user wants to "go back", "change", or "edit" previous answers, ALWAYS allow it. Say something like "Of course! Let's update that. What should it be instead?"

2. **UNDERSTAND INTENT**: Recognize when users are:
   - Asking questions (answer them helpfully)
   - Wanting to go back/edit (let them)
   - Providing information (extract and acknowledge it)
   - Confused (clarify patiently)
   - Making small talk (engage naturally)
   - **Asking you to write their bio** (be proactive and write it!)
   - **Saying "yes" to bio writing** (if you asked "would you like me to write a bio?", and they say "yes please" or "yes" - WRITE IT! Don't ask again!)

3. **NATURAL CONVERSATION**: Don't be robotic. Have a real conversation. Users can ask questions, make comments, or provide info in any order.

4. **FLEXIBILITY**: Users don't have to follow a strict order. If they mention multiple pieces of info at once, extract all of it.

5. **BIO WRITING SUPERPOWER**: When user says "write my bio" or similar:
   - **CRITICAL**: Read the ENTIRE conversation history to extract their artist name, genre, location, AND WEBSITE!
   - **IF USER PROVIDED A WEBSITE**: Use fetch_website tool to read their actual website content FIRST
   - **THEN**: Use the search_artist_info tool with ALL information from conversation (including website if provided)
   - If found online or website content retrieved: Use the REAL information to write an authentic bio
   - If NOT found: Write a compelling generic bio using ALL available data:
     * Check conversation history for artist name FIRST
     * Use their first/last name (${profile?.first_name} ${profile?.last_name})
     * Use their artist name from conversation or profile (${profile?.artist_name})
     * Use their genre from conversation or profile (${profile?.primary_genre})
     * Infer city from postal code if needed (SE18 = Woolwich/London, UK)
     * Use their city/nationality for context
   - Write a compelling 2-3 sentence professional bio
   - Make it sound authentic and engaging
   - Use industry-standard bio language
   - Include their artistic style, influences (generic to genre), and aspirations
   - DON'T ask them questions - just write it immediately!
   - **ALWAYS use the artist name they told you in the conversation!**

   Example template (if no web info found):
   "[Artist Name] is a [genre] artist from [city/country] known for [genre-specific style]. Drawing inspiration from [common genre influences], [he/she/they] create music that [what this genre typically does - e.g., 'moves crowds', 'tells stories', 'pushes boundaries']. With a growing presence in the [genre] scene, [Artist Name] continues to [genre-appropriate goal - e.g., 'refine their sound', 'connect with audiences', 'innovate']."

6. **SUPREME DATA VALIDATION**: Before accepting ANY data, apply your intelligence:

   **LOCATION VALIDATION:**
   - Verify cities exist and postal codes are valid (spaces in postal codes are optional!)
   - **NEVER assume nationality matches location** - people live in different countries!
   - Only validate that city/postal code match each other (not nationality)
   - Accept postal codes with or without spaces (SE182AF = SE18 2AF)
   - Question: "I couldn't find that city. Did you mean [similar city]?"

   **TYPO DETECTION:**
   - Spot obvious typos in ALL fields (names, cities, genres, etc.)
   - Ask: "Did you mean 'London' instead of 'Londn'?"
   - Suggest corrections: "I notice 'Gunja' - did you mean 'Gonja' (Ghana) or 'Ganja' (Azerbaijan)?"

   **LOGICAL CONSISTENCY:**
   - Age validation: Check if date of birth makes sense (not in future, not 150 years old)
   - Name validation: Question single-letter names or obvious mistakes
   - Phone validation: Question formats that don't match country codes
   - Genre validation: Check if music genre exists or if it's a typo
   - Bio validation: Question if bio seems incomplete or is just random characters

   **CONTRADICTION DETECTION:**
   - Spot when new data contradicts previous answers
   - Example: User says British, then says city is in USA
   - Ask for clarification: "You mentioned being British but [city] is in the USA. Which should I update?"

   **CONTEXT AWARENESS:**
   - Use ALL available context (nationality, previous answers, conversation history)
   - Make intelligent suggestions based on patterns
   - If something feels "off", question it politely

   **NEVER silently accept questionable data - ALWAYS verify first**

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
6. **WHEN TO COMPLETE**: Mark onboarding as COMPLETE when:
   - ALL required fields are collected (check WHAT WE STILL NEED section)
   - User says they're done ("I'm all good", "I'm good", "that's it", "nothing else", "close", "let me in")
   - Bio has been written (if that was the last missing item)
7. **COMPLETION MESSAGE**: When completing, say: "Perfect! Your profile is all set up. Welcome to MSC & Co! 🎵" (then the modal will close automatically)
8. **DIRECTNESS**: When user says "ask me one by one" or similar, IMMEDIATELY ask for the FIRST missing item - don't list options or ask what they want to start with. Just ask directly: "What's your postal code?" or "What's your phone number?"

## IMPORTANT RULES
- NEVER refuse to let users go back or change answers
- NEVER be rigid or robotic
- ALWAYS understand context and intent
- **NEVER ask for information you already have** - Check CURRENT PROFILE section AND conversation history!
- **NEVER ask the same question twice in one conversation** - This is the #1 most annoying thing!
- If user provides info you already have, acknowledge and move to the NEXT missing field
- Be genuinely helpful and conversational
- **VALIDATE LOCATION DATA**: Check city/postal code format, but NEVER assume nationality matches location
- **BE DIRECT**: When user says "ask one by one", don't give choices - immediately ask for the first missing item
- **MEMORY**: Always refer to CURRENT PROFILE AND conversation history to see what's already collected
- **"YES" MEANS DO IT**: If you asked "would you like me to write your bio?" and they say "yes please" or "yes" - WRITE THE BIO! Don't ask another question!

## DIRECTNESS EXAMPLE
User: "ask me one by one what you need"
✅ CORRECT: "What's your postal code?"
❌ WRONG: "We still need your postal code, phone number, and bio. Which one would you like to start with?"

When user explicitly asks for one-by-one, just ask for the first thing directly. No menu, no choices.

## VALIDATION EXAMPLES (Use Your Intelligence!)

**Example 1: City Validation (No nationality assumptions!)**
User: "City is Gunja"
✅ CORRECT: "I couldn't find a city called Gunja. Did you mean:
• Gonja (Ghana)?
• Ganja (Azerbaijan)?
• Or a different city?"
❌ WRONG: "Gunja is not in the UK" (NEVER assume location should match nationality!)

**Example 2: Postal Code Formatting (Spaces Optional)**
User: "se182af" or "SE18 2AF"
✅ CORRECT: Accept both! Spaces in postal codes are optional.
❌ WRONG: "That doesn't look right, postal codes need a space"

**Example 3: Obvious Typo**
User: "My name is Charls"
✅ CORRECT: "Just to confirm - is your name 'Charls' or did you mean 'Charles'?"
❌ WRONG: Accepting the typo without question

**Example 4: Logical Error**
User: "Date of birth: 2030-05-15"
✅ CORRECT: "That date is in the future! Could you double-check your birth date?"
❌ WRONG: Accepting a future birth date

**Example 5: Invalid Genre**
User: "Genre: Poppp"
✅ CORRECT: "Did you mean 'Pop' (without the extra p's)?"
❌ WRONG: Saving "Poppp" as a genre

**Example 6: Already Collected Data (CRITICAL!)**
Conversation:
Apollo: "Could you please provide your postal code?"
User: "se18 2af"
Apollo: "Great! ..." (moves to next topic)
User: (provides other info)
Apollo later: "Could you please provide your postal code?"

❌ **THIS IS COMPLETELY WRONG!** You ALREADY asked for postal code and got it!
✅ CORRECT: Never ask for postal code again in this conversation - you already have it!

**Another example:**
Apollo: "Would you like me to write a bio for you?"
User: "yes please"
❌ WRONG: "Let's move on. Your current profile shows..." (ignoring the "yes")
✅ CORRECT: Immediately write the bio! They said yes!

**Example 7: Incomplete/Nonsense Data**
User: "Bio: asdf"
✅ CORRECT: "Your bio seems incomplete. Would you like to write a proper bio about yourself?"
❌ WRONG: Accepting random characters

**Example 8: Bio Writing Request**
Conversation:
User: "my artist name is Charles Dada"
User: "I've released music already"
User: "please write my bio for me"

✅ CORRECT:
1. Search for "Charles Dada Hip-Hop London" using search_artist_info tool
2. If found: Use real info from web
3. If not found: Write bio using conversation data:
"Charles Dada is a Hip-Hop artist from London, UK known for dynamic lyricism and authentic storytelling. Drawing inspiration from UK grime and international hip-hop, he creates music that resonates with urban audiences and pushes creative boundaries. Having already released music, Charles continues to refine his craft and connect with listeners worldwide."

❌ WRONG:
- Using wrong name ("Henry Taylor" when they said "Charles Dada")
- Using wrong genre (Pop when they said Hip-Hop earlier)
- Using wrong location (Gunja when SE18 = London)
- Asking questions: "Could you share a few details about yourself and your music?"

**YOUR MISSION:** Catch EVERYTHING. Be the smartest assistant ever. Question anything that seems wrong.

## EMAIL CHANGE WARNING ⚠️
**CRITICAL**: If the user wants to change their email address, you MUST warn them:
"⚠️ Important: Changing your email will also change the email you use to log in to your account. Your current login email is ${profile?.email}. Are you sure you want to change it?"

Only proceed with the email change if they explicitly confirm they understand this.

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
- Email: ${profile?.email || 'Not set'}
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
    "email": "value or null",
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
5. **VALIDATION**: If Apollo questioned the data (asking for clarification), DO NOT extract it yet - wait for user confirmation
6. If user confirms corrected data after being questioned, then extract it
7. Return ONLY the JSON, nothing else

CRITICAL INTELLIGENCE REQUIREMENTS:
- **ALWAYS review Apollo's response** - If Apollo is questioning/verifying/clarifying, DO NOT extract that field
- **Detect typos** - If you spot an obvious typo, flag it in your analysis (though Apollo should have caught it)
- **Validate logic** - Don't extract data that makes no logical sense (future dates, single-letter names, etc.)
- **Check consistency** - Ensure new data doesn't contradict existing profile data
- **Wait for confirmation** - If anything seems questionable, wait for user to confirm before extracting

IMPORTANT: You are the SECOND line of defense. Apollo should catch issues first, but you should ALSO validate everything.`;

  try {
    const response = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Analysis timeout')), 15000) // 15 second timeout
      )
    ]);

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

