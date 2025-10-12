/**
 * PUT /api/superadmin/roles/[roleId]/update
 *
 * Update role details (name, description)
 * Protected by: role:update:any
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

  const { roleId } = req.query;

  if (!roleId) {
    return res.status(400).json({
      success: false,
      error: 'Role ID is required'
    });
  }

  try {
    // Check permission
    const authorized = await requirePermission(req, res, 'role:manage:any');
    if (!authorized) return;

    // Verify role exists
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Prevent editing system roles
    if (role.is_system_role) {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify system roles'
      });
    }

    const { name, description } = req.body;
    const updates = {};

    // Validate and prepare updates
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role name'
        });
      }

      const nameRegex = /^[a-z0-9_]+$/;
      if (!nameRegex.test(name)) {
        return res.status(400).json({
          success: false,
          error: 'Role name must be lowercase alphanumeric with underscores only'
        });
      }

      // Check if new name conflicts with existing role
      if (name !== role.name) {
        const { data: existing } = await supabase
          .from('roles')
          .select('id')
          .eq('name', name)
          .single();

        if (existing) {
          return res.status(409).json({
            success: false,
            error: 'Role with this name already exists'
          });
        }
      }

      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    // Update the role
    updates.updated_at = new Date().toISOString();

    const { data: updatedRole, error: updateError } = await supabase
      .from('roles')
      .update(updates)
      .eq('id', roleId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating role:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update role',
        details: updateError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      role: updatedRole
    });

  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
