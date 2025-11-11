import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/grant-features/copyright/verify
 * Initiate copyright verification for a release
 */
export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { release_id, audio_file_url, lyrics_text, composition_data } = body;

    if (!release_id) {
      return NextResponse.json({ error: 'release_id is required' }, { status: 400 });
    }

    // Verify user owns this release
    const { data: release, error: releaseError } = await supabase
      .from('releases')
      .select('id, user_id')
      .eq('id', release_id)
      .single();

    if (releaseError || !release || release.user_id !== user.id) {
      return NextResponse.json({ error: 'Release not found or unauthorized' }, { status: 404 });
    }

    // Create verification record
    const { data: verification, error: verificationError } = await supabase
      .from('copyright_verifications')
      .insert({
        release_id,
        user_id: user.id,
        verification_status: 'pending',
        audio_file_url,
        lyrics_text,
        composition_data,
        verified_catalogs: ['spotify', 'apple_music', 'youtube', 'soundexchange']
      })
      .select()
      .single();

    if (verificationError) {
      console.error('Error creating verification:', verificationError);
      return NextResponse.json({ error: 'Failed to create verification' }, { status: 500 });
    }

    // In production, trigger async AI verification job here
    // For now, we'll return the pending verification

    return NextResponse.json({
      success: true,
      verification_id: verification.id,
      status: verification.verification_status,
      message: 'Copyright verification initiated. This typically takes 5-10 minutes.'
    });

  } catch (error) {
    console.error('Copyright verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/grant-features/copyright/verify?release_id=xxx
 * Get verification status for a release
 */
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const release_id = searchParams.get('release_id');

    if (!release_id) {
      return NextResponse.json({ error: 'release_id is required' }, { status: 400 });
    }

    // Get verifications for this release
    const { data: verifications, error } = await supabase
      .from('copyright_verifications')
      .select('*')
      .eq('release_id', release_id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching verifications:', error);
      return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      verifications
    });

  } catch (error) {
    console.error('Copyright verification fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
