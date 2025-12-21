/**
 * API: List All Roles (App Router)
 * GET /api/admin/roles/list
 */

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
    // Try role_permission_assignments first, then role_permissions
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        let count = 0
        
        // Try role_permission_assignments table first
        const { count: count1, error: countError1 } = await supabaseAdmin
          .from('role_permission_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('role_id', role.id)

        if (!countError1 && count1 !== null) {
          count = count1
        } else {
          // Fallback to role_permissions table
          const { count: count2, error: countError2 } = await supabaseAdmin
            .from('role_permissions')
            .select('*', { count: 'exact', head: true })
            .eq('role_id', role.id)

          if (!countError2 && count2 !== null) {
            count = count2
          }
        }

        return {
          ...role,
          permission_count: count
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
