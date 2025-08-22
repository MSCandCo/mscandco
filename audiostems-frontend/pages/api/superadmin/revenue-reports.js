import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGetReports(req, res);
  } else if (req.method === 'POST') {
    return handleProcessReport(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get revenue reports (pending, approved, etc.)
async function handleGetReports(req, res) {
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

    // Verify user is super admin
    const { data: roleData } = await supabase
      .from('user_role_assignments')
      .select('role_name')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role_name !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const { status } = req.query;

    // Get revenue reports with optional status filter
    let query = supabase
      .from('revenue_reports')
      .select(`
        id,
        user_id,
        user_email,
        user_name,
        report_type,
        amount,
        currency,
        status,
        period_start,
        period_end,
        submitted_at,
        processed_at,
        processed_by_user_id,
        processed_by_email,
        notes,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: reports, error } = await query;

    if (error) {
      console.error('Error fetching revenue reports:', error);
      return res.status(500).json({ error: 'Failed to fetch reports' });
    }

    return res.status(200).json({ reports: reports || [] });

  } catch (error) {
    console.error('Error in revenue-reports GET:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Process revenue report (approve/reject)
async function handleProcessReport(req, res) {
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

    // Verify user is super admin
    const { data: roleData } = await supabase
      .from('user_role_assignments')
      .select('role_name')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role_name !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const { reportId, action, notes } = req.body;

    // Validate required fields
    if (!reportId || !action) {
      return res.status(400).json({ error: 'Report ID and action are required' });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "approve" or "reject"' });
    }

    // Update the report
    const { data, error } = await supabase
      .from('revenue_reports')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        processed_at: new Date().toISOString(),
        processed_by_user_id: user.id,
        processed_by_email: user.email,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .eq('status', 'pending') // Only process pending reports
      .select();

    if (error) {
      console.error('Error processing revenue report:', error);
      return res.status(500).json({ error: 'Failed to process report' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Report not found or already processed' });
    }

    return res.status(200).json({ 
      success: true, 
      message: `Revenue report ${action}d successfully`,
      report: data[0]
    });

  } catch (error) {
    console.error('Error in revenue-reports POST:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
