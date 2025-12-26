import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/admin/roles/[roleId]/reset-default
 * Reset a role to its default permissions
 */
export async function POST(request, { params }) {
  try {
    // Lazy load Supabase clients to avoid build-time errors
    const { createClient } = await import('@/lib/supabase/server');
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const { getDefaultPermissionsForRole } = await import('@/lib/rbac/default-role-permissions');
    
    // Authenticate user
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const { roleId } = await params

    if (!roleId) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'roleId is required' },
        { status: 400 }
      )
    }

    // Get service role client for admin operations
    const supabaseAdmin = await createServiceRoleClient()

    // Verify role exists
    const { data: role, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id, name, is_system_role')
      .eq('id', roleId)
      .single()

    if (roleError || !role) {
      console.error('Error fetching role:', roleError)
      return NextResponse.json(
        { error: 'Role not found', details: roleError?.message },
        { status: 404 }
      )
    }

    // Check if it's a system role - only system roles can be reset
    if (!role.is_system_role) {
      return NextResponse.json(
        { error: 'Can only reset system roles to default permissions' },
        { status: 400 }
      )
    }

    // Protect super_admin from being reset (additional safety check)
    if (role.name === 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot reset super_admin role permissions' },
        { status: 400 }
      )
    }

    // Get default permission names for this role from config
    const defaultPermissionNames = getDefaultPermissionsForRole(role.name)

    if (!defaultPermissionNames || defaultPermissionNames.length === 0) {
      return NextResponse.json(
        { error: `No default permissions defined for role: ${role.name}` },
        { status: 400 }
      )
    }

    console.log(`🔄 Resetting role ${role.name} to default permissions (${defaultPermissionNames.length} permissions)`)

    // Get permission IDs for the default permission names
    const { data: permissions, error: permissionsError } = await supabaseAdmin
      .from('permissions')
      .select('id, name')
      .in('name', defaultPermissionNames)

    if (permissionsError) {
      console.error('Error fetching permissions:', permissionsError)
      return NextResponse.json(
        { error: 'Failed to fetch permissions', details: permissionsError.message },
        { status: 500 }
      )
    }

    // Check if any permissions are missing
    const foundPermissionNames = permissions?.map(p => p.name) || []
    const missingPermissions = defaultPermissionNames.filter(name => !foundPermissionNames.includes(name))
    
    if (missingPermissions.length > 0) {
      console.warn(`⚠️ Some default permissions not found in database for role ${role.name}:`, missingPermissions)
    }

    if (!permissions || permissions.length === 0) {
      return NextResponse.json(
        { error: `No valid permissions found for role: ${role.name}` },
        { status: 400 }
      )
    }

    // Delete all existing permissions for this role
    const { error: deleteError } = await supabaseAdmin
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)

    if (deleteError) {
      console.error('Error deleting existing permissions:', deleteError)
      return NextResponse.json(
        { error: 'Failed to reset permissions', details: deleteError.message },
        { status: 500 }
      )
    }

    // Add default permissions back
    const rolePermissions = permissions.map(permission => ({
      role_id: roleId,
      permission_id: permission.id
    }))

    const { error: insertError } = await supabaseAdmin
      .from('role_permissions')
      .insert(rolePermissions)

    if (insertError) {
      console.error('Error inserting default permissions:', insertError)
      return NextResponse.json(
        { error: 'Failed to restore default permissions', details: insertError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully reset role ${role.name} to default permissions (${permissions.length} permissions restored)`)

    return NextResponse.json({
      success: true,
      message: `Role "${role.name}" has been reset to default permissions`,
      restoredCount: permissions.length,
      missingPermissions: missingPermissions.length > 0 ? missingPermissions : undefined
    })

  } catch (error) {
    console.error('Error in reset-default POST:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
