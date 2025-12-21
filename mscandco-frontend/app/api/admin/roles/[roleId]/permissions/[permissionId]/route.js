import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration is missing')
  }
  
  const { createClient } = require('@supabase/supabase-js')
  return createClient(supabaseUrl, serviceRoleKey)
}
/**
 * POST /api/admin/roles/[roleId]/permissions/[permissionId]
 * Add a permission to a role
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
    const { data: permission, error: permCheckError } = await supabaseAdmin
      .from('permissions')
      .select('id, name')
      .eq('id', permissionId)
      .single()

    if (permCheckError || !permission) {
      return NextResponse.json(
        { error: 'Permission not found', message: `Permission with ID ${permissionId} does not exist` },
        { status: 404 }
      )
    }

    // Verify role exists
    const { data: role, error: roleCheckError } = await supabaseAdmin
      .from('roles')
      .select('id, name')
      .eq('id', roleId)
      .single()

    if (roleCheckError || !role) {
      return NextResponse.json(
        { error: 'Role not found', message: `Role with ID ${roleId} does not exist` },
        { status: 404 }
      )
    }

    // Use role_permissions table (the actual table name in the database)
    // Use service role key which bypasses RLS
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('role_permissions')
      .insert({ 
        role_id: roleId, 
        permission_id: permissionId,
        granted_at: new Date().toISOString()
      })
      .select()

    if (insertError) {
      // Check if it's a duplicate (permission already assigned)
      if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('unique') || insertError.message?.includes('already exists')) {
        // Duplicate key - permission already assigned
        console.log(`Permission ${permissionId} already assigned to role ${roleId}`)
        return NextResponse.json({
          success: true,
          message: 'Permission already assigned'
        })
      }

      // Log the full error for debugging
      console.error('Error assigning permission:', {
        error: insertError,
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })

      return NextResponse.json(
        { 
          error: 'Failed to assign permission', 
          message: insertError.message || 'Unknown error',
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully added permission ${permission.name} to role ${role.name}`)

    return NextResponse.json({
      success: true,
      message: 'Permission added successfully'
    })

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
    // Authenticate user
    const supabase = await createServerClient()
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

