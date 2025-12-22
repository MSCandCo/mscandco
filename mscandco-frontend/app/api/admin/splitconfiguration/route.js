/**
 * API: Split Configuration (App Router)
 * GET/PUT /api/admin/splitconfiguration - Manage revenue split configuration
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { hasPermission } from '@/lib/rbac/roles'


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
    const supabaseAdmin = await getSupabaseAdmin()
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
    const { data: artistSplits, error: artistSplitsError } = await supabaseAdmin
      .from('revenue_splits')
      .select('id, artist_id, artist_percentage, label_percentage, is_active')
      .not('artist_id', 'is', null)
      .eq('is_active', true)

    if (artistSplitsError) {
      console.error('❌ Error fetching artist splits:', artistSplitsError)
    } else {
      console.log(`✅ Found ${artistSplits?.length || 0} artist overrides`)
    }

    // Get all label admins with custom splits
    const { data: labelSplits, error: labelSplitsError } = await supabaseAdmin
      .from('revenue_splits')
      .select('id, label_admin_id, label_percentage, artist_percentage, is_active')
      .not('label_admin_id', 'is', null)
      .eq('is_active', true)

    if (labelSplitsError) {
      console.error('❌ Error fetching label splits:', labelSplitsError)
    } else {
      console.log(`✅ Found ${labelSplits?.length || 0} label overrides`)
    }

    // Fetch user data separately for artists
    const artistIds = (artistSplits || []).map(s => s.artist_id).filter(Boolean)
    let artistUsers = {}
    if (artistIds.length > 0) {
      const { data: users, error: usersError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email, first_name, last_name, artist_name, display_name')
        .in('id', artistIds)
      
      if (!usersError && users) {
        users.forEach(user => {
          artistUsers[user.id] = user
        })
      }
    }

    // Fetch user data separately for label admins
    const labelIds = (labelSplits || []).map(s => s.label_admin_id).filter(Boolean)
    let labelUsers = {}
    if (labelIds.length > 0) {
      const { data: users, error: usersError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email, first_name, last_name, label_name, display_name')
        .in('id', labelIds)
      
      if (!usersError && users) {
        users.forEach(user => {
          labelUsers[user.id] = user
        })
      }
    }

    // Process artist overrides
    const artistOverrides = (artistSplits || []).map(split => {
      const artistData = artistUsers[split.artist_id] || {}
      const name = artistData.artist_name ||
                   artistData.display_name ||
                   `${artistData.first_name || ''} ${artistData.last_name || ''}`.trim() ||
                   'Unknown Artist'

      return {
        user_id: split.artist_id,
        user_name: name,
        user_email: artistData.email || '',
        percentage: parseFloat(split.artist_percentage) || 80
      }
    })

    // Process label overrides
    const labelOverrides = (labelSplits || []).map(split => {
      const labelData = labelUsers[split.label_admin_id] || {}
      const name = labelData.label_name ||
                   labelData.display_name ||
                   `${labelData.first_name || ''} ${labelData.last_name || ''}`.trim() ||
                   'Unknown Label'

      return {
        user_id: split.label_admin_id,
        user_name: name,
        user_email: labelData.email || '',
        percentage: parseFloat(split.label_percentage) || 20
      }
    })

    console.log(`📊 Processed ${artistOverrides.length} artist overrides and ${labelOverrides.length} label overrides`)

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
    const supabaseAdminPut = await getSupabaseAdmin()
    const { data: profile } = await supabaseAdminPut
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

    // Validate percentages (use tolerance for floating point precision)
    const total = parseFloat(artist_percentage) + parseFloat(label_percentage)
    if (Math.abs(total - 100) > 0.01) {
      return NextResponse.json({
        error: 'Artist and label percentages must total 100%',
        details: `Current total: ${total}%`
      }, { status: 400 })
    }

    // Check if config exists
    const { data: existingConfig } = await supabaseAdminPut
      .from('revenue_split_config')
      .select('company_id')
      .eq('company_id', 'msc-co')
      .single()

    const updateData = {
      company_admin_percentage: company_percentage || super_label_percentage,
      artist_percentage: parseFloat(artist_percentage),
      label_admin_percentage: parseFloat(label_percentage),
      updated_by_user_id: session.user.id,
      updated_by_email: session.user.email,
      updated_at: new Date().toISOString()
    }

    let result
    if (existingConfig) {
      // Update existing config
      const { data, error: updateError } = await supabaseAdminPut
        .from('revenue_split_config')
        .update(updateData)
        .eq('company_id', 'msc-co')
        .select()
      
      result = { data, error: updateError }
    } else {
      // Insert new config
      const { data, error: insertError } = await supabaseAdminPut
        .from('revenue_split_config')
        .insert({
          company_id: 'msc-co',
          ...updateData
        })
        .select()
      
      result = { data, error: insertError }
    }

    if (result.error) {
      console.error('❌ Error saving config:', result.error)
      return NextResponse.json({
        error: 'Failed to update configuration',
        details: result.error.message,
        hint: result.error.hint,
        code: result.error.code
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
