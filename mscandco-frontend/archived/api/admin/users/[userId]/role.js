/**
 * PUT /api/admin/users/[userId]/role
 *
 * Update a user's role
 * Protected by: user:update:any
 */

import { requirePermission } from '@/lib/permissions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Check permission
    const authorized = await requirePermission(req, res, 'user:update:any');
    if (!authorized) return;

    const { userId } = req.query;
    const { role } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role is required'
      });
    }

    // Validate that the role exists
    const { data: roleExists, error: roleError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('name', role)
      .single();

    if (roleError || !roleExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role specified'
      });
    }

    // Check if user exists in user_profiles
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking user profile:', profileError);
      return res.status(500).json({
        success: false,
        error: 'Failed to check user profile'
      });
    }

    // Update or insert user profile with new role
    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          role: role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user role:', updateError);
        return res.status(500).json({
          success: false,
          error: 'Failed to update user role'
        });
      }
    } else {
      // Create new profile (user exists in auth but not in profiles)
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return res.status(500).json({
          success: false,
          error: 'Failed to create user profile'
        });
      }
    }

    // Log the role change for audit purposes
    console.log(`Role updated: User ${userId} role changed to ${role}`);

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user_id: userId,
      new_role: role
    });

  } catch (error) {
    console.error('Update user role error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}