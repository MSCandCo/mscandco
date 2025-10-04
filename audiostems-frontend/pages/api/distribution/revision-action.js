import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { releaseId, action, message } = req.body;
  const userId = req.user?.id;
  const userRole = req.userRole;

  // Check if user is authorized (distribution partner, company admin, or super admin)
  const authorizedRoles = ['distribution_partner', 'company_admin', 'super_admin'];
  if (!authorizedRoles.includes(userRole)) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  if (!releaseId || !action) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get the release
    const { data: release, error: releaseError } = await supabase
      .from('releases')
      .select('*')
      .eq('id', releaseId)
      .single();

    if (releaseError || !release) {
      return res.status(404).json({ error: 'Release not found' });
    }

    if (release.status !== 'revision') {
      return res.status(400).json({ error: 'Release is not in revision status' });
    }

    const originalStatus = release.publishing_info?.revision_original_status || 'submitted';

    let newStatus;
    let notificationMessage;
    let notificationType;

    switch (action) {
      case 'approve':
        newStatus = 'in_review';
        notificationMessage = `Your update request for "${release.title}" has been approved. The release is now under review.`;
        notificationType = 'revision_approved';
        break;

      case 'deny':
        if (!message) {
          return res.status(400).json({ error: 'Message is required when denying' });
        }
        newStatus = originalStatus;
        notificationMessage = `Your update request for "${release.title}" has been denied.\n\nReason: ${message}`;
        notificationType = 'revision_denied';
        break;

      case 'push_to_draft':
        if (!message) {
          return res.status(400).json({ error: 'Message is required when pushing to draft' });
        }
        newStatus = 'draft';
        notificationMessage = `"${release.title}" has been pushed back to draft for corrections.\n\nReason: ${message}`;
        notificationType = 'pushed_to_draft';
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    // Update release status
    const { error: updateError } = await supabase
      .from('releases')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        publishing_info: {
          ...release.publishing_info,
          revision_original_status: null,
          last_action: {
            action,
            message,
            by: userId,
            at: new Date().toISOString()
          }
        }
      })
      .eq('id', releaseId);

    if (updateError) {
      console.error('Error updating release:', updateError);
      return res.status(500).json({ error: 'Failed to update release' });
    }

    // Create notification for artist
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        type: notificationType,
        title: `Release ${action === 'approve' ? 'Approved' : action === 'deny' ? 'Denied' : 'Pushed to Draft'}`,
        message: notificationMessage,
        data: {
          release_id: releaseId,
          release_title: release.title,
          action,
          partner_message: message || ''
        },
        action_required: action === 'push_to_draft',
        action_type: action === 'push_to_draft' ? 'edit_release' : null,
        action_url: `/artist/releases`
      })
      .select()
      .single();

    if (notifError) {
      console.error('Error creating notification:', notifError);
    } else {
      // Assign to artist
      await supabase
        .from('notification_assignments')
        .insert({
          notification_id: notification.id,
          user_id: release.artist_id
        });
    }

    return res.status(200).json({
      success: true,
      message: `Release ${action}d successfully`,
      new_status: newStatus
    });

  } catch (error) {
    console.error('Error processing revision action:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
