/**
 * API: Split Configuration (App Router)
 * GET/PUT /api/admin/splitconfiguration - Manage revenue split configuration
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { hasPermission } from '@/lib/rbac/roles'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
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

    // Check read permission
    const canRead = await hasPermission(userRole, 'finance:split_configuration:read', session.user.id)
    if (!canRead) {
      return NextResponse.json({
        error: 'Insufficient permissions to view split configuration'
      }, { status: 403 })
    }

    console.log('📊 Fetching split configuration...')

    // Get global configuration
    const { data: config, error: configError } = await supabaseAdmin
      .from('revenue_split_config')
      .select('*')
      .eq('company_id', 'msc-co')
      .single()

    if (configError && configError.code !== 'PGRST116') {
      console.error('❌ Error fetching config:', configError)
      return NextResponse.json({
        error: 'Failed to fetch configuration'
      }, { status: 500 })
    }

    // Get super label admin (labeladmin@mscandco.com)
    const { data: superLabel } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, first_name, last_name, label_name, display_name')
      .eq('email', 'labeladmin@mscandco.com')
      .single()

    // Get all artists with custom splits
    const { data: artistSplits } = await supabaseAdmin
      .from('revenue_splits')
      .select(`
        artist_id,
        artist_percentage,
        artist:artist_id (
          email,
          first_name,
          last_name,
          artist_name,
          display_name
        )
      `)
      .not('artist_id', 'is', null)
      .eq('is_active', true)

    // Get all label admins with custom splits
    const { data: labelSplits } = await supabaseAdmin
      .from('revenue_splits')
      .select(`
        label_admin_id,
        label_percentage,
        label:label_admin_id (
          email,
          first_name,
          last_name,
          label_name,
          display_name
        )
      `)
      .not('label_admin_id', 'is', null)
      .eq('is_active', true)

    // Process artist overrides
    const artistOverrides = artistSplits?.map(split => {
      const name = split.artist?.artist_name ||
                   split.artist?.display_name ||
                   `${split.artist?.first_name || ''} ${split.artist?.last_name || ''}`.trim() ||
                   'Unknown Artist'

      return {
        user_id: split.artist_id,
        user_name: name,
        user_email: split.artist?.email || '',
        percentage: parseFloat(split.artist_percentage) || 80
      }
    }) || []

    // Process label overrides
    const labelOverrides = labelSplits?.map(split => {
      const name = split.label?.label_name ||
                   split.label?.display_name ||
                   `${split.label?.first_name || ''} ${split.label?.last_name || ''}`.trim() ||
                   'Unknown Label'

      return {
        user_id: split.label_admin_id,
        user_name: name,
        user_email: split.label?.email || '',
        percentage: parseFloat(split.label_percentage) || 20
      }
    }) || []

    const superLabelName = superLabel?.label_name ||
                           superLabel?.display_name ||
                           `${superLabel?.first_name || ''} ${superLabel?.last_name || ''}`.trim() ||
                           'MSC & Co'

    console.log('✅ Configuration loaded successfully')

    return NextResponse.json({
      success: true,
      defaults: {
        company_id: config?.company_id || 'msc-co',
        company_percentage: parseFloat(config?.company_admin_percentage) || 20,
        artist_percentage: parseFloat(config?.artist_percentage) || 80,
        label_percentage: parseFloat(config?.label_admin_percentage) || 20,
        super_label_percentage: parseFloat(config?.label_admin_percentage) || 20,
        super_label_admin: {
          id: superLabel?.id,
          email: superLabel?.email || 'labeladmin@mscandco.com',
          name: superLabelName
        },
        updated_at: config?.updated_at,
        updated_by: config?.updated_by_email
      },
      artist_overrides: artistOverrides,
      label_overrides: labelOverrides
    })

  } catch (error) {
    console.error('❌ Split configuration API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

export async function PUT(request) {
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

    // Check update permission
    const canUpdate = await hasPermission(userRole, 'finance:split_configuration:update', session.user.id)
    if (!canUpdate) {
      return NextResponse.json({
        error: 'Insufficient permissions to update split configuration'
      }, { status: 403 })
    }

    console.log('💾 Updating split configuration...')

    const body = await request.json()
    const {
      company_percentage,
      artist_percentage,
      label_percentage,
      super_label_percentage
    } = body

    // Validate percentages
    if (artist_percentage + label_percentage !== 100) {
      return NextResponse.json({
        error: 'Artist and label percentages must total 100%'
      }, { status: 400 })
    }

    // Update global configuration
    const { error: updateError } = await supabaseAdmin
      .from('revenue_split_config')
      .update({
        company_admin_percentage: company_percentage || super_label_percentage,
        artist_percentage: artist_percentage,
        label_admin_percentage: label_percentage,
        updated_by_user_id: session.user.id,
        updated_by_email: session.user.email,
        updated_at: new Date().toISOString()
      })
      .eq('company_id', 'msc-co')

    if (updateError) {
      console.error('❌ Error updating config:', updateError)
      return NextResponse.json({
        error: 'Failed to update configuration',
        details: updateError.message
      }, { status: 500 })
    }

    console.log('✅ Configuration updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully'
    })

  } catch (error) {
    console.error('❌ Split configuration update error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
