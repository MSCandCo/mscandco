import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/roles/[roleId]/permissions
 * Get all permissions for a specific role
 */
export async function GET(request, { params }) {
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

    // Fetch permissions for this role
    // Try role_permissions table first (the actual table name in the database)
    const { data: rolePermissions, error: permissionsError } = await supabaseAdmin
      .from('role_permissions')
      .select(`
        permission_id,
        permissions!role_permissions_permission_id_fkey (
          id,
          name,
          resource,
          action,
          scope,
          description
        )
      `)
      .eq('role_id', roleId)

    if (permissionsError) {
      console.error('Error fetching role permissions:', permissionsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch role permissions',
        hint: permissionsError.hint
      }, { status: 500 })
    }

    // Format response
    const formattedPermissions = (rolePermissions || []).map(rp => ({
      id: rp.permissions?.id,
      name: rp.permissions?.name,
      resource: rp.permissions?.resource,
      action: rp.permissions?.action,
      scope: rp.permissions?.scope,
      description: rp.permissions?.description
    })).filter(p => p.id) // Filter out any null permissions

    return NextResponse.json({
      success: true,
      roleId,
      permissions: formattedPermissions,
      count: formattedPermissions.length
    })

  } catch (error) {
    console.error('Error in role permissions GET:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * POST /api/admin/roles/[roleId]/permissions
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

    const { roleId } = await params
    const body = await request.json()
    const { permissionId } = body

    if (!roleId || !permissionId) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'roleId and permissionId are required' },
        { status: 400 }
      )
    }

    // Get service role client for admin operations
    const supabaseAdmin = await createServiceRoleClient()

    // Verify permission exists
    const { data: permission } = await supabaseAdmin
      .from('permissions')
      .select('id, name')
      .eq('id', permissionId)
      .single()

    // Verify role exists
    const { data: role } = await supabaseAdmin
      .from('roles')
      .select('id, name')
      .eq('id', roleId)
      .single()

    // Use role_permissions table (the actual table name in the database)
    const { data, error } = await supabaseAdmin
      .from('role_permissions')
      .insert({
        role_id: roleId,
        permission_id: permissionId
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding permission:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details
      })

      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { 
            error: 'Permission already exists for this role', 
            message: error.message
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { 
          error: 'Failed to add permission', 
          message: error.message || 'Unknown error',
          details: error.details,
          code: error.code
        },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully added permission ${permission?.name || permissionId} to role ${role?.name || roleId}`)

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
