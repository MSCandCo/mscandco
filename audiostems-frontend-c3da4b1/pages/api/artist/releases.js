import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetReleases(req, res);
    case 'POST':
      return handleCreateRelease(req, res);
    case 'PUT':
      return handleUpdateRelease(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get all releases for the authenticated user
async function handleGetReleases(req, res) {
  try {
    // Get user from session (you may need to implement JWT verification)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    // For now, we'll use a simple approach - in production, verify JWT properly
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's artist profile (create if doesn't exist)
    let { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // If artist profile doesn't exist, create one
    if (artistError && artistError.code === 'PGRST116') {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('display_name, first_name, last_name')
        .eq('id', user.id)
        .single();

      const { data: newArtist, error: createError } = await supabase
        .from('artists')
        .insert({
          user_id: user.id,
          stage_name: userProfile?.display_name || `${userProfile?.first_name || 'Artist'} ${userProfile?.last_name || ''}`.trim(),
          real_name: `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || null
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating artist profile:', createError);
        return res.status(500).json({ error: 'Failed to create artist profile' });
      }

      artistData = newArtist;
    } else if (artistError) {
      console.error('Error fetching artist profile:', artistError);
      return res.status(500).json({ error: 'Failed to fetch artist profile' });
    }

    // Get releases for this artist
    const { data: releases, error: releasesError } = await supabase
      .from('releases')
      .select(`
        *,
        projects!inner(
          id,
          title,
          description,
          genre,
          artwork_url,
          songs(
            id,
            title,
            duration,
            file_url,
            track_number,
            stems(*)
          )
        )
      `)
      .eq('artist_id', artistData.id)
      .order('created_at', { ascending: false });

    if (releasesError) {
      console.error('Error fetching releases:', releasesError);
      return res.status(500).json({ error: 'Failed to fetch releases' });
    }

    return res.status(200).json({ releases: releases || [] });
  } catch (error) {
    console.error('Error in handleGetReleases:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Create a new release
async function handleCreateRelease(req, res) {
  try {
    const { 
      projectName, 
      releaseType, 
      genre, 
      expectedReleaseDate,
      trackListing,
      credits,
      publishingNotes,
      marketingPlan 
    } = req.body;

    // Get user from session
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's artist profile (create if doesn't exist) 
    let { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // If artist profile doesn't exist, create one
    if (artistError && artistError.code === 'PGRST116') {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('display_name, first_name, last_name')
        .eq('id', user.id)
        .single();

      const { data: newArtist, error: createError } = await supabase
        .from('artists')
        .insert({
          user_id: user.id,
          stage_name: userProfile?.display_name || `${userProfile?.first_name || 'Artist'} ${userProfile?.last_name || ''}`.trim(),
          real_name: `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || null
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating artist profile:', createError);
        return res.status(500).json({ error: 'Failed to create artist profile' });
      }

      artistData = newArtist;
    } else if (artistError) {
      console.error('Error fetching artist profile:', artistError);
      return res.status(500).json({ error: 'Failed to fetch artist profile' });
    }

    // Check subscription limits
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Failed to check user plan' });
    }

    // Check release count limits for starter plans
    const isStarterPlan = !userProfile.plan || userProfile.plan === 'Artist Starter';
    
    if (isStarterPlan) {
      const { count, error: countError } = await supabase
        .from('releases')
        .select('id', { count: 'exact' })
        .eq('artist_id', artistData.id);

      if (countError) {
        return res.status(500).json({ error: 'Failed to check release count' });
      }

      if (count >= 5) {
        return res.status(403).json({ 
          error: 'Release limit reached. Upgrade to Artist Pro for unlimited releases.',
          limit: {
            current: count,
            max: 5,
            plan: 'Artist Starter',
            upgrade: 'Artist Pro'
          }
        });
      }
    }

    // Start transaction - create project first
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        title: projectName,
        artist_id: artistData.id,
        genre: genre,
        status: 'draft',
        release_date: expectedReleaseDate || null
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      return res.status(500).json({ error: 'Failed to create project' });
    }

    // Create release record
    const { data: release, error: releaseError } = await supabase
      .from('releases')
      .insert({
        project_id: project.id,
        title: projectName,
        artist_id: artistData.id,
        release_type: releaseType.toLowerCase(),
        status: 'draft',
        release_date: expectedReleaseDate || null,
        metadata: {
          credits: credits || [],
          publishingNotes: publishingNotes || '',
          marketingPlan: marketingPlan || '',
          trackListing: trackListing || []
        }
      })
      .select()
      .single();

    if (releaseError) {
      console.error('Error creating release:', releaseError);
      return res.status(500).json({ error: 'Failed to create release' });
    }

    // Create song records for each track
    if (trackListing && trackListing.length > 0) {
      const songInserts = trackListing.map((track, index) => ({
        project_id: project.id,
        title: track.title || `Track ${index + 1}`,
        track_number: index + 1,
        duration: track.duration ? parseInt(track.duration.replace(':', '')) : null
      }));

      const { error: songsError } = await supabase
        .from('songs')
        .insert(songInserts);

      if (songsError) {
        console.error('Error creating songs:', songsError);
        // Don't fail the whole request, just log the error
      }
    }

    return res.status(201).json({ 
      success: true, 
      release,
      project,
      message: 'Release created successfully! You can now upload your music files.' 
    });
  } catch (error) {
    console.error('Error in handleCreateRelease:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Update an existing release
async function handleUpdateRelease(req, res) {
  try {
    const { releaseId, ...updateData } = req.body;

    // Get user from session
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's artist profile
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (artistError) {
      return res.status(404).json({ error: 'Artist profile not found' });
    }

    // Check if user owns this release
    const { data: release, error: releaseError } = await supabase
      .from('releases')
      .select('id, status, artist_id')
      .eq('id', releaseId)
      .eq('artist_id', artistData.id)
      .single();

    if (releaseError || !release) {
      return res.status(404).json({ error: 'Release not found' });
    }

    // Check if release is editable
    if (!['draft', 'submitted'].includes(release.status)) {
      return res.status(403).json({ 
        error: 'Release cannot be edited in its current status' 
      });
    }

    // Update the release
    const { data: updatedRelease, error: updateError } = await supabase
      .from('releases')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', releaseId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating release:', updateError);
      return res.status(500).json({ error: 'Failed to update release' });
    }

    return res.status(200).json({ 
      success: true, 
      release: updatedRelease,
      message: 'Release updated successfully!' 
    });
  } catch (error) {
    console.error('Error in handleUpdateRelease:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
