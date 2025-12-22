/**
 * Touring Platform - Setlist API
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * GET - Get setlist for a tour date
 */
export async function GET(request, { params }) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { dateId } = params;
    
    // Get setlist for this date
    const { data: setlists } = await supabaseAdmin
      .from('setlists')
      .select('*')
      .eq('tour_date_id', dateId)
      .limit(1);
    
    const setlist = setlists?.[0];
    
    if (!setlist) {
      return NextResponse.json({
        success: true,
        setlist: null,
        songs: []
      });
    }
    
    // Get setlist songs
    const { data: setlistSongs } = await supabaseAdmin
      .from('setlist_songs')
      .select('*, songs(*)')
      .eq('setlist_id', setlist.id)
      .order('position', { ascending: true });
    
    return NextResponse.json({
      success: true,
      setlist,
      songs: setlistSongs || []
    });
    
  } catch (error) {
    console.error('❌ Error fetching setlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch setlist', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create or update setlist
 */
export async function POST(request, { params }) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { dateId } = params;
    const body = await request.json();
    
    const { name, description, songs } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Setlist name required' },
        { status: 400 }
      );
    }
    
    // Get tour_id from date
    const { data: tourDate } = await supabaseAdmin
      .from('tour_dates')
      .select('tour_id')
      .eq('id', dateId)
      .single();
    
    if (!tourDate) {
      return NextResponse.json(
        { error: 'Tour date not found' },
        { status: 404 }
      );
    }
    
    // Check if setlist exists
    const { data: existing } = await supabaseAdmin
      .from('setlists')
      .select('id')
      .eq('tour_date_id', dateId)
      .maybeSingle();
    
    let setlistId;
    
    if (existing) {
      // Update existing
      const { data: updated } = await supabaseAdmin
        .from('setlists')
        .update({ name, description: description || null })
        .eq('id', existing.id)
        .select()
        .single();
      
      setlistId = updated.id;
      
      // Delete old songs
      await supabaseAdmin
        .from('setlist_songs')
        .delete()
        .eq('setlist_id', setlistId);
    } else {
      // Create new
      const { data: newSetlist } = await supabaseAdmin
        .from('setlists')
        .insert({
          tour_date_id: dateId,
          tour_id: tourDate.tour_id,
          name,
          description: description || null
        })
        .select()
        .single();
      
      setlistId = newSetlist.id;
    }
    
    // Add songs
    if (songs && songs.length > 0) {
      const songsToInsert = songs.map((song, index) => ({
        setlist_id: setlistId,
        song_id: song.song_id || null,
        position: index + 1,
        is_break: song.is_break || false,
        break_duration: song.break_duration || null,
        notes: song.notes || null
      }));
      
      await supabaseAdmin
        .from('setlist_songs')
        .insert(songsToInsert);
    }
    
    // Fetch complete setlist
    const { data: setlist } = await supabaseAdmin
      .from('setlists')
      .select('*')
      .eq('id', setlistId)
      .single();
    
    const { data: setlistSongs } = await supabaseAdmin
      .from('setlist_songs')
      .select('*, songs(*)')
      .eq('setlist_id', setlistId)
      .order('position', { ascending: true });
    
    return NextResponse.json({
      success: true,
      setlist,
      songs: setlistSongs || []
    });
    
  } catch (error) {
    console.error('❌ Error saving setlist:', error);
    return NextResponse.json(
      { error: 'Failed to save setlist', details: error.message },
      { status: 500 }
    );
  }
}

