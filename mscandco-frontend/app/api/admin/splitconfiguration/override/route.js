/**
 * API: Split Configuration Overrides (App Router)
 * POST/DELETE /api/admin/splitconfiguration/override - Manage individual revenue split overrides
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { hasPermission } from '@/lib/rbac/roles'


export async function POST(request) {
  try {
    // Check authentication
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
      }, { status: 401 })
    }

    // Lazy initialization to avoid build-time errors
    const getSupabaseAdmin = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase configuration is missing')
      }
      const { createClient } = await import('@supabase/supabase-js')
      return createClient(supabaseUrl, serviceRoleKey)
    }

    // Get user role
    const supabaseAdminPost = await getSupabaseAdmin()
    const { data: profile } = await supabaseAdminPost
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const userRole = profile?.role || 'artist'

    // Check permission
    const canUpdate = await hasPermission(userRole, 'finance:split_configuration:update', session.user.id)
    if (!canUpdate) {
      return NextResponse.json({
        error: 'Insufficient permissions to create overrides'
      }, { status: 403 })
    }

    console.log('➕ Creating split override...')

    const body = await request.json()
    const { user_id, percentage, type } = body

    if (!user_id || percentage === undefined || !type) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 })
    }

    if (percentage < 0 || percentage > 100) {
      return NextResponse.json({
        error: 'Percentage must be between 0 and 100'
      }, { status: 400 })
    }

    // Check if override already exists (including inactive ones)
    // We want to find ANY existing override for this user, regardless of active status
    let query = supabaseAdminPost
      .from('revenue_splits')
      .select('id, is_active, artist_id, label_admin_id')

    if (type === 'artist') {
      query = query.eq('artist_id', user_id)
    } else if (type === 'label' || type === 'label_admin') {
      query = query.eq('label_admin_id', user_id)
    } else {
      return NextResponse.json({
        error: 'Invalid type. Must be artist or label'
      }, { status: 400 })
    }

    // Get all existing overrides (there should only be one, but handle multiple)
    const { data: existingRows, error: queryError } = await query

    if (queryError && queryError.code !== 'PGRST116') {
      // Log the full error for debugging
      console.error('❌ Error checking for existing override:', {
        error: queryError,
        code: queryError.code,
        message: queryError.message,
        details: queryError.details,
        hint: queryError.hint,
        type: type,
        user_id: user_id
      })
      
      return NextResponse.json({
        error: 'Failed to check for existing override',
        message: queryError.message || 'Unknown error',
        details: queryError.details,
        hint: queryError.hint,
        code: queryError.code
      }, { status: 500 })
    }

    // Get the first existing override (or null if none exists)
    const existing = existingRows && existingRows.length > 0 ? existingRows[0] : null

    if (existing) {
      // Update existing override
      const updateData = {
        is_active: true,
        created_by: session.user.id
        // Don't manually set updated_at - let the trigger handle it
      }

      if (type === 'artist') {
        updateData.artist_percentage = Math.round(percentage * 100) / 100  // Round to 2 decimal places
        // Calculate complementary label percentage
        updateData.label_percentage = Math.round((100 - percentage) * 100) / 100  // Round to 2 decimal places
      } else {
        updateData.label_percentage = Math.round(percentage * 100) / 100  // Round to 2 decimal places
        // Calculate complementary artist percentage
        updateData.artist_percentage = Math.round((100 - percentage) * 100) / 100  // Round to 2 decimal places
      }

      const { error: updateError } = await supabaseAdminPost
        .from('revenue_splits')
        .update(updateData)
        .eq('id', existing.id)

      if (updateError) {
        console.error('❌ Error updating override:', updateError)
        console.error('❌ Update data:', updateData)
        console.error('❌ Existing ID:', existing.id)
        console.error('❌ Error code:', updateError.code)
        console.error('❌ Error message:', updateError.message)
        console.error('❌ Error details:', updateError.details)
        console.error('❌ Error hint:', updateError.hint)
        
        return NextResponse.json({
          error: 'Failed to update override',
          message: updateError.message || 'Unknown error',
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        }, { status: 500 })
      }
    } else {
      // Create new override
      const insertData = {
        is_active: true,
        created_by: session.user.id,
        effective_from: new Date().toISOString()
      }

      if (type === 'artist') {
        insertData.artist_id = user_id
        insertData.label_admin_id = null  // Explicitly set to null
        insertData.artist_percentage = Math.round(percentage * 100) / 100  // Round to 2 decimal places
        insertData.label_percentage = Math.round((100 - percentage) * 100) / 100  // Round to 2 decimal places
      } else {
        insertData.label_admin_id = user_id
        insertData.artist_id = null  // Explicitly set to null
        insertData.label_percentage = Math.round(percentage * 100) / 100  // Round to 2 decimal places
        insertData.artist_percentage = Math.round((100 - percentage) * 100) / 100  // Round to 2 decimal places
      }

      const { error: insertError } = await supabaseAdminPost
        .from('revenue_splits')
        .insert(insertData)

      if (insertError) {
        console.error('❌ Error creating override:', insertError)
        console.error('❌ Insert data:', insertData)
        console.error('❌ Error code:', insertError.code)
        console.error('❌ Error message:', insertError.message)
        console.error('❌ Error details:', insertError.details)
        console.error('❌ Error hint:', insertError.hint)
        
        return NextResponse.json({
          error: 'Failed to create override',
          message: insertError.message || 'Unknown error',
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        }, { status: 500 })
      }
    }

    console.log('✅ Override saved successfully')

    return NextResponse.json({
      success: true,
      message: 'Override saved successfully'
    })

  } catch (error) {
    console.error('❌ Override creation error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    // Check authentication
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
      }, { status: 401 })
    }

    // Lazy initialization to avoid build-time errors
    const getSupabaseAdmin = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase configuration is missing')
      }
      const { createClient } = await import('@supabase/supabase-js')
      return createClient(supabaseUrl, serviceRoleKey)
    }

    // Get user role
    const supabaseAdminDelete = await getSupabaseAdmin()
    const { data: profile } = await supabaseAdminDelete
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const userRole = profile?.role || 'artist'

    // Check permission
    const canUpdate = await hasPermission(userRole, 'finance:split_configuration:update', session.user.id)
    if (!canUpdate) {
      return NextResponse.json({
        error: 'Insufficient permissions to remove overrides'
      }, { status: 403 })
    }

    console.log('🗑️ Removing split override...')

    const body = await request.json()
    const { user_id, type } = body

    if (!user_id || !type) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Deactivate the override instead of deleting
    let query = supabaseAdminDelete
      .from('revenue_splits')
      .update({
        is_active: false,
        effective_until: new Date().toISOString()
      })

    if (type === 'artist') {
      query = query.eq('artist_id', user_id)
    } else if (type === 'label' || type === 'label_admin') {
      query = query.eq('label_admin_id', user_id)
    } else {
      return NextResponse.json({
        error: 'Invalid type'
      }, { status: 400 })
    }

    const { error } = await query

    if (error) {
      console.error('❌ Error removing override:', error)
      return NextResponse.json({
        error: 'Failed to remove override',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Override removed successfully')

    return NextResponse.json({
      success: true,
      message: 'Override removed successfully'
    })

  } catch (error) {
    console.error('❌ Override removal error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
