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
    // req.user and req.userRole are automatically attached by middleware

    const { releaseId, releaseData } = req.body;

    // Validate required fields
    if (!releaseId || !releaseData) {
      return res.status(400).json({ error: 'Release ID and data are required' });
    }

    // Verify user has access to this release
    const { data: release, error: releaseError } = await supabase
      .from('releases')
      .select('artist_user_id, label_admin_user_id, status')
      .eq('id', releaseId)
      .single();

    if (releaseError) {
      return res.status(404).json({ error: 'Release not found' });
    }

    // Check permissions
    const hasAccess = release.artist_user_id === user.id || 
                     release.label_admin_user_id === user.id;

    if (!hasAccess) {
      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_role_assignments')
        .select('role_name')
        .eq('user_id', user.id)
        .single();

      if (!roleData || !['company_admin', 'super_admin', 'distribution_partner'].includes(roleData.role_name)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Only allow auto-save in editable states
    if (!['draft', 'submitted'].includes(release.status)) {
      return res.status(400).json({ error: 'Release is not in an editable state' });
    }

    // Call the auto-save function
    const { data: result, error } = await supabase.rpc('auto_save_release', {
      p_release_id: releaseId,
      p_release_data: releaseData
    });

    if (error) {
      console.error('Error auto-saving release:', error);
      return res.status(500).json({ error: 'Failed to auto-save release' });
    }

    return res.status(200).json({
      success: true,
      message: 'Release auto-saved successfully',
      last_saved_at: new Date().toISOString(),
      result
    });

  } catch (error) {
    console.error('Error in auto-save API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Protect with release edit permissions (OR logic)
export default requirePermission(['release:edit:own', 'release:edit:label'])(handler);
