import { createServerClient } from '@supabase/ssr';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    
    // Authenticate user first
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role client to bypass RLS for database operations
    // Use createServiceClient pattern (same as other working routes)
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
      return NextResponse.json({ 
        error: 'Service role key is not configured. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables.',
      }, { status: 500 });
    }

    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('🔑 Using service role for lyrics operations');
    console.log('📊 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔐 Service key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { lyrics_text, release_id, track_number, track_name, language = 'en' } = await request.json();

    if (!lyrics_text) {
      return NextResponse.json({ error: 'Lyrics text is required' }, { status: 400 });
    }

    // Get user profile to check subscription tier
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    // Check feature usage limits
    const { count: usageCount } = await supabaseAdmin
      .from('lyrics')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.id)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    const limits = {
      free: 3,
      pro: 50,
      mpp_partner: -1,
      investment_partner: -1,
    };

    const limit = limits[profile?.subscription_tier || 'free'];
    if (limit !== -1 && usageCount >= limit) {
      return NextResponse.json({
        error: 'Monthly limit reached. Upgrade your plan for more analyses.',
        limit,
        usage: usageCount,
      }, { status: 402 });
    }

    // Save lyrics to database
    console.log('💾 Attempting to save lyrics for user:', user.id);
    console.log('🔑 Using service role client to bypass RLS');
    console.log('📝 Insert data:', {
      release_id: release_id || null,
      track_number: track_number || 1,
      track_name: track_name || 'Untitled',
      language,
      created_by: user.id,
      lyrics_text_length: lyrics_text?.length || 0
    });
    
    // Verify service role client is working by checking if we can query the table
    const { data: testQuery, error: testError } = await supabaseAdmin
      .from('lyrics')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Service role test query failed:', testError);
      return NextResponse.json({ 
        error: 'Service role client cannot access lyrics table. Please verify SUPABASE_SERVICE_ROLE_KEY is correct.',
        details: testError.message,
        code: testError.code
      }, { status: 500 });
    }
    console.log('✅ Service role client can access lyrics table');
    
    const { data: savedLyrics, error: saveError } = await supabaseAdmin
      .from('lyrics')
      .insert({
        release_id: release_id || null,
        track_number: track_number || 1,
        track_name: track_name || 'Untitled',
        lyrics_text,
        language,
        created_by: user.id,
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Error saving lyrics:', saveError);
      console.error('Error code:', saveError.code);
      console.error('Error message:', saveError.message);
      console.error('Error details:', saveError.details);
      console.error('Error hint:', saveError.hint);
      console.error('Full error object:', JSON.stringify(saveError, null, 2));
      
      // Provide more helpful error message
      if (saveError.code === '42501' || saveError.message?.includes('permission denied') || saveError.message?.includes('new row violates row-level security')) {
        return NextResponse.json({ 
          error: 'Permission denied. The service role key may not be configured correctly, or RLS is blocking access. Please check your environment variables and database configuration.',
          details: saveError.message,
          code: saveError.code,
          hint: saveError.hint
        }, { status: 403 });
      }
      
      if (saveError.code === '42P01' || saveError.message?.includes('does not exist')) {
        return NextResponse.json({ 
          error: 'The lyrics table does not exist. Please run the database migration to create it.',
          details: saveError.message 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to save lyrics',
        details: saveError.message || 'Unknown error',
        code: saveError.code
      }, { status: 500 });
    }

    console.log('✅ Lyrics saved successfully:', savedLyrics.id);

    // Perform AI analysis using OpenAI
    const analyses = [];

    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = require('openai').default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // Sentiment Analysis
        const sentimentAnalysis = await analyzeSentiment(openai, lyrics_text);
        analyses.push(sentimentAnalysis);

        // Theme Analysis
        const themeAnalysis = await analyzeThemes(openai, lyrics_text);
        analyses.push(themeAnalysis);

        // Readability Analysis
        const readabilityAnalysis = analyzeReadability(lyrics_text);
        analyses.push(readabilityAnalysis);

        // Profanity Check
        const profanityAnalysis = analyzeProfanity(lyrics_text);
        analyses.push(profanityAnalysis);

        // Generate Suggestions
        const suggestions = await generateSuggestions(openai, lyrics_text);

        // Update the lyrics record with all analysis results
        await supabaseAdmin
          .from('lyrics')
          .update({
            sentiment_analysis: sentimentAnalysis.data,
            themes: themeAnalysis.data,
            readability_score: readabilityAnalysis.data,
            suggestions: suggestions,
          })
          .eq('id', savedLyrics.id);

      } catch (aiError) {
        console.error('AI Analysis Error:', aiError);
        // Continue without AI analysis
        analyses.push({
          type: 'error',
          data: { message: 'AI analysis temporarily unavailable' },
          confidence: 0,
        });
      }
    } else {
      analyses.push({
        type: 'info',
        data: { message: 'OpenAI API key not configured. Add OPENAI_API_KEY to environment variables.' },
        confidence: 0,
      });
    }

    return NextResponse.json({
      success: true,
      lyrics_id: savedLyrics.id,
      analyses,
      usage: {
        current: usageCount + 1,
        limit: limit === -1 ? 'unlimited' : limit,
      },
    });

  } catch (error) {
    console.error('Lyrics analysis error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: error.message || 'An unexpected error occurred',
      details: error.details || error.toString()
    }, { status: 500 });
  }
}

// AI Analysis Functions
async function analyzeSentiment(openai, lyrics) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: 'Analyze the sentiment and emotional tone of these lyrics. Return JSON with: overall_sentiment (positive/negative/neutral/mixed), primary_emotion, secondary_emotions (array), intensity (0-100), and explanation.',
    }, {
      role: 'user',
      content: lyrics,
    }],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content);
  return {
    type: 'sentiment',
    data: result,
    confidence: 95,
  };
}

async function analyzeThemes(openai, lyrics) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: 'Identify the main themes in these lyrics. Return JSON with: themes (array of objects with theme name and prevalence_percentage), main_topic, sub_topics (array), lyrical_style, and narrative_perspective.',
    }, {
      role: 'user',
      content: lyrics,
    }],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content);
  return {
    type: 'themes',
    data: result,
    confidence: 90,
  };
}

function analyzeReadability(lyrics) {
  const words = lyrics.split(/\s+/).filter(w => w.length > 0).length;
  const sentences = lyrics.split(/[.!?]+/).filter(s => s.length > 0).length;
  const syllables = lyrics.split(/[aeiouy]+/gi).length - 1;
  const lines = lyrics.split('\n').filter(l => l.trim().length > 0).length;

  const avgWordsPerSentence = sentences > 0 ? (words / sentences) : 0;
  const avgSyllablesPerWord = words > 0 ? (syllables / words) : 0;
  const fleschScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  const clampedScore = Math.max(0, Math.min(100, fleschScore));

  let complexity;
  if (clampedScore > 80) complexity = 'very_easy';
  else if (clampedScore > 60) complexity = 'easy';
  else if (clampedScore > 30) complexity = 'moderate';
  else complexity = 'difficult';

  return {
    type: 'readability',
    data: {
      flesch_score: Math.round(clampedScore),
      word_count: words,
      sentence_count: sentences,
      line_count: lines,
      avg_words_per_sentence: avgWordsPerSentence.toFixed(1),
      complexity,
      grade_level: Math.max(1, Math.min(16, Math.round(0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59))),
    },
    confidence: 100,
  };
}

function analyzeProfanity(lyrics) {
  const profanityWords = [
    'damn', 'hell', 'shit', 'fuck', 'fucking', 'bitch', 'ass', 'asshole',
    'bastard', 'piss', 'crap', 'dick', 'pussy', 'cock', 'whore', 'slut'
  ];

  const lyricsLower = lyrics.toLowerCase();
  const found = profanityWords.filter(word => lyricsLower.includes(word));
  const count = found.length;

  let severity;
  let explicitLabel = false;

  if (count === 0) severity = 'clean';
  else if (count <= 2) severity = 'mild';
  else if (count <= 5) { severity = 'moderate'; explicitLabel = true; }
  else { severity = 'explicit'; explicitLabel = true; }

  return {
    type: 'profanity',
    data: {
      has_profanity: count > 0,
      profanity_count: count,
      flagged_words: found,
      severity,
      explicit_label_needed: explicitLabel,
      recommendation: explicitLabel
        ? 'Add explicit content warning to release'
        : 'No explicit content warning needed',
    },
    confidence: 100,
  };
}

async function generateSuggestions(openai, lyrics) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: `Analyze these lyrics and provide 5-10 concrete suggestions for improvement. For each suggestion, return JSON with:
        - suggestion_type: "grammar" | "rhyme" | "flow" | "vocabulary" | "structure"
        - original_line: the exact line that needs improvement
        - suggested_line: your improved version
        - explanation: why this is better (1-2 sentences)
        - confidence_score: 0-100

        Return as JSON array under "suggestions" key.`,
      }, {
        role: 'user',
        content: lyrics,
      }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.suggestions || [];
  } catch (error) {
    console.error('Suggestions generation error:', error);
    return [];
  }
}
