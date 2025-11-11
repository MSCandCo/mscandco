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

    const { prompt, style, color_scheme, release_id } = await request.json();

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json({ error: 'Prompt is required (minimum 3 characters)' }, { status: 400 });
    }

    // Get user's current credit balance
    const { data: creditsData } = await supabase
      .from('artwork_credits')
      .select('credits, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    // Calculate total credits
    const { data: allCredits } = await supabase
      .from('artwork_credits')
      .select('amount')
      .eq('user_id', user.id);

    const totalCredits = allCredits?.reduce((sum, c) => sum + c.amount, 0) || 0;

    if (totalCredits < 1) {
      return NextResponse.json({
        error: 'Insufficient credits. You need at least 1 credit to generate artwork.',
        credits_available: totalCredits,
      }, { status: 402 });
    }

    // Create generation record
    const { data: generation, error: genError } = await supabase
      .from('artwork_generations')
      .insert({
        user_id: user.id,
        release_id,
        prompt,
        style: style || 'modern',
        color_scheme: color_scheme || 'vibrant',
        ai_model: 'dall-e-3',
        status: 'generating',
        generation_params: { size: '1024x1024', quality: 'hd' },
      })
      .select()
      .single();

    if (genError) throw genError;

    // Generate artwork with DALL-E 3 (if API key available)
    let imageUrl = null;
    let status = 'completed';

    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = require('openai').default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // Enhance prompt with style and color scheme
        const enhancedPrompt = enhancePrompt(prompt, style, color_scheme);

        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          style: style === 'realistic' ? 'natural' : 'vivid',
        });

        imageUrl = response.data[0].url;

        // Update generation with image URL
        await supabase
          .from('artwork_generations')
          .update({
            status: 'completed',
            generated_image_url: imageUrl,
            thumbnail_url: imageUrl,
            completed_at: new Date().toISOString(),
          })
          .eq('id', generation.id);

        // Deduct 1 credit
        await supabase.from('artwork_credits').insert({
          user_id: user.id,
          credits: totalCredits - 1,
          source: 'usage',
          amount: -1,
          description: `AI artwork generation: "${prompt.substring(0, 50)}..."`,
        });

      } catch (aiError) {
        console.error('DALL-E Error:', aiError);
        status = 'failed';
        await supabase
          .from('artwork_generations')
          .update({ status: 'failed' })
          .eq('id', generation.id);

        return NextResponse.json({
          error: 'AI generation failed: ' + aiError.message,
          generation_id: generation.id,
        }, { status: 500 });
      }
    } else {
      // No API key - return placeholder
      status = 'completed';
      imageUrl = '/placeholder-artwork.jpg'; // You'll need to add a placeholder image

      await supabase
        .from('artwork_generations')
        .update({
          status: 'completed',
          generated_image_url: imageUrl,
          completed_at: new Date().toISOString(),
        })
        .eq('id', generation.id);

      // Still deduct credit for demo purposes
      await supabase.from('artwork_credits').insert({
        user_id: user.id,
        credits: totalCredits - 1,
        source: 'usage',
        amount: -1,
        description: `Demo artwork generation: "${prompt.substring(0, 50)}..."`,
      });
    }

    return NextResponse.json({
      success: true,
      generation_id: generation.id,
      image_url: imageUrl,
      credits_remaining: totalCredits - 1,
      status,
    });

  } catch (error) {
    console.error('Artwork generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function enhancePrompt(basePrompt, style, colorScheme) {
  let enhanced = basePrompt;

  const styleModifiers = {
    abstract: 'abstract art, geometric shapes, modern design',
    realistic: 'photorealistic, highly detailed, professional photography',
    minimalist: 'minimalist design, clean lines, simple composition',
    vintage: 'vintage aesthetic, retro style, nostalgic feel, 1970s vibe',
    modern: 'contemporary art, sleek design, modern aesthetic',
    psychedelic: 'psychedelic art, vibrant colors, trippy visuals, mind-bending',
  };

  const colorModifiers = {
    vibrant: 'vibrant colors, bold palette, high saturation',
    dark: 'dark tones, moody atmosphere, low key lighting',
    pastel: 'pastel colors, soft tones, gentle palette',
    monochrome: 'black and white, monochromatic, grayscale',
    warm: 'warm colors, orange and red tones, inviting feel',
    cool: 'cool colors, blue and purple tones, calm atmosphere',
  };

  if (style && styleModifiers[style]) {
    enhanced += `, ${styleModifiers[style]}`;
  }

  if (colorScheme && colorModifiers[colorScheme]) {
    enhanced += `, ${colorModifiers[colorScheme]}`;
  }

  enhanced += ', album artwork, music cover art, professional quality, high resolution, square format';

  return enhanced;
}

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get generation history
    const { data: generations, error } = await supabase
      .from('artwork_generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ generations });

  } catch (error) {
    console.error('Get generations error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
