/**
 * API: Split Configuration Overrides (App Router)
 * POST/DELETE /api/admin/splitconfiguration/override - Manage individual revenue split overrides
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { hasPermission } from '@/lib/rbac/roles'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

    // Get user role
    const { data: profile } = await supabaseAdmin
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

    // Check if override already exists
    let query = supabaseAdmin
      .from('revenue_splits')
      .select('id')

    if (type === 'artist') {
      query = query.eq('artist_id', user_id)
    } else if (type === 'label' || type === 'label_admin') {
      query = query.eq('label_admin_id', user_id)
    } else {
      return NextResponse.json({
        error: 'Invalid type. Must be artist or label'
      }, { status: 400 })
    }

    const { data: existing } = await query.single()

    if (existing) {
      // Update existing override
      const updateData = {
        is_active: true,
        created_by: session.user.id,
        updated_at: new Date().toISOString()
      }

      if (type === 'artist') {
        updateData.artist_percentage = percentage
        // Calculate complementary label percentage
        updateData.label_percentage = 100 - percentage
      } else {
        updateData.label_percentage = percentage
        // Calculate complementary artist percentage
        updateData.artist_percentage = 100 - percentage
      }

      const { error: updateError } = await supabaseAdmin
        .from('revenue_splits')
        .update(updateData)
        .eq('id', existing.id)

      if (updateError) {
        console.error('❌ Error updating override:', updateError)
        return NextResponse.json({
          error: 'Failed to update override',
          details: updateError.message
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
        insertData.artist_percentage = percentage
        insertData.label_percentage = 100 - percentage
      } else {
        insertData.label_admin_id = user_id
        insertData.label_percentage = percentage
        insertData.artist_percentage = 100 - percentage
      }

      const { error: insertError } = await supabaseAdmin
        .from('revenue_splits')
        .insert(insertData)

      if (insertError) {
        console.error('❌ Error creating override:', insertError)
        return NextResponse.json({
          error: 'Failed to create override',
          details: insertError.message
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

    // Get user role
    const { data: profile } = await supabaseAdmin
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
    let query = supabaseAdmin
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
