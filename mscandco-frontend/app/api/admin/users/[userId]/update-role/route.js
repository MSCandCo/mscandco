/**
 * API: Update User Role (App Router)
 * POST /api/admin/users/[userId]/update-role
 */

import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
      )

      if (metadataError) {
        console.error('Warning: Failed to update user metadata:', metadataError)
      } else {
        console.log(`Updated auth metadata (user_metadata and app_metadata) for ${updatedUser.email} with role ${role}`)
      }
    } catch (metadataUpdateError) {
      console.error('Warning: Exception updating user metadata:', metadataUpdateError)
    }

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        role: updatedUser.role,
        updated_at: updatedUser.updated_at
      }
    })

  } catch (error) {
    console.error('Error in update-role:', error)
    return NextResponse.json({
      error: 'Failed to update user role',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    }, { status: 500 })
  }
}
