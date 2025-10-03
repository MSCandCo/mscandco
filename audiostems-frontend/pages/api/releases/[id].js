import { supabase } from '@/lib/supabase';
import { requirePermission } from '@/lib/rbac/middleware';

async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET' && req.method !== 'PUT' && req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // req.user and req.userRole are automatically attached by middleware

    if (req.method === 'GET') {
      // Get release with full details
      const { data: release, error: releaseError } = await supabase
        .from('releases')
        .select(`
          *,
          artist:artists(stage_name, real_name),
          label_admin:user_profiles!label_admin_id(first_name, last_name, display_name),
          company_admin:user_profiles!company_admin_id(first_name, last_name, display_name),
          distribution_partner:user_profiles!distribution_partner_id(first_name, last_name, display_name)
        `)
        .eq('id', id)
        .single();

      if (releaseError) {
        return res.status(404).json({ error: 'Release not found' });
      }

      // Check if user has permission to view this release
      const canView = (
        release.artist_id === user.id ||
        release.label_admin_id === user.id ||
        release.company_admin_id === user.id ||
        release.distribution_partner_id === user.id ||
        ['company_admin', 'super_admin'].includes(userProfile.role)
      );

      if (!canView) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.status(200).json(release);

    } else if (req.method === 'PUT') {
      // Update release
      const { status, workflowStep, ...updateData } = req.body;

      // Get existing release to check permissions
      const { data: existingRelease } = await supabase
        .from('releases')
        .select('artist_id, status, artist_can_edit, label_admin_id, company_admin_id, distribution_partner_id')
        .eq('id', id)
        .single();

      if (!existingRelease) {
        return res.status(404).json({ error: 'Release not found' });
      }

      // Check edit permissions
      const canEdit = (
        (existingRelease.artist_id === user.id && existingRelease.artist_can_edit) ||
        (existingRelease.label_admin_id === user.id && ['draft', 'submitted'].includes(existingRelease.status)) ||
        (existingRelease.distribution_partner_id === user.id) ||
        (['company_admin', 'super_admin'].includes(userProfile.role))
      );

      if (!canEdit) {
        return res.status(403).json({ error: 'Not authorized to edit this release' });
      }

      // Prepare update data
      const updatePayload = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      // Handle status changes
      if (status && status !== existingRelease.status) {
        updatePayload.status = status;
        
        // Update workflow step and permissions based on new status
        if (status === 'submitted') {
          updatePayload.workflow_step = 'label_review';
          updatePayload.artist_can_edit = false;
          updatePayload.submitted_at = new Date().toISOString();
          updatePayload.submitted_by = user.id;
        } else if (status === 'in_review') {
          updatePayload.workflow_step = 'distribution_review';
          updatePayload.artist_can_edit = false;
          updatePayload.reviewed_at = new Date().toISOString();
          updatePayload.reviewed_by = user.id;
        } else if (status === 'completed') {
          updatePayload.workflow_step = 'completed';
          updatePayload.artist_can_edit = false;
          updatePayload.completed_at = new Date().toISOString();
          updatePayload.completed_by = user.id;
          updatePayload.dsp_sent_date = new Date().toISOString();
        } else if (status === 'live') {
          updatePayload.workflow_step = 'live';
          updatePayload.artist_can_edit = false;
          updatePayload.live_at = new Date().toISOString();
        } else if (status === 'change_requested') {
          updatePayload.artist_can_edit = false;
          updatePayload.pending_change_requests = (existingRelease.pending_change_requests || 0) + 1;
        } else if (status === 'draft') {
          updatePayload.workflow_step = 'artist_creation';
          updatePayload.artist_can_edit = true;
        }
      }

      // Update auto-save timestamp for draft saves
      if (status === 'draft' || !status) {
        updatePayload.last_auto_save = new Date().toISOString();
      }

      const { data: updatedRelease, error: updateError } = await supabase
        .from('releases')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      return res.status(200).json({
        message: 'Release updated successfully',
        release: updatedRelease
      });

    } else if (req.method === 'DELETE') {
      // Delete release
      const { data: existingRelease } = await supabase
        .from('releases')
        .select('artist_id, status')
        .eq('id', id)
        .single();

      if (!existingRelease) {
        return res.status(404).json({ error: 'Release not found' });
      }

      // Check delete permissions (only artists can delete their own drafts)
      const canDelete = (
        existingRelease.artist_id === user.id && 
        existingRelease.status === 'draft'
      ) || ['company_admin', 'super_admin'].includes(userProfile.role);

      if (!canDelete) {
        return res.status(403).json({ error: 'Not authorized to delete this release' });
      }

      const { error: deleteError } = await supabase
        .from('releases')
        .delete()
        .eq('id', id);

      if (deleteError) {
        return res.status(400).json({ error: deleteError.message });
      }

      return res.status(200).json({ message: 'Release deleted successfully' });
    }

  } catch (error) {
    console.error('Error in release API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Protect with multiple release edit permissions (OR logic)
export default requirePermission(['release:edit:own', 'release:edit:label', 'release:edit:any'])(handler);
