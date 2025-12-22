import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    
    // Get public metrics from database
    const { data: metrics, error } = await supabase
      .from('public_metrics')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching metrics:', error);
    }

    // If no metrics exist, return empty structure (no dummy data)
    if (!metrics || error?.code === 'PGRST116') {
      return NextResponse.json({
        metrics: {
          total_artists: null,
          total_releases: null,
          total_streams: null,
          avg_artist_earnings: null,
          new_artists_this_month: null,
          genre_distribution: null,
          growth_trends: null
        }
      });
    }

    // Return actual metrics from database
    return NextResponse.json({
      metrics: {
        total_artists: metrics.total_artists || null,
        total_releases: metrics.total_releases || null,
        total_streams: metrics.total_streams || null,
        avg_artist_earnings: metrics.avg_artist_earnings || null,
        new_artists_this_month: metrics.new_artists_this_month || null,
        genre_distribution: metrics.genre_distribution || null,
        growth_trends: metrics.growth_trends || null
      }
    });
  } catch (error) {
    console.error('Error in metrics:', error);
    return NextResponse.json({
      metrics: {
        total_artists: null,
        total_releases: null,
        total_streams: null,
        avg_artist_earnings: null,
        new_artists_this_month: null,
        genre_distribution: null,
        growth_trends: null
      }
    });
  }
}

