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

  const { name, description, permission_ids } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Role name is required'
    });
  }

  // Validate name format (lowercase, underscores only)
  const roleName = name.toLowerCase().replace(/\s+/g, '_');
  if (!/^[a-z_]+$/.test(roleName)) {
    return res.status(400).json({
      success: false,
      error: 'Role name can only contain lowercase letters and underscores'
    });
  }

  // Prevent creating protected role names
  const protectedRoles = ['super_admin', 'company_admin', 'label_admin', 'artist', 'distribution_partner'];
  if (protectedRoles.includes(roleName)) {
    return res.status(400).json({
      success: false,
      error: 'Cannot create role with protected name'
    });
  }

  try {
    // Check if role already exists
    const { data: existingRole, error: checkError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (existingRole) {
      return res.status(400).json({
        success: false,
        error: 'A role with this name already exists'
      });
    }

    // Create the role
    const { data: newRole, error: createError } = await supabase
      .from('roles')
      .insert({
        name: roleName,
        description: description || null
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating role:', createError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create role'
      });
    }

    // Assign permissions if provided
    if (permission_ids && Array.isArray(permission_ids) && permission_ids.length > 0) {
      const rolePermissions = permission_ids.map(permissionId => ({
        role_id: newRole.id,
        permission_id: permissionId
      }));

      const { error: permError } = await supabase
        .from('role_permissions')
        .insert(rolePermissions);

      if (permError) {
        console.error('Error assigning permissions:', permError);
        // Delete the role if permission assignment fails
        await supabase
          .from('roles')
          .delete()
          .eq('id', newRole.id);

        return res.status(500).json({
          success: false,
          error: 'Failed to assign permissions to role'
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Role "${roleName}" created successfully`,
      role: newRole,
      permissions_assigned: permission_ids?.length || 0
    });

  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// V2 Permission: Requires create permission for permissions & roles management
export default requirePermission('users_access:permissions_roles:create')(handler);
