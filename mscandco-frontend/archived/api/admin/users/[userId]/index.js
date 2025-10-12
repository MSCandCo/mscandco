/**
 * GET /api/superadmin/users/[userId]
 *
 * Get single user details with profile and role information
 * Protected by: user:read:any
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

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }

  try {
    // Check permission
    const authorized = await requirePermission(req, res, 'user:read:any');
    if (!authorized) return;

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, role, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(404).json({
        success: false,
        error: 'User not found',
        details: profileError.message
      });
    }

    // Fetch auth user data
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError) {
      console.error('Error fetching auth user:', authError);
    }

    // Fetch role details
    let roleDetails = null;
    if (profile.role) {
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id, name, description, is_system_role, created_at, updated_at')
        .eq('name', profile.role)
        .single();

      if (!roleError && role) {
        roleDetails = role;
      }
    }

    // Combine all data
    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || null;
    const user = {
      id: userId,
      email: profile.email || authData?.user?.email || 'No email',
      full_name: fullName,
      role: profile.role,
      role_details: roleDetails,
      status: 'active', // Default status since column doesn't exist
      created_at: authData?.user?.created_at || profile.created_at,
      updated_at: profile.updated_at,
      last_sign_in_at: authData?.user?.last_sign_in_at,
      email_confirmed_at: authData?.user?.email_confirmed_at,
      phone: authData?.user?.phone,
      profile: profile
    };

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
