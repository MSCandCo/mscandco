import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

