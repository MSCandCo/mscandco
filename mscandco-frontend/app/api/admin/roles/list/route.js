/**
 * API: List All Roles (App Router)
 * GET /api/admin/roles/list
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors

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
