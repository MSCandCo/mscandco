/**
 * API: Search Users (App Router)
 * GET /api/admin/users/search?q=searchterm
 */

import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors

      return {
        id: user.id,
        email: user.email,
        name: name || user.email,
        role: user.role
      }
    })

    console.log(`✅ Found ${formattedUsers.length} users`)

    return NextResponse.json({
      success: true,
      users: formattedUsers
    })

  } catch (error) {
    console.error('❌ User search error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
