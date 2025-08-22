import { createClient } from '@supabase/supabase-js';
import chartmetric, { getTrackInsights } from '@/lib/chartmetric';
import aceberAI, { analyzeArtistStrategy } from '@/lib/acceber-ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGetReleases(req, res);
  } else if (req.method === 'POST') {
    return handleCreateRelease(req, res);
  } else if (req.method === 'PUT') {
    return handleUpdateRelease(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get releases for user
async function handleGetReleases(req, res) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { status, include_analytics } = req.query;

    // Get user's role
    const { data: roleData } = await supabase
      .from('user_role_assignments')
      .select('role_name')
      .eq('user_id', user.id)
      .single();

    let query = supabase
      .from('releases')
      .select(`
        *,
        assets(
          id, track_title, track_number, duration_seconds,
          isrc_code, spotify_track_id, explicit_content
        ),
        artist_profile:user_profiles!releases_artist_user_id_fkey(
          first_name, last_name, artist_name
        ),
        label_profile:user_profiles!releases_label_admin_user_id_fkey(
          first_name, last_name, company_name
        )
      `);

    // Filter based on user role
    if (roleData?.role_name === 'artist') {
      query = query.eq('artist_user_id', user.id);
    } else if (roleData?.role_name === 'label_admin') {
      query = query.eq('label_admin_user_id', user.id);
    } else if (['company_admin', 'super_admin', 'distribution_partner'].includes(roleData?.role_name)) {
      // Admins and distribution partners can see all releases
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data: releases, error } = await query;

    if (error) {
      console.error('Error fetching releases:', error);
      return res.status(500).json({ error: 'Failed to fetch releases' });
    }

    // Enhance with analytics if requested
    if (include_analytics === 'true') {
      for (let release of releases) {
        for (let asset of release.assets) {
          if (asset.spotify_track_id) {
            const insights = await getTrackInsights(asset.spotify_track_id);
            if (insights.success) {
              asset.chartmetric_data = insights.data;
            }
          }
        }
      }
    }

    return res.status(200).json({ releases: releases || [] });

  } catch (error) {
    console.error('Error in releases GET:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Create new release
async function handleCreateRelease(req, res) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify user is artist or label admin
    const { data: roleData } = await supabase
      .from('user_role_assignments')
      .select('role_name')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['artist', 'label_admin'].includes(roleData.role_name)) {
      return res.status(403).json({ error: 'Only artists and label admins can create releases' });
    }

    // Check subscription limits for artists
    if (roleData.role_name === 'artist') {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('max_releases')
        .eq('user_id', user.id)
        .single();

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('releases_count')
        .eq('id', user.id)
        .single();

      const currentReleases = profile?.releases_count || 0;
      const maxReleases = subscription?.max_releases || 5;

      if (maxReleases !== -1 && currentReleases >= maxReleases) {
        return res.status(400).json({ 
          error: `Release limit reached. Your plan allows ${maxReleases} releases. Upgrade to Pro for unlimited releases.` 
        });
      }
    }

    const { releaseTitle, assetType, genre, tracks } = req.body;

    // Validate required fields
    if (!releaseTitle || !assetType || !genre || !tracks || tracks.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create release
    const { data: newRelease, error: releaseError } = await supabase
      .from('releases')
      .insert({
        artist_user_id: user.id,
        label_admin_user_id: roleData.role_name === 'label_admin' ? user.id : null,
        release_title: releaseTitle,
        asset_type: assetType,
        genre: genre,
        status: 'draft',
        last_saved_at: new Date().toISOString()
      })
      .select()
      .single();

    if (releaseError) {
      console.error('Error creating release:', releaseError);
      return res.status(500).json({ error: 'Failed to create release' });
    }

    // Create assets (tracks)
    const assetPromises = tracks.map((track, index) => 
      supabase
        .from('assets')
        .insert({
          release_id: newRelease.id,
          track_title: track.title,
          track_number: index + 1,
          duration_seconds: track.duration || 0,
          audio_url: track.audio_url || '',
          primary_artist: track.artist || releaseTitle,
          explicit_content: track.explicit || false
        })
    );

    await Promise.all(assetPromises);

    // Get AI insights for the new release
    const artistProfile = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (artistProfile.data) {
      // Get AI recommendations for this release
      const aiInsights = await analyzeArtistStrategy(user.id, {
        profile: artistProfile.data,
        next_release: { title: releaseTitle, genre, track_count: tracks.length },
        target_audience: { countries: ['UK', 'US'], platforms: ['spotify', 'apple_music'] },
        historical_data: { releases: [], avg_streams: 0, avg_revenue: 0 },
        market_context: { current_trends: [], competition_level: 'medium' }
      });

      if (aiInsights.success) {
        // Store AI insights for later use
        await supabase
          .from('releases')
          .update({
            metadata: { ai_insights: aiInsights.strategy }
          })
          .eq('id', newRelease.id);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Release created successfully',
      release: newRelease,
      ai_insights: aiInsights?.strategy || null
    });

  } catch (error) {
    console.error('Error in create release:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Update release (including status progression)
async function handleUpdateRelease(req, res) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { releaseId, action, releaseData, newStatus } = req.body;

    if (!releaseId) {
      return res.status(400).json({ error: 'Release ID is required' });
    }

    // Handle different types of updates
    if (action === 'progress_status' && newStatus) {
      // Progress release status (Distribution Partner action)
      const { data: result, error } = await supabase.rpc('progress_release_status', {
        p_release_id: releaseId,
        p_new_status: newStatus,
        p_notes: releaseData?.notes || null
      });

      if (error) {
        console.error('Error progressing release status:', error);
        return res.status(500).json({ error: 'Failed to update release status' });
      }

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        new_status: newStatus
      });

    } else if (action === 'update_metadata') {
      // Update release metadata
      const { data: updatedRelease, error } = await supabase
        .from('releases')
        .update({
          release_title: releaseData.release_title,
          genre: releaseData.genre,
          subgenre: releaseData.subgenre,
          planned_release_date: releaseData.planned_release_date,
          artwork_url: releaseData.artwork_url,
          copyright_info: releaseData.copyright_info,
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseId)
        .select()
        .single();

      if (error) {
        console.error('Error updating release:', error);
        return res.status(500).json({ error: 'Failed to update release' });
      }

      return res.status(200).json({
        success: true,
        message: 'Release updated successfully',
        release: updatedRelease
      });

    } else if (action === 'submit_for_distribution') {
      // Submit release for distribution
      const { data: submittedRelease, error } = await supabase
        .from('releases')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          distribution_partner_assigned: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseId)
        .eq('status', 'draft') // Only allow submission from draft
        .select()
        .single();

      if (error) {
        console.error('Error submitting release:', error);
        return res.status(500).json({ error: 'Failed to submit release' });
      }

      if (!submittedRelease) {
        return res.status(400).json({ error: 'Release is not in draft status or not found' });
      }

      // TODO: Notify Distribution Partner of new submission
      // TODO: Send confirmation email to artist

      return res.status(200).json({
        success: true,
        message: 'Release submitted for distribution successfully',
        release: submittedRelease
      });

    } else {
      return res.status(400).json({ error: 'Invalid action specified' });
    }

  } catch (error) {
    console.error('Error in release update:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
