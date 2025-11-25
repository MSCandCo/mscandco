/**
 * Touring Platform - Songs API
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET - Get songs for a tour
 */
export async function GET(request, { params }) {
  try {
    const { tourId } = params;
    
    // Get tour to get user_id
    const { data: tour } = await supabaseAdmin
      .from('tours')
      .select('user_id')
      .eq('id', tourId)
      .single();
    
    if (!tour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }
    
    const { data: songs, error } = await supabaseAdmin
      .from('songs')
      .select('*')
      .eq('user_id', tour.user_id)
      .order('title', { ascending: true });
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      songs: songs || []
    });
    
  } catch (error) {
    console.error('❌ Error fetching songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch songs', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create song
 */
export async function POST(request, { params }) {
  try {
    const { tourId } = params;
    const body = await request.json();
    
    // Get tour to get user_id
    const { data: tour } = await supabaseAdmin
      .from('tours')
      .select('user_id')
      .eq('id', tourId)
      .single();
    
    if (!tour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }
    
    const { title, artist, duration, bpm, key, genre, tech_notes } = body;
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title required' },
        { status: 400 }
      );
    }
    
    const { data: song, error } = await supabaseAdmin
      .from('songs')
      .insert({
        user_id: tour.user_id,
        title,
        artist: artist || null,
        duration: duration || null,
        bpm: bpm || null,
        key: key || null,
        genre: genre || null,
        tech_notes: tech_notes || null
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      song
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creating song:', error);
    return NextResponse.json(
      { error: 'Failed to create song', details: error.message },
      { status: 500 }
    );
  }
}

