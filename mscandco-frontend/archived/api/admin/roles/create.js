/**
 * POST /api/superadmin/roles/create
 *
 * Create new custom role
 * Protected by: role:create:any
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
    const authorized = await requirePermission(req, res, 'role:manage:any');
    if (!authorized) return;

    const { name, description } = req.body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Role name is required'
      });
    }

    // Validate name format (lowercase, alphanumeric, underscores only)
    const nameRegex = /^[a-z0-9_]+$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        success: false,
        error: 'Role name must be lowercase alphanumeric with underscores only'
      });
    }

    // Check if role already exists
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

    // Create the role
    const { data: newRole, error: createError } = await supabase
      .from('roles')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        is_system_role: false // Custom roles are not system roles
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating role:', createError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create role',
        details: createError.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      role: newRole
    });

  } catch (error) {
    console.error('Create role error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
