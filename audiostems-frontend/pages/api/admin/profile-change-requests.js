import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // Extract user ID from JWT token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    let userInfo;
    try {
      userInfo = jwt.decode(token);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const adminUserId = userInfo?.sub;
    const adminRole = userInfo?.user_metadata?.role;

    // Check if user is admin
    if (!['company_admin', 'super_admin'].includes(adminRole)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log('📋 Admin viewing profile change requests:', { adminUserId, adminRole });

    if (req.method === 'GET') {
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
          reviewed_by: adminUserId,
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
