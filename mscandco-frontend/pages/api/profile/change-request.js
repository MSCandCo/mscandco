import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // req.user and req.userRole are automatically attached by middleware

  try {
    const user = req.user;

    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { requestType, reason, currentData, fieldName, currentValue, requestedValue } = req.body;

    // Handle both formats: new format (requestType/currentData) and old format (fieldName/requestedValue)
    if (requestType === 'profile_change' && currentData) {
      // New format: submit all locked fields as a general request
      const { data, error } = await userSupabase.rpc('create_change_request', {
        p_user_id: user.id,
        p_field_name: 'profile_locked_fields',
        p_current_value: JSON.stringify(currentData),
        p_requested_value: 'Request to unlock and modify locked profile fields',
        p_reason: reason || 'Profile change request for locked fields'
      });

      if (error) {
        console.error('Error creating change request:', error);
        return res.status(500).json({ error: 'Failed to create change request: ' + error.message });
      }

      return res.status(200).json({
        success: true,
        message: 'Change request submitted successfully. An admin will review your request.',
        requestId: data
      });
    } else if (fieldName && requestedValue) {
      // Old format: specific field change
      const { data, error } = await userSupabase.rpc('create_change_request', {
        p_user_id: user.id,
        p_field_name: fieldName,
        p_current_value: currentValue || '',
        p_requested_value: requestedValue,
        p_reason: reason || ''
      });

      if (error) {
        console.error('Error creating change request:', error);
        return res.status(500).json({ error: 'Failed to create change request: ' + error.message });
      }

      return res.status(200).json({
        success: true,
        message: 'Change request submitted successfully. An admin will review your request.',
        requestId: data
      });
    } else {
      return res.status(400).json({ error: 'Invalid request format. Please provide either requestType with currentData or fieldName with requestedValue.' });
    }

    if (error) {
      console.error('Error creating change request:', error);
      return res.status(500).json({ error: 'Failed to create change request' });
    }

    return res.status(200).json({
      success: true,
      message: 'Change request submitted successfully',
      requestId: data
    });

  } catch (error) {
    console.error('Change request API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Protect with profile:edit:own permission (creating change requests for own profile)
export default requirePermission('profile:edit:own')(handler);
