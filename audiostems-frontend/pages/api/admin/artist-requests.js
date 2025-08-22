import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGetRequests(req, res);
  } else if (req.method === 'POST') {
    return handleProcessRequest(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get all artist requests (for company admin and super admin)
async function handleGetRequests(req, res) {
  try {
    // Get the user from the session
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify user is company admin or super admin
    const { data: roleData } = await supabase
      .from('user_role_assignments')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['company_admin', 'super_admin'].includes(roleData.role)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get all artist requests with optional status filter
    const { status } = req.query;
    let query = supabase
      .from('artist_requests')
      .select(`
        id,
        requested_by_user_id,
        requested_by_email,
        label_name,
        artist_first_name,
        artist_last_name,
        artist_stage_name,
        label_royalty_percent,
        status,
        request_type,
        approved_by_user_id,
        approved_by_email,
        rejection_reason,
        notes,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('Error fetching artist requests:', error);
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }

    return res.status(200).json({ requests: requests || [] });

  } catch (error) {
    console.error('Error in artist-requests GET:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Process artist request (approve/reject)
async function handleProcessRequest(req, res) {
  try {
    // Get the user from the session
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify user is company admin or super admin
    const { data: roleData } = await supabase
      .from('user_role_assignments')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['company_admin', 'super_admin'].includes(roleData.role)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { requestId, action, rejectionReason, notes } = req.body;

    // Validate required fields
    if (!requestId || !action) {
      return res.status(400).json({ error: 'Request ID and action are required' });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "approve" or "reject"' });
    }

    if (action === 'reject' && !rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required when rejecting' });
    }

    // Call the database function to process the request
    const { data, error } = await supabase.rpc('process_artist_request', {
      p_request_id: requestId,
      p_action: action,
      p_rejection_reason: rejectionReason || null,
      p_notes: notes || null
    });

    if (error) {
      console.error('Error processing artist request:', error);
      return res.status(500).json({ error: 'Failed to process request' });
    }

    if (!data.success) {
      return res.status(400).json({ error: data.error });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error in artist-requests POST:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
