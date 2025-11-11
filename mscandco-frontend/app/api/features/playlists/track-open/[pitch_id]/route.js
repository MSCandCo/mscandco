import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Tracking pixel endpoint
export async function GET(request, { params }) {
  try {
    const { pitch_id } = params;
    const supabase = createRouteHandlerClient({ cookies });

    // Update pitch with opened timestamp
    await supabase
      .from('playlist_pitches')
      .update({
        opened_at: new Date().toISOString(),
        open_count: supabase.raw('open_count + 1'),
      })
      .eq('id', pitch_id)
      .is('opened_at', null); // Only set first open time

    // Return 1x1 transparent GIF
    const transparentGif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(transparentGif, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });

  } catch (error) {
    console.error('Track open error:', error);
    // Still return tracking pixel even on error
    const transparentGif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    return new NextResponse(transparentGif, {
      headers: { 'Content-Type': 'image/gif' },
    });
  }
}
