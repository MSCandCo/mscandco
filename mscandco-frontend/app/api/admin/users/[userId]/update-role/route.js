/**
 * API: Update User Role (App Router)
 * POST /api/admin/users/[userId]/update-role
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request, { params }) {
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

    const { userId } = await params
    const body = await request.json()
    const { role } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }

    // Validate role exists in roles table
    const { data: roleExists, error: roleCheckError } = await supabaseAdmin
      .from('roles')
      .select('name')
      .eq('name', role)
      .single()

    if (roleCheckError || !roleExists) {
      // Get list of valid roles for error message
      const { data: validRoles } = await supabaseAdmin
        .from('roles')
        .select('name')
        .order('name')

      return NextResponse.json({
        error: 'Invalid role',
        validRoles: validRoles?.map(r => r.name) || []
      }, { status: 400 })
    }

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, role')
      .eq('id', userId)
      .single()

    if (checkError) {
      console.error('Error checking user exists:', checkError)
      return NextResponse.json({
        error: 'User not found',
        details: process.env.NODE_ENV === 'development' ? checkError.message : undefined
      }, { status: 404 })
    }

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log(`Updating user ${existingUser.email} from ${existingUser.role} to ${role}`)

    // Update user role
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, email, first_name, last_name, role, updated_at')
      .single()

    if (updateError) {
      console.error('Error updating user role:', updateError)
      return NextResponse.json({
        error: 'Failed to update user role',
        details: process.env.NODE_ENV === 'development' ? updateError.message : 'Database update failed',
        code: updateError.code
      }, { status: 500 })
    }

    if (!updatedUser) {
      console.error('No user returned after update')
      return NextResponse.json({
        error: 'Failed to update user role',
        details: 'No user data returned after update'
      }, { status: 500 })
    }

    console.log(`Successfully updated user ${updatedUser.email} to role ${updatedUser.role}`)

    // Update auth.users metadata so it's available on next login
    try {
      const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            role: role
          }
        }
      )

      if (metadataError) {
        console.error('Warning: Failed to update user metadata:', metadataError)
      } else {
        console.log(`Updated auth metadata for ${updatedUser.email} with role ${role}`)
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
