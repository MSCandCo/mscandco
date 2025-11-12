import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lyrics_text, release_id, track_number, track_name, language = 'en' } = await request.json();

    if (!lyrics_text) {
      return NextResponse.json({ error: 'Lyrics text is required' }, { status: 400 });
    }

    // Get user profile to check subscription tier
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    // Check feature usage limits
    const { count: usageCount } = await supabase
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
    const { data: savedLyrics, error: saveError } = await supabase
      .from('lyrics')
      .upsert({
        release_id,
        track_number: track_number || 1,
        track_name: track_name || 'Untitled',
        lyrics_text,
        language,
        created_by: user.id,
      }, {
        onConflict: 'release_id,track_number'
      })
      .select()
      .single();

    if (saveError) throw saveError;

    // Perform AI analysis using OpenAI
    const analyses = [];

    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = require('openai').default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // Sentiment Analysis
        const sentimentAnalysis = await analyzeSentiment(openai, lyrics_text);
        await supabase.from('lyrics_analysis').upsert({
          lyrics_id: savedLyrics.id,
          analysis_type: 'sentiment',
          analysis_data: sentimentAnalysis.data,
          confidence_score: sentimentAnalysis.confidence,
          analyzed_by: 'openai-gpt4',
        }, { onConflict: 'lyrics_id,analysis_type' });
        analyses.push(sentimentAnalysis);

        // Theme Analysis
        const themeAnalysis = await analyzeThemes(openai, lyrics_text);
        await supabase.from('lyrics_analysis').upsert({
          lyrics_id: savedLyrics.id,
          analysis_type: 'themes',
          analysis_data: themeAnalysis.data,
          confidence_score: themeAnalysis.confidence,
        }, { onConflict: 'lyrics_id,analysis_type' });
        analyses.push(themeAnalysis);

        // Readability Analysis
        const readabilityAnalysis = analyzeReadability(lyrics_text);
        await supabase.from('lyrics_analysis').upsert({
          lyrics_id: savedLyrics.id,
          analysis_type: 'readability',
          analysis_data: readabilityAnalysis.data,
          confidence_score: 100,
        }, { onConflict: 'lyrics_id,analysis_type' });
        analyses.push(readabilityAnalysis);

        // Profanity Check
        const profanityAnalysis = analyzeProfanity(lyrics_text);
        await supabase.from('lyrics_analysis').upsert({
          lyrics_id: savedLyrics.id,
          analysis_type: 'profanity',
          analysis_data: profanityAnalysis.data,
          confidence_score: 100,
        }, { onConflict: 'lyrics_id,analysis_type' });
        analyses.push(profanityAnalysis);

        // Generate Suggestions
        const suggestions = await generateSuggestions(openai, lyrics_text);
        for (const suggestion of suggestions) {
          await supabase.from('lyrics_suggestions').insert({
            lyrics_id: savedLyrics.id,
            ...suggestion,
            status: 'pending',
          });
        }

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
    return NextResponse.json({ error: error.message }, { status: 500 });
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
