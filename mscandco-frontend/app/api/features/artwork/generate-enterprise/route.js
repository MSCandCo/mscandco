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
      prompt,
      style,
      color_scheme,
      release_id,
      generate_variations = true,
      variation_count = 4,
      enable_upscale = false,
      target_resolution = '1024x1024',
      ai_model = 'dall-e-3',
    } = await request.json();

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json({ error: 'Prompt required (min 3 chars)' }, { status: 400 });
    }

    // Get credits
    const { data: allCredits } = await supabase
      .from('artwork_credits')
      .select('amount')
      .eq('user_id', user.id);

    const totalCredits = allCredits?.reduce((sum, c) => sum + c.amount, 0) || 0;
    const creditsNeeded = generate_variations ? variation_count : 1;

    if (totalCredits < creditsNeeded) {
      return NextResponse.json({
        error: `Insufficient credits. Need ${creditsNeeded}, have ${totalCredits}`,
        credits_available: totalCredits,
      }, { status: 402 });
    }

    const generations = [];

    if (process.env.OPENAI_API_KEY) {
      const OpenAI = require('openai').default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const enhancedPrompt = enhancePromptEnterprise(prompt, style, color_scheme);

      // Generate primary image
      const primaryGen = await generateWithDALLE3(openai, enhancedPrompt, supabase, user.id, release_id, {
        prompt,
        style,
        color_scheme,
        is_variation: false,
        variation_of: null,
      });

      generations.push(primaryGen);

      // Generate variations if requested
      if (generate_variations && variation_count > 1) {
        const variationPromises = [];

        for (let i = 1; i < variation_count; i++) {
          const variantPrompt = generateVariantPrompt(enhancedPrompt, i);
          variationPromises.push(
            generateWithDALLE3(openai, variantPrompt, supabase, user.id, release_id, {
              prompt,
              style,
              color_scheme,
              is_variation: true,
              variation_of: primaryGen.id,
              variation_number: i,
            })
          );
        }

        const variants = await Promise.all(variationPromises);
        generations.push(...variants);
      }

      // Deduct credits
      await supabase.from('artwork_credits').insert({
        user_id: user.id,
        credits: totalCredits - creditsNeeded,
        source: 'usage',
        amount: -creditsNeeded,
        description: `Generated ${creditsNeeded} artwork(s): "${prompt.substring(0, 50)}..."`,
      });

      // Generate auto-crops for different platforms
      const primaryImage = generations[0];
      if (primaryImage.image_url) {
        const crops = await generateSmartCrops(primaryImage.image_url);
        await supabase
          .from('artwork_generations')
          .update({ generation_params: { ...primaryGen.params, platform_crops: crops } })
          .eq('id', primaryGen.id);
      }

    } else {
      return NextResponse.json({
        error: 'OPENAI_API_KEY not configured',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      generations,
      credits_remaining: totalCredits - creditsNeeded,
      credits_used: creditsNeeded,
    });

  } catch (error) {
    console.error('Enterprise artwork generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function generateWithDALLE3(openai, prompt, supabase, userId, releaseId, metadata) {
  // Create generation record
  const { data: generation, error: genError } = await supabase
    .from('artwork_generations')
    .insert({
      user_id: userId,
      release_id: releaseId,
      prompt: metadata.prompt,
      style: metadata.style,
      color_scheme: metadata.color_scheme,
      ai_model: 'dall-e-3',
      status: 'generating',
      generation_params: {
        size: '1024x1024',
        quality: 'hd',
        is_variation: metadata.is_variation,
        variation_of: metadata.variation_of,
      },
    })
    .select()
    .single();

  if (genError) throw genError;

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: metadata.style === 'realistic' ? 'natural' : 'vivid',
    });

    const imageUrl = response.data[0].url;

    await supabase
      .from('artwork_generations')
      .update({
        status: 'completed',
        generated_image_url: imageUrl,
        thumbnail_url: imageUrl,
        completed_at: new Date().toISOString(),
      })
      .eq('id', generation.id);

    return {
      id: generation.id,
      image_url: imageUrl,
      prompt: metadata.prompt,
      is_variation: metadata.is_variation,
    };

  } catch (aiError) {
    await supabase
      .from('artwork_generations')
      .update({ status: 'failed' })
      .eq('id', generation.id);

    throw aiError;
  }
}

function enhancePromptEnterprise(basePrompt, style, colorScheme) {
  let enhanced = basePrompt;

  const styleModifiers = {
    abstract: 'abstract art, geometric shapes, modern design, avant-garde',
    realistic: 'photorealistic, highly detailed, professional photography, 8k quality',
    minimalist: 'minimalist design, clean lines, simple composition, negative space',
    vintage: 'vintage aesthetic, retro style, nostalgic feel, 1970s vibe, film grain',
    modern: 'contemporary art, sleek design, modern aesthetic, cutting-edge',
    psychedelic: 'psychedelic art, vibrant colors, trippy visuals, mind-bending, kaleidoscopic',
    surreal: 'surrealist art, dreamlike, impossible geometry, Salvador Dali inspired',
    grunge: 'grunge aesthetic, raw, edgy, distressed textures, 90s alternative',
  };

  const colorModifiers = {
    vibrant: 'vibrant colors, bold palette, high saturation, eye-catching',
    dark: 'dark tones, moody atmosphere, low key lighting, dramatic shadows',
    pastel: 'pastel colors, soft tones, gentle palette, dreamy',
    monochrome: 'black and white, monochromatic, grayscale, high contrast',
    warm: 'warm colors, orange and red tones, inviting feel, sunset palette',
    cool: 'cool colors, blue and purple tones, calm atmosphere, ice palette',
    neon: 'neon colors, electric, glowing, cyberpunk palette, fluorescent',
    earth: 'earth tones, natural colors, organic palette, browns and greens',
  };

  if (style && styleModifiers[style]) {
    enhanced += `, ${styleModifiers[style]}`;
  }

  if (colorScheme && colorModifiers[colorScheme]) {
    enhanced += `, ${colorModifiers[colorScheme]}`;
  }

  enhanced += ', album artwork, music cover art, professional quality, high resolution, square format, centered composition, suitable for vinyl, CD, and digital platforms';

  return enhanced;
}

function generateVariantPrompt(basePrompt, variantNumber) {
  const variations = [
    ', alternative angle, different perspective',
    ', reimagined composition, varied elements',
    ', alternative color treatment, different mood',
    ', experimental approach, artistic variation',
  ];

  return basePrompt + (variations[variantNumber - 1] || variations[0]);
}

async function generateSmartCrops(imageUrl) {
  // In production, you'd use an image processing service
  // For now, return predefined crop specifications
  return {
    instagram_square: '1:1',
    instagram_portrait: '4:5',
    spotify_playlist: '1:1',
    youtube_thumbnail: '16:9',
    facebook_cover: '16:9',
    twitter_header: '3:1',
  };
}

// GET endpoint for history with advanced filtering
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const style = searchParams.get('style');
    const status = searchParams.get('status');

    let query = supabase
      .from('artwork_generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (style) query = query.eq('style', style);
    if (status) query = query.eq('status', status);

    const { data: generations, error } = await query;

    if (error) throw error;

    return NextResponse.json({ generations });

  } catch (error) {
    console.error('Get generations error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
