import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/admin/roles/[roleId]/permissions/[permissionId]
 * Add a permission to a role
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

    // Get service role client for admin operations
    const supabaseAdmin = await createServiceRoleClient()

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { roleId, permissionId } = await params

    if (!roleId || !permissionId) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'roleId and permissionId are required' },
        { status: 400 }
      )
    }

    console.log(`➕ Adding permission ${permissionId} to role ${roleId}`)

    // Verify permission exists
    const { data: permission, error: permError } = await supabaseAdmin
      .from('permissions')
      .select('id, name')
      .eq('id', permissionId)
      .single()

    if (permError || !permission) {
      return NextResponse.json(
        { error: 'Permission not found', message: permError?.message || 'Permission does not exist' },
        { status: 404 }
      )
    }

    // Verify role exists
    const { data: role, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id, name')
      .eq('id', roleId)
      .single()

    if (roleError || !role) {
      return NextResponse.json(
        { error: 'Role not found', message: roleError?.message || 'Role does not exist' },
        { status: 404 }
      )
    }

    // Insert into role_permissions table
    const { data, error: insertError } = await supabaseAdmin
      .from('role_permissions')
      .insert({
        role_id: roleId,
        permission_id: permissionId
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error adding permission:', {
        error: insertError,
        code: insertError.code,
        message: insertError.message,
        details: insertError.details
      })

      // If permission already exists, return success (idempotent)
      if (insertError.code === '23505') { // Unique violation
        return NextResponse.json({
          success: true,
          message: 'Permission already exists for this role'
        }, { status: 200 })
      }

      return NextResponse.json(
        { 
          error: 'Failed to add permission', 
          message: insertError.message || 'Unknown error',
          details: insertError.details,
          code: insertError.code
        },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully added permission ${permission.name} to role ${role.name}`)

    return NextResponse.json({
      success: true,
      message: 'Permission added successfully',
      data
    }, { status: 201 })

  } catch (error) {
    console.error('Error in add permission POST:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/roles/[roleId]/permissions/[permissionId]
 * Remove a permission from a role
 */
export async function DELETE(request, { params }) {
  try {
    // Lazy load Supabase clients to avoid build-time errors
    const { createClient } = await import('@/lib/supabase/server');
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    
    // Authenticate user
    const supabase = await createClient()
    
    // Get service role client for admin operations
    const supabaseAdmin = await createServiceRoleClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { roleId, permissionId } = await params

    if (!roleId || !permissionId) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'roleId and permissionId are required' },
        { status: 400 }
      )
    }

    console.log(`➖ Removing permission ${permissionId} from role ${roleId}`)

    // Verify permission exists
    const { data: permission, error: permError } = await supabaseAdmin
      .from('permissions')
      .select('id, name')
      .eq('id', permissionId)
      .single()

    if (permError || !permission) {
      return NextResponse.json(
        { error: 'Permission not found', message: permError?.message || 'Permission does not exist' },
        { status: 404 }
      )
    }

    // Verify role exists
    const { data: role, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id, name')
      .eq('id', roleId)
      .single()

    if (roleError || !role) {
      return NextResponse.json(
        { error: 'Role not found', message: roleError?.message || 'Role does not exist' },
        { status: 404 }
      )
    }

    // Use role_permissions table (the actual table name in the database)
    // Delete only the specific permission-role combination
    const { error: deleteError } = await supabaseAdmin
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
      .eq('permission_id', permissionId)

    if (deleteError) {
      console.error('Error removing permission:', {
        error: deleteError,
        code: deleteError.code,
        message: deleteError.message,
        details: deleteError.details
      })

      return NextResponse.json(
        { 
          error: 'Failed to remove permission', 
          message: deleteError.message || 'Unknown error',
          details: deleteError.details,
          code: deleteError.code
        },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully removed permission ${permission?.name || permissionId} from role ${role?.name || roleId}`)

    return NextResponse.json({
      success: true,
      message: 'Permission removed successfully'
    })

  } catch (error) {
    console.error('Error in remove permission DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

