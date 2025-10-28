/**
 * Public API: Get User's Releases
 * 
 * Endpoint: GET /api/v1/releases
 * Authentication: Bearer token (API key)
 * Rate Limit: Per API key settings
 * 
 * This is a PUBLIC API endpoint that requires authentication via API key.
 * Use this as a template for other public API endpoints.
 */

import { NextResponse } from 'next/server';
import { withAPIAuth } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const GET = withAPIAuth(async (request, { userId }) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('releases')
      .select('id, title, artist_id, release_type, genre, release_date, status, artwork_url, created_at', { count: 'exact' })
      .eq('artist_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if specified
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: releases, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: releases || [],
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: count > offset + limit,
      },
    });
  } catch (error) {
    console.error('API v1 releases error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch releases' },
      { status: 500 }
    );
  }
}, { requiredScopes: ['read'] });

export const POST = withAPIAuth(async (request, { userId }) => {
  try {
    const body = await request.json();
    const { title, release_type, genre, release_date } = body;

    // Validate required fields
    if (!title || !release_type || !genre) {
      return NextResponse.json(
        { error: 'Missing required fields: title, release_type, genre' },
        { status: 400 }
      );
    }

    // Create draft release
    const { data: release, error } = await supabase
      .from('releases')
      .insert({
        artist_id: userId,
        title,
        release_type,
        genre,
        release_date: release_date || null,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: release,
      message: 'Draft release created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('API v1 create release error:', error);
    return NextResponse.json(
      { error: 'Failed to create release' },
      { status: 500 }
    );
  }
}, { requiredScopes: ['write'] });

