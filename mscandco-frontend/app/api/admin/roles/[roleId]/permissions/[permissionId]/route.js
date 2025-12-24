import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

