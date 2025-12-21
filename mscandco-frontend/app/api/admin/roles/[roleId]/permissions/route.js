import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
async function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration is missing')
  }
  
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(supabaseUrl, serviceRoleKey)
}
/**
 * GET /api/admin/roles/[roleId]/permissions
 * Get all permissions for a specific role
 */
export async function GET(request, { params }) {
  try {
    // Authenticate user
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const { roleId } = await params

    // Get role
    const { data: role, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single()

    if (roleError || !role) {
      return NextResponse.json(
        { error: 'Role not found', message: roleError?.message },
        { status: 404 }
      )
    }

    // Get all permissions
    const { data: allPermissions, error: permsError } = await supabaseAdmin
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true })
      .order('action', { ascending: true })

    if (permsError) {
      console.error('Error fetching permissions:', permsError)
      return NextResponse.json(
        { error: 'Failed to fetch permissions', message: permsError.message },
        { status: 500 }
      )
    }

    // Get role permissions from role_permissions table
    const { data: rolePermissions, error: rolePermsError } = await supabaseAdmin
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', roleId)

    let assignedPermissionIds = []
    if (!rolePermsError && rolePermissions) {
      assignedPermissionIds = rolePermissions.map(rp => rp.permission_id)
    } else if (rolePermsError) {
      console.error('Error fetching role permissions:', rolePermsError)
      // Continue with empty array if there's an error
    }

    // Mark which permissions are assigned to this role
    const permissions = (allPermissions || []).map(perm => ({
      ...perm,
      assigned: assignedPermissionIds.includes(perm.id)
    }))

    // Also return assigned permissions in the format the client expects
    const assignedPermissions = permissions
      .filter(p => p.assigned)
      .map(p => ({
        permission_name: p.name,
        permission_id: p.id,
        ...p
      }))

    // Group by resource
    const grouped = {}
    permissions.forEach(perm => {
      const resource = perm.resource || 'general'
      if (!grouped[resource]) {
        grouped[resource] = []
      }
      grouped[resource].push(perm)
    })

    return NextResponse.json({
      success: true,
      role,
      permissions,
      assigned_permissions: assignedPermissions, // Format client expects
      grouped,
      assigned_count: assignedPermissionIds.length,
      total_count: permissions.length
    })

  } catch (error) {
    console.error('Error in role permissions GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/roles/[roleId]/permissions
 * Toggle a permission for a role
 */
export async function POST(request, { params }) {
  try {
    // Authenticate user
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const { roleId } = await params
    const body = await request.json()
    const { permission_id, assigned } = body

    if (!permission_id || typeof assigned !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request', message: 'permission_id and assigned (boolean) required' },
        { status: 400 }
      )
    }

    // Try role_permission_assignments table first
    if (assigned) {
      // Add permission
      const { error: insertError } = await supabaseAdmin
        .from('role_permission_assignments')
        .insert({ role_id: roleId, permission_id })
        .select()

      if (insertError) {
        // If that fails, try upsert
        const { error: upsertError } = await supabaseAdmin
          .from('role_permission_assignments')
          .upsert({ role_id: roleId, permission_id }, { onConflict: 'role_id,permission_id' })

        if (upsertError) {
          console.error('Error assigning permission:', upsertError)
          return NextResponse.json(
            { error: 'Failed to assign permission', message: upsertError.message },
            { status: 500 }
          )
        }
      }
    } else {
      // Remove permission
      const { error: deleteError } = await supabaseAdmin
        .from('role_permission_assignments')
        .delete()
        .eq('role_id', roleId)
        .eq('permission_id', permission_id)

      if (deleteError) {
        console.error('Error removing permission:', deleteError)
        return NextResponse.json(
          { error: 'Failed to remove permission', message: deleteError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: assigned ? 'Permission assigned' : 'Permission removed'
    })

  } catch (error) {
    console.error('Error in role permissions POST:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

