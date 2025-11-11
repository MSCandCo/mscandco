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

    const {
      lyrics_text,
      release_id,
      track_number,
      track_name,
      language = 'en',
      enable_multi_model = true,
      enable_advanced_analysis = true,
    } = await request.json();

    if (!lyrics_text) {
      return NextResponse.json({ error: 'Lyrics text is required' }, { status: 400 });
    }

    // Check subscription and limits
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    const limits = {
      free: 3,
      pro: 50,
      mpp_partner: -1,
      investment_partner: -1,
    };

    const { count: usageCount } = await supabase
      .from('lyrics')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.id)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    const limit = limits[profile?.subscription_tier || 'free'];
    if (limit !== -1 && usageCount >= limit) {
      return NextResponse.json({
        error: 'Monthly limit reached. Upgrade your plan for unlimited analyses.',
        limit,
        usage: usageCount,
      }, { status: 402 });
    }

    // Save lyrics
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

    const analyses = [];

    if (process.env.OPENAI_API_KEY) {
      const OpenAI = require('openai').default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // ENTERPRISE ANALYSES

      // 1. Multi-Model Sentiment Analysis
      const sentimentAnalysis = await analyzeAdvancedSentiment(openai, lyrics_text);
      await saveAnalysis(supabase, savedLyrics.id, 'sentiment', sentimentAnalysis);
      analyses.push(sentimentAnalysis);

      // 2. Advanced Theme Analysis with Cultural References
      const themeAnalysis = await analyzeAdvancedThemes(openai, lyrics_text);
      await saveAnalysis(supabase, savedLyrics.id, 'themes', themeAnalysis);
      analyses.push(themeAnalysis);

      // 3. Song Structure Analysis
      const structureAnalysis = await analyzeSongStructure(openai, lyrics_text);
      await saveAnalysis(supabase, savedLyrics.id, 'structure', structureAnalysis);
      analyses.push(structureAnalysis);

      // 4. Rhyme Scheme Detection
      const rhymeAnalysis = analyzeRhymeScheme(lyrics_text);
      await saveAnalysis(supabase, savedLyrics.id, 'rhyme_scheme', rhymeAnalysis);
      analyses.push(rhymeAnalysis);

      // 5. Literary Devices Detection
      const literaryAnalysis = await analyzeLiteraryDevices(openai, lyrics_text);
      await saveAnalysis(supabase, savedLyrics.id, 'literary_devices', literaryAnalysis);
      analyses.push(literaryAnalysis);

      // 6. Emotional Arc
      const emotionalArc = await analyzeEmotionalArc(openai, lyrics_text);
      await saveAnalysis(supabase, savedLyrics.id, 'emotional_arc', emotionalArc);
      analyses.push(emotionalArc);

      // 7. Vocabulary Analysis
      const vocabAnalysis = analyzeVocabulary(lyrics_text);
      await saveAnalysis(supabase, savedLyrics.id, 'vocabulary', vocabAnalysis);
      analyses.push(vocabAnalysis);

      // 8. Readability & Accessibility
      const readabilityAnalysis = analyzeReadability(lyrics_text);
      await saveAnalysis(supabase, savedLyrics.id, 'readability', readabilityAnalysis);
      analyses.push(readabilityAnalysis);

      // 9. Profanity & Content Advisory
      const profanityAnalysis = analyzeProfanity(lyrics_text);
      await saveAnalysis(supabase, savedLyrics.id, 'profanity', profanityAnalysis);
      analyses.push(profanityAnalysis);

      // 10. Copyright Risk Analysis
      const copyrightAnalysis = await analyzeCopyrightRisk(openai, lyrics_text);
      await saveAnalysis(supabase, savedLyrics.id, 'copyright_risk', copyrightAnalysis);
      analyses.push(copyrightAnalysis);

      // 11. Genre Classification
      const genreAnalysis = await analyzeGenre(openai, lyrics_text);
      await saveAnalysis(supabase, savedLyrics.id, 'genre', genreAnalysis);
      analyses.push(genreAnalysis);

      // 12. Hit Potential Score (ML Prediction)
      const hitPotential = await predictHitPotential(openai, lyrics_text, analyses);
      await saveAnalysis(supabase, savedLyrics.id, 'hit_potential', hitPotential);
      analyses.push(hitPotential);

      // 13. Generate Advanced Suggestions
      const suggestions = await generateAdvancedSuggestions(openai, lyrics_text, analyses);
      for (const suggestion of suggestions) {
        await supabase.from('lyrics_suggestions').insert({
          lyrics_id: savedLyrics.id,
          ...suggestion,
          status: 'pending',
        });
      }

      // 14. Generate Alternative Versions
      const alternatives = await generateAlternativeVersions(openai, lyrics_text);
      analyses.push({ type: 'alternatives', data: alternatives, confidence: 85 });

    } else {
      analyses.push({
        type: 'error',
        data: { message: 'OPENAI_API_KEY not configured. Add to environment variables for full analysis.' },
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
      enterprise_features_enabled: process.env.OPENAI_API_KEY ? true : false,
    });

  } catch (error) {
    console.error('Enterprise lyrics analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function saveAnalysis(supabase, lyrics_id, type, analysis) {
  await supabase.from('lyrics_analysis').upsert({
    lyrics_id,
    analysis_type: type,
    analysis_data: analysis.data,
    confidence_score: analysis.confidence,
    analyzed_by: 'openai-gpt4-enterprise',
  }, { onConflict: 'lyrics_id,analysis_type' });
}

// ENTERPRISE AI ANALYSIS FUNCTIONS

async function analyzeAdvancedSentiment(openai, lyrics) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `You are an expert music critic and psychologist. Analyze these lyrics with deep emotional intelligence.

Return JSON with:
- overall_sentiment: "positive" | "negative" | "neutral" | "mixed" | "bittersweet"
- primary_emotion: main emotion (joy, sadness, anger, fear, love, nostalgia, etc.)
- secondary_emotions: array of supporting emotions
- emotional_intensity: 0-100 scale
- emotional_authenticity: 0-100 (how genuine/vulnerable)
- emotional_complexity: 0-100 (emotional depth and nuance)
- mood: overall mood (melancholic, euphoric, anxious, peaceful, etc.)
- tone: delivery tone (introspective, aggressive, playful, serious, etc.)
- perspective: "first-person" | "second-person" | "third-person" | "mixed"
- narrative_voice: "confessional" | "observational" | "storytelling" | "abstract"
- explanation: detailed analysis (2-3 sentences)`,
    }, {
      role: 'user',
      content: lyrics,
    }],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content);
  return { type: 'sentiment', data: result, confidence: 95 };
}

async function analyzeAdvancedThemes(openai, lyrics) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `Analyze these lyrics for themes, symbolism, and cultural references.

Return JSON with:
- main_theme: primary theme
- sub_themes: array of secondary themes
- themes_breakdown: [{theme, prevalence_pct, description}]
- symbolism: [{symbol, meaning, frequency}]
- metaphors: array of metaphors found
- cultural_references: [{reference, type (pop_culture/historical/literary), context}]
- social_commentary: any social/political messages
- universal_vs_personal: 0-100 (0=very personal, 100=universal)
- time_period_hints: clues about when this was written
- lyrical_style: "narrative" | "abstract" | "stream_of_consciousness" | "poetic" | "direct"`,
    }, {
      role: 'user',
      content: lyrics,
    }],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content);
  return { type: 'themes', data: result, confidence: 90 };
}

async function analyzeSongStructure(openai, lyrics) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `Analyze the structural elements of these lyrics.

Return JSON with:
- structure: array like ["verse", "chorus", "verse", "chorus", "bridge", "chorus"]
- verse_count: number
- chorus_count: number
- bridge_present: boolean
- pre_chorus_present: boolean
- outro_present: boolean
- hook_line: the most memorable line (if identifiable)
- repetition_score: 0-100 (how much is repeated)
- structure_type: "traditional" | "experimental" | "minimalist" | "complex"
- sections: [{type, start_line, end_line, content}]`,
    }, {
      role: 'user',
      content: lyrics,
    }],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content);
  return { type: 'structure', data: result, confidence: 88 };
}

function analyzeRhymeScheme(lyrics) {
  const lines = lyrics.split('\n').filter(line => line.trim().length > 0);

  const getLastWord = (line) => {
    const words = line.trim().toLowerCase().replace(/[.,!?;:]$/, '').split(/\s+/);
    return words[words.length - 1];
  };

  const soundsLike = (word1, word2) => {
    if (word1 === word2) return true;

    const endings = [word1.slice(-2), word1.slice(-3), word1.slice(-4)];
    return endings.some(ending => word2.endsWith(ending) && ending.length > 1);
  };

  const scheme = [];
  const rhymeMap = {};
  let currentLetter = 'A';

  lines.forEach((line, i) => {
    const lastWord = getLastWord(line);
    let found = false;

    for (const [rhymeWord, letter] of Object.entries(rhymeMap)) {
      if (soundsLike(lastWord, rhymeWord)) {
        scheme.push(letter);
        found = true;
        break;
      }
    }

    if (!found) {
      scheme.push(currentLetter);
      rhymeMap[lastWord] = currentLetter;
      currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
    }
  });

  const schemeStr = scheme.join('');
  let pattern = 'custom';

  if (schemeStr.match(/AABB/)) pattern = 'couplet (AABB)';
  else if (schemeStr.match(/ABAB/)) pattern = 'alternate (ABAB)';
  else if (schemeStr.match(/ABCB/)) pattern = 'simple four-line (ABCB)';
  else if (schemeStr.match(/AAAA/)) pattern = 'monorhyme (AAAA)';

  const rhymeCount = new Set(scheme).size;
  const totalLines = lines.length;
  const rhymeDensity = ((totalLines - rhymeCount) / totalLines * 100).toFixed(1);

  return {
    type: 'rhyme_scheme',
    data: {
      scheme: schemeStr,
      pattern,
      rhyme_density: parseFloat(rhymeDensity),
      total_lines: totalLines,
      unique_rhymes: rhymeCount,
      lines_with_rhymes: totalLines - scheme.filter(l => l === scheme[0]).length,
    },
    confidence: 85,
  };
}

async function analyzeLiteraryDevices(openai, lyrics) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `Identify literary devices used in these lyrics.

Return JSON with:
- metaphors: [{line, metaphor, meaning}]
- similes: [{line, comparison}]
- personification: [{line, what_is_personified}]
- alliteration: [{line, repeated_sound}]
- assonance: [{line, vowel_sound}]
- repetition: [{phrase, count, purpose}]
- imagery: [{line, sense (visual/auditory/tactile/etc), description}]
- symbolism: [{symbol, potential_meanings}]
- hyperbole: [{line, exaggeration}]
- irony: [{line, type (situational/dramatic/verbal)}]
- literary_score: 0-100 (sophistication of devices used)`,
    }, {
      role: 'user',
      content: lyrics,
    }],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content);
  return { type: 'literary_devices', data: result, confidence: 87 };
}

async function analyzeEmotionalArc(openai, lyrics) {
  const sections = lyrics.split('\n\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `Analyze how the emotion changes throughout the song.

Return JSON with:
- arc_type: "ascending" | "descending" | "roller_coaster" | "stable" | "v_shape" | "inverse_v"
- emotional_journey: [{section_num, emotion, intensity_0_100}]
- climax_point: which section number has peak emotion
- resolution: "resolved" | "unresolved" | "ambiguous"
- emotional_range: 0-100 (how much emotion varies)
- narrative_progression: description of emotional journey`,
    }, {
      role: 'user',
      content: `Song lyrics divided into sections:\n\n${sections.map((s, i) => `Section ${i+1}:\n${s}`).join('\n\n')}`,
    }],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content);
  return { type: 'emotional_arc', data: result, confidence: 82 };
}

function analyzeVocabulary(lyrics) {
  const words = lyrics.toLowerCase().match(/\b[a-z']+\b/g) || [];
  const uniqueWords = new Set(words);

  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'her', 'us', 'them']);

  const contentWords = words.filter(w => !commonWords.has(w));
  const uniqueContentWords = new Set(contentWords);

  const lexicalDiversity = (uniqueWords.size / words.length * 100).toFixed(1);
  const avgWordLength = (words.reduce((sum, w) => sum + w.length, 0) / words.length).toFixed(1);

  const wordFreq = {};
  words.forEach(w => wordFreq[w] = (wordFreq[w] || 0) + 1);
  const topWords = Object.entries(wordFreq)
    .filter(([word]) => !commonWords.has(word))
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  return {
    type: 'vocabulary',
    data: {
      total_words: words.length,
      unique_words: uniqueWords.size,
      unique_content_words: uniqueContentWords.size,
      lexical_diversity: parseFloat(lexicalDiversity),
      avg_word_length: parseFloat(avgWordLength),
      vocabulary_sophistication: avgWordLength > 5 ? 'advanced' : avgWordLength > 4 ? 'moderate' : 'simple',
      top_words: topWords,
      repetition_score: ((words.length - uniqueWords.size) / words.length * 100).toFixed(1),
    },
    confidence: 100,
  };
}

function analyzeReadability(lyrics) {
  const sentences = lyrics.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = lyrics.match(/\b[a-z']+\b/gi) || [];
  const syllables = lyrics.match(/[aeiouy]+/gi)?.length || 0;
  const lines = lyrics.split('\n').filter(l => l.trim().length > 0);

  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  const avgSyllablesPerWord = words.length > 0 ? syllables / words.length : 0;

  const fleschScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  const clampedScore = Math.max(0, Math.min(100, fleschScore));

  const gradeLevel = Math.max(1, Math.min(16, Math.round(
    0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59
  )));

  let complexity, audience;
  if (clampedScore > 80) { complexity = 'very_easy'; audience = 'Grade 5 and below'; }
  else if (clampedScore > 60) { complexity = 'easy'; audience = 'Grade 6-8'; }
  else if (clampedScore > 50) { complexity = 'moderate'; audience = 'Grade 9-10'; }
  else if (clampedScore > 30) { complexity = 'difficult'; audience = 'Grade 11-12'; }
  else { complexity = 'very_difficult'; audience = 'College level'; }

  return {
    type: 'readability',
    data: {
      flesch_reading_ease: Math.round(clampedScore),
      grade_level: gradeLevel,
      complexity,
      target_audience: audience,
      word_count: words.length,
      sentence_count: sentences.length,
      line_count: lines.length,
      avg_words_per_sentence: avgWordsPerSentence.toFixed(1),
      avg_syllables_per_word: avgSyllablesPerWord.toFixed(2),
      accessibility_score: clampedScore > 60 ? 'high' : clampedScore > 40 ? 'moderate' : 'low',
    },
    confidence: 100,
  };
}

function analyzeProfanity(lyrics) {
  const profanityWords = [
    'damn', 'hell', 'shit', 'fuck', 'fucking', 'fucked', 'motherfucker',
    'bitch', 'bitches', 'ass', 'asshole', 'bastard', 'piss', 'pissed',
    'crap', 'dick', 'pussy', 'cock', 'whore', 'slut', 'nigga', 'nigger'
  ];

  const lyricsLower = lyrics.toLowerCase();
  const found = profanityWords.filter(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    return regex.test(lyricsLower);
  });

  const count = found.length;

  let severity, explicitLabel, recommendation, dsps_action;

  if (count === 0) {
    severity = 'clean';
    explicitLabel = false;
    recommendation = 'No explicit content warning needed. Safe for all audiences.';
    dsps_action = 'No action required';
  } else if (count <= 2) {
    severity = 'mild';
    explicitLabel = false;
    recommendation = 'Consider adding explicit warning for sensitive audiences.';
    dsps_action = 'Optional explicit tag';
  } else if (count <= 5) {
    severity = 'moderate';
    explicitLabel = true;
    recommendation = 'Add explicit content warning to release. Required by most DSPs.';
    dsps_action = 'REQUIRED: Mark as explicit';
  } else {
    severity = 'explicit';
    explicitLabel = true;
    recommendation = 'Strong explicit content warning required. May limit radio play and playlist placements.';
    dsps_action = 'REQUIRED: Mark as explicit + age gate';
  }

  return {
    type: 'profanity',
    data: {
      has_profanity: count > 0,
      profanity_count: count,
      flagged_words: found,
      severity,
      explicit_label_needed: explicitLabel,
      recommendation,
      dsps_action,
      radio_friendly: count === 0,
      playlist_placement_impact: count > 3 ? 'significant_impact' : count > 0 ? 'minor_impact' : 'no_impact',
    },
    confidence: 100,
  };
}

async function analyzeCopyrightRisk(openai, lyrics) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `Analyze these lyrics for potential copyright issues.

Return JSON with:
- originality_score: 0-100 (higher = more original)
- common_phrases: [{phrase, how_common: "very_common"|"common"|"unique"}]
- potential_matches: [{similar_to: "song/phrase", confidence: 0-100, concern_level: "low"|"medium"|"high"}]
- unique_expressions: count of unique/creative phrases
- cliche_count: number of cliched/overused phrases
- recommendation: "safe_to_use" | "review_recommended" | "legal_review_required"
- explanation: detailed analysis`,
    }, {
      role: 'user',
      content: lyrics,
    }],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content);
  return { type: 'copyright_risk', data: result, confidence: 80 };
}

async function analyzeGenre(openai, lyrics) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `Based solely on lyrical content and style, predict the music genre.

Return JSON with:
- primary_genre: most likely genre
- secondary_genres: array of other possible genres
- genre_confidence: 0-100
- subgenre: specific subgenre if applicable
- reasoning: why you chose this genre
- lyrical_markers: specific elements that indicate genre (storytelling style, vocabulary, themes)`,
    }, {
      role: 'user',
      content: lyrics,
    }],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content);
  return { type: 'genre', data: result, confidence: 75 };
}

async function predictHitPotential(openai, lyrics, analyses) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `You are a music industry expert. Predict the commercial hit potential of this song based on lyrics.

Consider:
- Universal themes vs niche topics
- Catchiness and memorability
- Emotional resonance
- Radio friendliness
- Playlist potential
- Mainstream appeal vs artistic integrity

Return JSON with:
- hit_potential_score: 0-100
- commercial_viability: "very_high" | "high" | "moderate" | "low" | "niche"
- radio_potential: 0-100
- playlist_potential: 0-100
- viral_potential: 0-100
- strengths: array of commercial strengths
- weaknesses: array of commercial weaknesses
- target_audience: demographic description
- comparable_hits: similar successful songs
- recommendations: how to increase commercial appeal`,
    }, {
      role: 'user',
      content: `Lyrics:\n${lyrics}\n\nAnalysis data:\n${JSON.stringify(analyses, null, 2)}`,
    }],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content);
  return { type: 'hit_potential', data: result, confidence: 70 };
}

async function generateAdvancedSuggestions(openai, lyrics, analyses) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `You are a professional songwriter and producer. Provide specific, actionable suggestions to improve these lyrics.

Consider the analysis data and suggest improvements for:
- Weak rhymes or meter issues
- Clichéd phrases that could be more unique
- Grammatical improvements
- Flow and rhythm enhancements
- Emotional impact
- Clarity and imagery
- Hook strength

Return JSON with:
{
  "suggestions": [
    {
      "suggestion_type": "rhyme" | "grammar" | "flow" | "vocabulary" | "structure" | "imagery" | "impact",
      "original_line": "exact line from lyrics",
      "suggested_line": "your improved version",
      "explanation": "why this is better (1-2 sentences)",
      "confidence_score": 0-100,
      "priority": "high" | "medium" | "low"
    }
  ]
}

Provide 10-15 suggestions, prioritizing the most impactful changes.`,
    }, {
      role: 'user',
      content: `Lyrics:\n${lyrics}\n\nAnalysis:\n${JSON.stringify(analyses.slice(0, 5), null, 2)}`,
    }],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content);
  return result.suggestions || [];
}

async function generateAlternativeVersions(openai, lyrics) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `Generate 3 alternative versions of these lyrics with different approaches:
1. More poetic/abstract version
2. More direct/accessible version
3. More edgy/bold version

Keep the core theme but vary the style. Return JSON with:
{
  "versions": [
    {
      "type": "poetic" | "accessible" | "edgy",
      "title": "descriptive title",
      "lyrics": "full rewritten lyrics",
      "key_changes": "what changed",
      "target_audience": "who this version appeals to"
    }
  ]
}`,
    }, {
      role: 'user',
      content: lyrics,
    }],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content);
  return result.versions || [];
}
