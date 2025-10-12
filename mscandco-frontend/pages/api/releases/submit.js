// Submit release for review API
import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { release_id } = req.body;

    if (!release_id) {
      return res.status(400).json({ error: 'release_id is required' });
    }

    console.log('📤 Submitting release for review:', release_id);

    // Fetch the release
    const { data: release, error: fetchError } = await supabase
      .from('releases')
      .select('*')
      .eq('id', release_id)
      .single();

    if (fetchError || !release) {
      console.error('❌ Failed to fetch release:', fetchError);
      return res.status(404).json({ error: 'Release not found' });
    }

    // Check if already submitted
    if (release.status !== 'draft') {
      return res.status(400).json({
        error: `Release cannot be submitted - current status is '${release.status}'`,
        message: 'Only draft releases can be submitted for review'
      });
    }

    // Validate required fields
    const validationErrors = [];

    // Basic release info
    if (!release.title) validationErrors.push('Release title is required');
    if (!release.artist_name) validationErrors.push('Artist name is required');
    if (!release.genre) validationErrors.push('Primary genre is required');
    if (!release.release_date) validationErrors.push('Release date is required');
    if (!release.artwork_url) validationErrors.push('Cover artwork is required');

    // Parse publishing_info for additional validation
    let publishingInfo = {};
    if (release.publishing_info) {
      try {
        publishingInfo = typeof release.publishing_info === 'string'
          ? JSON.parse(release.publishing_info)
          : release.publishing_info;
      } catch (e) {
        console.warn('⚠️ Could not parse publishing_info:', e);
      }
    }

    // Validate assets (at least one song)
    if (!publishingInfo.assets || publishingInfo.assets.length === 0) {
      validationErrors.push('At least one track is required');
    } else {
      const asset = publishingInfo.assets[0];
      if (!asset.songTitle) validationErrors.push('Song title is required');
      if (!asset.duration) validationErrors.push('Track duration is required');
      if (!asset.audioFileUrl && !release.audio_file_url) {
        validationErrors.push('Audio file is required');
      }
    }

    // If validation fails, return errors
    if (validationErrors.length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      return res.status(400).json({
        error: 'Validation failed',
        validationErrors,
        message: 'Please complete all required fields before submitting'
      });
    }

    // Update publishing_info to include submission metadata
    const updatedPublishingInfo = {
      ...publishingInfo,
      submission_date: new Date().toISOString(),
      locked_for_editing: true
    };

    // Update release status to 'submitted'
    const { data: updatedRelease, error: updateError } = await supabase
      .from('releases')
      .update({
        status: 'submitted',
        publishing_info: JSON.stringify(updatedPublishingInfo),
        updated_at: new Date().toISOString()
      })
      .eq('id', release_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update release:', updateError);
      return res.status(500).json({
        error: 'Failed to submit release',
        details: updateError.message
      });
    }

    console.log('✅ Release submitted successfully:', release_id);

    // Create notifications for admins
    // Fetch all admin users (super_admin, company_admin, distribution_partner)
    const { data: admins, error: adminsError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name')
      .in('role', ['super_admin', 'company_admin', 'distribution_partner']);

    if (adminsError) {
      console.warn('⚠️ Failed to fetch admins for notifications:', adminsError);
    } else if (admins && admins.length > 0) {
      // Create notification for each admin
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        type: 'release',
        title: 'New Release Submission',
        message: `${release.artist_name} submitted "${release.title}" for review`,
        data: {
          release_id: release_id,
          release_title: release.title,
          artist_name: release.artist_name,
          release_type: release.release_type,
          genre: release.genre,
          release_date: release.release_date,
          submitted_at: new Date().toISOString()
        },
        action_required: true,
        action_type: 'view',
        action_url: `/admin/releases/${release_id}`,
        read: false
      }));

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.warn('⚠️ Failed to create notifications:', notificationError);
      } else {
        console.log(`✅ Created ${notifications.length} admin notifications`);
      }
    }

    return res.json({
      success: true,
      data: updatedRelease,
      message: 'Release submitted for review successfully'
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}

// Protect with release edit permissions
export default requirePermission(['release:edit:own', 'release:edit:label'])(handler);
