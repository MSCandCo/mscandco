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
      platforms, // ['instagram', 'twitter', 'tiktok']
      release_id,
      content_type = 'release_announcement', // release_announcement, behind_the_scenes, milestone, engagement
      tone = 'professional', // professional, casual, energetic, mysterious
      include_emojis = true,
      include_hashtags = true,
      max_hashtags = 5,
    } = await request.json();

    if (!platforms || platforms.length === 0) {
      return NextResponse.json({ error: 'At least one platform required' }, { status: 400 });
    }

    // Get release data if provided
    let releaseData = null;
    if (release_id) {
      const { data } = await supabase
        .from('releases')
        .select('*, artists(*)')
        .eq('id', release_id)
        .single();
      releaseData = data;
    }

    const generatedContent = {};

    // Generate content for each platform
    for (const platform of platforms) {
      const content = await generatePlatformContent(
        platform,
        content_type,
        tone,
        include_emojis,
        include_hashtags,
        max_hashtags,
        releaseData
      );

      generatedContent[platform] = content;
    }

    // Generate hashtags if requested
    const hashtags = include_hashtags
      ? await generateHashtags(content_type, releaseData, max_hashtags)
      : [];

    // Predict best time to post
    const bestTimes = await predictBestPostingTimes(platforms, user.id);

    return NextResponse.json({
      success: true,
      content: generatedContent,
      hashtags,
      best_times: bestTimes,
      metadata: {
        platforms,
        content_type,
        tone,
        generated_at: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function generatePlatformContent(
  platform,
  contentType,
  tone,
  includeEmojis,
  includeHashtags,
  maxHashtags,
  releaseData
) {
  // Platform-specific constraints
  const constraints = {
    instagram: { max_length: 2200, emoji_heavy: true, line_breaks: true },
    twitter: { max_length: 280, emoji_moderate: true, line_breaks: false },
    tiktok: { max_length: 150, emoji_heavy: true, line_breaks: false },
    facebook: { max_length: 63206, emoji_light: true, line_breaks: true },
    youtube: { max_length: 5000, emoji_light: true, line_breaks: true },
  };

  const platformConstraints = constraints[platform] || constraints.instagram;

  // Use OpenAI to generate platform-optimized content
  if (process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai').default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = buildPrompt(
      platform,
      contentType,
      tone,
      includeEmojis,
      platformConstraints,
      releaseData
    );

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a social media expert specializing in ${platform}. Create engaging, platform-optimized content that drives engagement and feels authentic to the platform's culture.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const generatedText = response.choices[0].message.content.trim();

    return {
      caption: generatedText,
      character_count: generatedText.length,
      within_limit: generatedText.length <= platformConstraints.max_length,
      call_to_action: generateCTA(platform, contentType, releaseData),
    };
  }

  // Fallback templates if OpenAI not available
  return generateFallbackContent(platform, contentType, releaseData);
}

function buildPrompt(platform, contentType, tone, includeEmojis, constraints, releaseData) {
  let prompt = `Create a ${tone} ${platform} post for a ${contentType}.

Platform: ${platform}
Max Length: ${constraints.max_length} characters
Tone: ${tone}
Emojis: ${includeEmojis ? (constraints.emoji_heavy ? 'Use emojis heavily' : 'Use emojis moderately') : 'No emojis'}
Line Breaks: ${constraints.line_breaks ? 'Use line breaks for readability' : 'Keep compact'}
`;

  if (releaseData) {
    prompt += `
Release Details:
- Title: "${releaseData.title}"
- Artist: ${releaseData.artists?.name || releaseData.artist_name}
- Genre: ${releaseData.genre}
- Release Date: ${new Date(releaseData.release_date).toLocaleDateString()}
${releaseData.description ? `- Description: ${releaseData.description}` : ''}
`;
  }

  prompt += `
Requirements:
1. Must be engaging and authentic to ${platform}'s culture
2. Include a hook in the first line to grab attention
3. End with a clear call-to-action
4. Optimize for ${platform}'s algorithm and best practices
5. DO NOT include hashtags in the caption (they will be added separately)

Generate the post caption now:`;

  return prompt;
}

async function generateHashtags(contentType, releaseData, maxHashtags) {
  const baseHashtags = {
    release_announcement: ['NewMusic', 'MusicRelease', 'OutNow', 'NewSingle', 'NewAlbum'],
    behind_the_scenes: ['BehindTheScenes', 'StudioLife', 'MusicMaking', 'CreativeProcess'],
    milestone: ['ThankYou', 'Grateful', 'MusicCommunity', 'SupportLocalMusic'],
    engagement: ['MusicLovers', 'IndieMusic', 'DiscoverMusic', 'MusicIsLife'],
  };

  let hashtags = baseHashtags[contentType] || baseHashtags.release_announcement;

  // Add genre-specific hashtags
  if (releaseData?.genre) {
    const genreTag = releaseData.genre.replace(/\s+/g, '');
    hashtags.push(genreTag, `${genreTag}Music`);
  }

  // Add platform-specific trending hashtags (would be dynamically fetched in production)
  const trendingHashtags = [
    'MusicMonday',
    'NewMusicFriday',
    'Spotify',
    'AppleMusic',
    'IndependentArtist',
    'SupportIndieMusic',
  ];

  hashtags = [...new Set([...hashtags, ...trendingHashtags])];

  // Return limited number
  return hashtags.slice(0, maxHashtags).map(tag => `#${tag}`);
}

async function predictBestPostingTimes(platforms, userId) {
  // In production, this would use ML based on user's historical engagement data
  // For now, return optimal times based on platform best practices

  const bestTimes = {
    instagram: [
      { day: 'Monday', time: '11:00', reason: 'High engagement on weekday mornings' },
      { day: 'Wednesday', time: '14:00', reason: 'Mid-week afternoon peak' },
      { day: 'Friday', time: '13:00', reason: 'Pre-weekend engagement surge' },
    ],
    twitter: [
      { day: 'Monday', time: '09:00', reason: 'Morning commute engagement' },
      { day: 'Wednesday', time: '12:00', reason: 'Lunch hour browsing' },
      { day: 'Friday', time: '17:00', reason: 'End of workday surge' },
    ],
    tiktok: [
      { day: 'Tuesday', time: '19:00', reason: 'Evening entertainment peak' },
      { day: 'Thursday', time: '18:00', reason: 'After-work scrolling' },
      { day: 'Saturday', time: '11:00', reason: 'Weekend morning leisure' },
    ],
    facebook: [
      { day: 'Monday', time: '13:00', reason: 'Afternoon Facebook break' },
      { day: 'Wednesday', time: '15:00', reason: 'Mid-afternoon engagement' },
      { day: 'Saturday', time: '12:00', reason: 'Weekend browsing peak' },
    ],
    youtube: [
      { day: 'Friday', time: '15:00', reason: 'Weekend preparation video watching' },
      { day: 'Saturday', time: '10:00', reason: 'Weekend morning content consumption' },
      { day: 'Sunday', time: '20:00', reason: 'Sunday evening relaxation' },
    ],
  };

  const result = {};

  platforms.forEach(platform => {
    result[platform] = bestTimes[platform] || bestTimes.instagram;
  });

  return result;
}

function generateCTA(platform, contentType, releaseData) {
  const ctas = {
    instagram: {
      release_announcement: 'Link in bio to listen now! 🎵',
      behind_the_scenes: 'What do you think? Drop a comment! 💭',
      milestone: 'Thank you for your support! Share with friends! ❤️',
      engagement: 'Tag someone who needs to hear this! 👇',
    },
    twitter: {
      release_announcement: '🎵 Listen now:',
      behind_the_scenes: 'Thoughts? Reply below! 💭',
      milestone: 'RT to celebrate! 🎉',
      engagement: 'Who else agrees? 👇',
    },
    tiktok: {
      release_announcement: 'Full song in bio! 🎵',
      behind_the_scenes: 'Comment your thoughts! 💭',
      milestone: 'Share the love! ❤️',
      engagement: 'Duet this! 👯',
    },
  };

  return ctas[platform]?.[contentType] || 'Check it out!';
}

function generateFallbackContent(platform, contentType, releaseData) {
  // Simple template-based fallback
  const templates = {
    instagram: `🎵 ${releaseData?.title || 'New music'} is out now!\n\n${releaseData?.description || 'Check out my latest release'}\n\nLink in bio to listen 👆`,
    twitter: `🎵 New music alert! ${releaseData?.title || 'My latest track'} is available now on all platforms!`,
    tiktok: `New music out! ${releaseData?.title || ''} 🎵 Full song in bio!`,
  };

  return {
    caption: templates[platform] || templates.instagram,
    character_count: (templates[platform] || templates.instagram).length,
    within_limit: true,
    call_to_action: generateCTA(platform, contentType, releaseData),
  };
}
