/**
 * API: List All Roles (App Router)
 * GET /api/admin/roles/list
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  try {
    // Check if user is authenticated using Supabase server client
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
      }, { status: 401 })
    }

    // Fetch all roles with permission counts
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('roles')
      .select(`
        id,
        name,
        description,
        created_at
      `)
      .order('name')

    if (rolesError) {
      console.error('Error fetching roles:', rolesError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch roles',
        hint: rolesError.hint
      }, { status: 500 })
    }

    // Get permission counts for each role
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const { count, error: countError } = await supabaseAdmin
          .from('role_permissions')
          .select('*', { count: 'exact', head: true })
          .eq('role_id', role.id)

        if (countError) {
          console.error(`Error counting permissions for role ${role.id}:`, countError)
        }

        return {
          ...role,
          permission_count: count || 0
        }
      })
    )

    return NextResponse.json({
      success: true,
      roles: rolesWithCounts
    })

  } catch (error) {
    console.error('Roles list error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
