/**
 * API: List All Users
 * GET /api/admin/users/list
 *
 * Returns all users with their profiles and roles
 * V2: Requires users_access:user_management:read permission
 */

import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all user profiles with role information
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (profileError) {
      console.error('Error fetching user profiles:', profileError);
      throw profileError;
    }

    // Get auth users to check email confirmation status
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching auth users:', authError);
      // Continue without auth status if this fails
    }

    // Create a Map for O(1) lookup instead of O(n) find
    const authUsersMap = new Map();
    if (authData?.users) {
      authData.users.forEach(authUser => {
        authUsersMap.set(authUser.id, authUser);
      });
    }

    // Map profiles with auth status - O(n) instead of O(n²)
    const users = profiles.map(profile => {
      const authUser = authUsersMap.get(profile.id);

      // User is active if email is confirmed AND not banned
      const isActive = authUser?.email_confirmed_at && !authUser?.banned_until;

      return {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
        role: profile.role || 'artist',
        status: isActive ? 'active' : 'pending',
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        last_sign_in: authUser?.last_sign_in_at || null
      };
    });

    res.status(200).json({
      success: true,
      users,
      total: users.length
    });

  } catch (error) {
    console.error('Error in users/list:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

// V2 Permission: Requires read permission for user management
export default requirePermission('users_access:user_management:read')(handler);
