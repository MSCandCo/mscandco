import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { status, notes } = req.body;

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

    // Check if user is a distribution partner
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || userProfile.role !== 'distribution_partner') {
      return res.status(403).json({ error: 'Access denied. Distribution partner role required.' });
    }

    // Validate status transition
    const validStatuses = ['draft', 'submitted', 'in_review', 'approved', 'rejected', 'completed', 'live'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get current release
    const { data: currentRelease, error: getCurrentError } = await supabase
      .from('releases')
      .select('status, artist_id')
      .eq('id', id)
      .single();

    if (getCurrentError || !currentRelease) {
      return res.status(404).json({ error: 'Release not found' });
    }

    // Validate status transitions based on business logic
    const { canTransition, reason } = validateStatusTransition(currentRelease.status, status);
    if (!canTransition) {
      return res.status(400).json({ error: `Invalid status transition: ${reason}` });
    }

    // Update release status
    const { data: updatedRelease, error: updateError } = await supabase
      .from('releases')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
        metadata: {
          ...currentRelease.metadata,
          status_history: [
            ...(currentRelease.metadata?.status_history || []),
            {
              from_status: currentRelease.status,
              to_status: status,
              changed_by: user.id,
              changed_at: new Date().toISOString(),
              notes: notes || ''
            }
          ]
        }
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating release status:', updateError);
      return res.status(500).json({ error: 'Failed to update release status' });
    }

    // If status is 'approved', create project if it doesn't exist
    if (status === 'approved') {
      await ensureProjectExists(updatedRelease);
    }

    // Send notification to artist (in a real app, you'd use a notification service)
    if (['approved', 'rejected', 'completed', 'live'].includes(status)) {
      await sendStatusNotification(updatedRelease, status, notes);
    }

    return res.status(200).json({
      success: true,
      release: updatedRelease,
      message: getStatusMessage(status)
    });

  } catch (error) {
    console.error('Error in status update:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Validate if a status transition is allowed
function validateStatusTransition(fromStatus, toStatus) {
  const transitions = {
    'draft': ['submitted'],
    'submitted': ['in_review', 'rejected'],
    'in_review': ['approved', 'rejected', 'submitted'], // Can send back for changes
    'approved': ['completed', 'rejected'],
    'completed': ['live'],
    'live': [], // Final status, no transitions
    'rejected': ['submitted'] // Artist can resubmit
  };

  if (transitions[fromStatus]?.includes(toStatus)) {
    return { canTransition: true };
  }

  return { 
    canTransition: false, 
    reason: `Cannot transition from ${fromStatus} to ${toStatus}` 
  };
}

// Ensure project exists for approved releases
async function ensureProjectExists(release) {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select('id')
      .eq('id', release.project_id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Project doesn't exist, create it
      const { error: createError } = await supabase
        .from('projects')
        .insert({
          id: release.project_id,
          title: release.title,
          artist_id: release.artist_id,
          status: 'approved',
          release_date: release.release_date
        });

      if (createError) {
        console.error('Error creating project:', createError);
      }
    }
  } catch (err) {
    console.error('Error ensuring project exists:', err);
  }
}

// Send status change notification to artist
async function sendStatusNotification(release, status, notes) {
  try {
    // Get artist email
    const { data: artist, error } = await supabase
      .from('artists')
      .select('user_id, stage_name')
      .eq('id', release.artist_id)
      .single();

    if (error || !artist) {
      console.error('Error getting artist for notification:', error);
      return;
    }

    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('email, first_name')
      .eq('id', artist.user_id)
      .single();

    if (userError || !userProfile) {
      console.error('Error getting user profile for notification:', userError);
      return;
    }

    // In a real app, you'd send an actual email here
    console.log(`Notification to ${userProfile.email}:`, {
      subject: `Release "${release.title}" status updated to ${status}`,
      message: getStatusMessage(status),
      notes: notes
    });

    // You could integrate with email services like:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - etc.

  } catch (err) {
    console.error('Error sending notification:', err);
  }
}

// Get user-friendly status messages
function getStatusMessage(status) {
  const messages = {
    'submitted': 'Your release has been submitted for review.',
    'in_review': 'Your release is currently under review by our distribution team.',
    'approved': 'Congratulations! Your release has been approved and will be distributed to platforms.',
    'rejected': 'Your release needs some changes before it can be approved. Please check the notes and resubmit.',
    'completed': 'Your release has been distributed to all platforms and will go live soon.',
    'live': 'Your release is now live on all streaming platforms! 🎉'
  };

  return messages[status] || 'Release status has been updated.';
}
