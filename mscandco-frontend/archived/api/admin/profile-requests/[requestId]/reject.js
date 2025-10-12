/**
 * POST /api/admin/profile-requests/[requestId]/reject
 *
 * Reject a profile change request
 * Protected by: user:reject_changes:any
 */

import { requirePermission } from '@/lib/permissions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Check permission
    const authorized = await requirePermission(req, res, 'user:reject_changes:any');
    if (!authorized) return;

    const { requestId } = req.query;
    const { notes } = req.body;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        error: 'Request ID is required'
      });
    }

    if (!notes) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required'
      });
    }

    // Get the request
    const { data: request, error: fetchError } = await supabase
      .from('profile_change_requests')
      .select('status')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Request already ${request.status}`
      });
    }

    // Mark request as rejected
    const { error: rejectError } = await supabase
      .from('profile_change_requests')
      .update({
        status: 'rejected',
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (rejectError) {
      console.error('Error rejecting request:', rejectError);
      return res.status(500).json({
        success: false,
        error: 'Failed to reject request',
        details: rejectError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Request rejected successfully'
    });

  } catch (error) {
    console.error('Reject request error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
