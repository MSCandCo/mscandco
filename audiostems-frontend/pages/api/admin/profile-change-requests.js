import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';
import { hasPermission } from '@/lib/rbac/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// req.user and req.userRole are automatically attached by middleware
async function handler(req, res) {
  try {
    // req.user and req.userRole are automatically attached by middleware
    console.log('📋 Admin viewing profile change requests:', { adminUserId: req.user.id, adminRole: req.userRole });

    if (req.method === 'GET') {
      // Check read permission for requests
      const canRead = await hasPermission(req.userRole, 'analytics:requests:read', req.user.id);
      if (!canRead) {
        return res.status(403).json({ error: 'Insufficient permissions to view requests' });
      }

      // Get all profile change requests with user information
      const { data: requests, error } = await supabase
        .from('profile_change_requests')
        .select(`
          *,
          user_profiles!inner(
            id,
            email,
            first_name,
            last_name,
            artist_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching profile change requests:', error);
        return res.status(500).json({ error: 'Failed to fetch change requests' });
      }

      console.log(`✅ Found ${requests?.length || 0} profile change requests`);

      return res.status(200).json({ 
        success: true,
        requests: requests || [] 
      });
    }

    if (req.method === 'PUT') {
      // Check update permission for requests (approve/reject)
      const canUpdate = await hasPermission(req.userRole, 'analytics:requests:update', req.user.id);
      if (!canUpdate) {
        return res.status(403).json({ error: 'Insufficient permissions to update requests' });
      }

      // Update request status (approve/reject)
      const { requestId, action, adminNotes = '' } = req.body;

      if (!requestId || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid request ID or action' });
      }

      const status = action === 'approve' ? 'approved' : 'rejected';

      const { data, error } = await supabase
        .from('profile_change_requests')
        .update({
          status: status,
          reviewed_by: req.user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating profile change request:', error);
        return res.status(500).json({ error: 'Failed to update request' });
      }

      console.log(`✅ Profile change request ${action}d:`, data.id);

      return res.status(200).json({
        success: true,
        message: `Request ${action}d successfully`,
        request: data
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Profile change requests API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// V2 Permission: Requires authentication - permission checks are done per-method inside handler
export default requireAuth(handler);
