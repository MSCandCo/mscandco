/**
 * API: Update User Role
 * POST /api/admin/users/[userId]/update-role
 *
 * Updates a user's role in the user_profiles table
 * V2: Requires users_access:user_management:update permission
 */

import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  const { role } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  try {
    // Validate role exists in roles table
    const { data: roleExists, error: roleCheckError } = await supabase
      .from('roles')
      .select('name')
      .eq('name', role)
      .single();

    if (roleCheckError || !roleExists) {
      // Get list of valid roles for error message
      const { data: validRoles } = await supabase
        .from('roles')
        .select('name')
        .order('name');

      return res.status(400).json({
        error: 'Invalid role',
        validRoles: validRoles?.map(r => r.name) || []
      });
    }
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('id, email, role')
      .eq('id', userId)
      .single();

    if (checkError) {
      console.error('Error checking user exists:', checkError);
      return res.status(404).json({
        error: 'User not found',
        details: process.env.NODE_ENV === 'development' ? checkError.message : undefined
      });
    }

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`Updating user ${existingUser.email} from ${existingUser.role} to ${role}`);

    // Update user role
    const { data: updatedUser, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, email, first_name, last_name, role, updated_at')
      .single();

    if (updateError) {
      console.error('Error updating user role:', updateError);
      return res.status(500).json({
        error: 'Failed to update user role',
        details: process.env.NODE_ENV === 'development' ? updateError.message : 'Database update failed',
        code: updateError.code
      });
    }

    if (!updatedUser) {
      console.error('No user returned after update');
      return res.status(500).json({
        error: 'Failed to update user role',
        details: 'No user data returned after update'
      });
    }

    console.log(`Successfully updated user ${updatedUser.email} to role ${updatedUser.role}`);

    // Update auth.users metadata so it's available on next login
    try {
      const { error: metadataError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            role: role
          }
        }
      );

      if (metadataError) {
        console.error('Warning: Failed to update user metadata:', metadataError);
      } else {
        console.log(`✅ Updated auth metadata for ${updatedUser.email} with role ${role}`);
      }
    } catch (metadataUpdateError) {
      console.error('Warning: Exception updating user metadata:', metadataUpdateError);
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        role: updatedUser.role,
        updated_at: updatedUser.updated_at
      }
    });

  } catch (error) {
    console.error('Error in update-role:', error);
    res.status(500).json({
      error: 'Failed to update user role',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}

// V2 Permission: Requires update permission for user management
export default requirePermission('users_access:user_management:update')(handler);
