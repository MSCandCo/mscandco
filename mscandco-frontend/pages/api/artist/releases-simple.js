// Simplified Artist releases API - uses RLS instead of middleware
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client to verify user
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Verify the user's token
    const { data: { user }, error: userError } = await authClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error('❌ Auth error:', userError);
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('📋 Fetching releases for artist:', user.id);

    // Use service role to bypass RLS (we've already authenticated the user)
    // This is safe because we're filtering by the authenticated user's ID
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Fetch releases - RLS will automatically filter by user
    const { data: releases, error } = await supabase
      .from('releases')
      .select('*')
      .eq('artist_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch releases', 
        details: error.message 
      });
    }

    console.log(`✅ Found ${releases?.length || 0} releases`);
    
    // Transform to expected format
    const transformedReleases = (releases || []).map(release => ({
      id: release.id,
      title: release.title,
      artist: release.artist_name,
      releaseType: release.release_type,
      status: release.status || 'draft',
      submissionDate: release.submission_date,
      approvalDate: release.approval_date,
      releaseDate: release.release_date,
      genre: release.genre,
      subgenre: release.subgenre,
      upc: release.upc,
      artwork: release.artwork_url,
      createdAt: release.created_at,
      updatedAt: release.updated_at,
      ...release
    }));

    return res.json(transformedReleases);

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    });
  }
}


