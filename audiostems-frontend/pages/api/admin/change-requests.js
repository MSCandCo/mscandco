import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const authHeader = req.headers.authorization;
    
    let userSupabase;
    let user;
    
    if (authHeader) {
      userSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        { global: { headers: { Authorization: authHeader } } }
      );
      
      const { data: { user: authUser }, error } = await userSupabase.auth.getUser();
      if (error || !authUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      user = authUser;
    } else {
      return res.status(401).json({ error: 'Authorization required' });
    }

    // Check if user is admin
    const { data: userRole } = await userSupabase
      .from('user_role_assignments')
      .select('role_name')
      .eq('user_id', user.id)
      .single();

    if (!userRole || !['company_admin', 'super_admin'].includes(userRole.role_name)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'GET') {
      // Get all pending change requests with user information
      const { data: requests, error } = await userSupabase
        .from('profile_change_requests')
        .select(`
          *,
          user_profiles!inner(
            email,
            first_name,
            last_name,
            artist_name
          )
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching change requests:', error);
        return res.status(500).json({ error: 'Failed to fetch change requests' });
      }

      return res.status(200).json({ requests: requests || [] });
    }

    if (req.method === 'PUT') {
      const { requestId, action, adminNotes = '' } = req.body;

      if (!requestId || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid request data' });
      }

      if (action === 'approve') {
        // Approve the change request using the database function
        const { data, error } = await userSupabase.rpc('approve_change_request', {
          p_request_id: requestId,
          p_admin_id: user.id,
          p_admin_notes: adminNotes
        });

        if (error) {
          console.error('Error approving change request:', error);
          return res.status(500).json({ error: 'Failed to approve change request' });
        }

        return res.status(200).json({ 
          success: true, 
          message: 'Change request approved and profile updated' 
        });
      }

      if (action === 'reject') {
        // Reject the change request
        const { error } = await userSupabase
          .from('profile_change_requests')
          .update({
            status: 'rejected',
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id,
            admin_notes: adminNotes,
            updated_at: new Date().toISOString()
          })
          .eq('id', requestId)
          .eq('status', 'pending');

        if (error) {
          console.error('Error rejecting change request:', error);
          return res.status(500).json({ error: 'Failed to reject change request' });
        }

        return res.status(200).json({ 
          success: true, 
          message: 'Change request rejected' 
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Change requests API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
