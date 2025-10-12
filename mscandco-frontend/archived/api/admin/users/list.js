/**
 * GET /api/admin/users/list
 *
 * List all users with their profiles and roles
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

  try {
    // Check permission
    const authorized = await requirePermission(req, res, 'user:read:any');
    if (!authorized) return;

    // Fetch all users from auth.users with their profiles
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        first_name,
        last_name,
        email,
        role,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch users',
        details: usersError.message
      });
    }

    // Fetch auth data for each user
    const userIds = users.map(u => u.id);
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching auth users:', authError);
    }

    // Create a map of auth users by ID
    const authUserMap = {};
    if (authUsers?.users) {
      authUsers.users.forEach(authUser => {
        authUserMap[authUser.id] = authUser;
      });
    }

    // Combine profile and auth data
    const combinedUsers = users.map(profile => {
      const authUser = authUserMap[profile.id];
      const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || null;
      return {
        id: profile.id,
        full_name: fullName,
        email: profile.email || authUser?.email || 'No email',
        role: profile.role,
        status: 'active', // Default status since column doesn't exist
        created_at: authUser?.created_at || profile.created_at,
        last_sign_in_at: authUser?.last_sign_in_at,
        updated_at: profile.updated_at
      };
    });

    return res.status(200).json({
      success: true,
      users: combinedUsers,
      total: combinedUsers.length
    });

  } catch (error) {
    console.error('Users list error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
