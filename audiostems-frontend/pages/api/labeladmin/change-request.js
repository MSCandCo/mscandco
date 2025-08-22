import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get label admin user
    const { data: dbUser, error: dbError } = await supabase.auth.admin.getUserByEmail('labeladmin@mscandco.com');
    if (dbError || !dbUser.user) {
      return res.status(404).json({ error: 'Label admin user not found' });
    }
    
    const user = dbUser.user;
    const { fieldName, currentValue, requestedValue, reason } = req.body;

    if (!fieldName || !requestedValue) {
      return res.status(400).json({ error: 'Field name and requested value are required' });
    }

    // Create change request using the database function
    const { data, error } = await supabase.rpc('create_change_request', {
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
      message: 'Change request submitted successfully. Company admin will review your request.',
      requestId: data
    });

  } catch (error) {
    console.error('Label admin change request API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
