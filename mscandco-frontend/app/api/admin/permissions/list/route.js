import { NextResponse } from 'next/server'

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
 * GET /api/admin/permissions/list
 *
 * List all permissions grouped by resource
 * Requires superadmin role
 */
export async function GET() {
  try {
    // Fetch all permissions directly using service role
    const supabase = await getSupabaseAdmin()
    const { data: permissions, error } = await supabase
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true })
      .order('action', { ascending: true })
      .order('scope', { ascending: true })

    if (error) {
      console.error('Error fetching permissions:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch permissions',
          details: error.message
        },
        { status: 500 }
      )
    }

    // Group by resource
    const grouped = {}
    for (const perm of permissions) {
      const resource = perm.resource
      if (!grouped[resource]) {
        grouped[resource] = []
      }
      grouped[resource].push(perm)
    }

    // Calculate totals
    const totals = {
      total: permissions.length,
      byResource: Object.keys(grouped).reduce((acc, key) => {
        acc[key] = grouped[key].length
        return acc
      }, {})
    }

    return NextResponse.json({
      success: true,
      permissions,
      grouped,
      totals
    })

  } catch (error) {
    console.error('Permissions list error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
}
