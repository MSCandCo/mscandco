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
      .select('id, name, default_permissions')
      .eq('id', roleId)
      .single()

    if (roleError || !role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    // Get default permissions for this role
    // If default_permissions is a JSON array of permission IDs, use it
    // Otherwise, we might need to look up default permissions from a config
    let defaultPermissionIds = []

    if (role.default_permissions) {
      try {
        if (typeof role.default_permissions === 'string') {
          defaultPermissionIds = JSON.parse(role.default_permissions)
        } else if (Array.isArray(role.default_permissions)) {
          defaultPermissionIds = role.default_permissions
        }
      } catch (e) {
        console.error('Error parsing default_permissions:', e)
      }
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
    if (defaultPermissionIds.length > 0) {
      const defaultPermissions = defaultPermissionIds.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId
      }))

      const { error: insertError } = await supabaseAdmin
        .from('role_permissions')
        .insert(defaultPermissions)

      if (insertError) {
        console.error('Error inserting default permissions:', insertError)
        return NextResponse.json(
          { error: 'Failed to restore default permissions', details: insertError.message },
          { status: 500 }
        )
      }
    }

    console.log(`✅ Successfully reset role ${role.name} to default permissions`)

    return NextResponse.json({
      success: true,
      message: `Role ${role.name} has been reset to default permissions`,
      restoredCount: defaultPermissionIds.length
    })

  } catch (error) {
    console.error('Error in reset-default POST:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
