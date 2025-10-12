/**
 * GET /api/admin/profile-requests/list
 *
 * List all profile change requests
 * Protected by: user:approve_changes:any
 */

import { requirePermission } from '@/lib/permissions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Check permission
    const authorized = await requirePermission(req, res, 'user:approve_changes:any');
    if (!authorized) return;

    const { status } = req.query;

    let query = supabase
      .from('profile_change_requests')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('Error fetching requests:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch requests',
        details: error.message
      });
    }

    // Get user profile data for each request
    const userIds = requests?.map(r => r.user_id) || [];
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email')
      .in('id', userIds);

    const profileMap = {};
    profiles?.forEach(p => {
      profileMap[p.id] = p;
    });

    // Combine data - map request_type to field_name for frontend compatibility
    const enrichedRequests = (requests || []).map(request => {
      const profile = profileMap[request.user_id];
      const fullName = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') : 'Unknown';

      return {
        ...request,
        field_name: request.request_type, // Map to expected frontend field
        user: {
          full_name: fullName,
          email: profile?.email || 'Unknown'
        }
      };
    });

    return res.status(200).json({
      success: true,
      requests: enrichedRequests,
      total: enrichedRequests.length
    });

  } catch (error) {
    console.error('List requests error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
