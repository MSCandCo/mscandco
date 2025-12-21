import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// GET - Retrieve user's email preferences
export async function GET(request) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('📧 Email preferences GET - User:', user?.id, 'Auth error:', authError)

    if (authError || !user) {
      console.error('❌ Email preferences - Not authenticated:', authError)
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Use service role client to bypass RLS for reliable access
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    console.log('📧 Creating service role client...', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing',
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          }
        }
      }
    )

    console.log('📧 Querying email_preferences for user:', user.id)
    const { data: preferences, error } = await supabaseAdmin
      .from('email_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('📧 Query result - Preferences:', preferences, 'Error:', error)
    if (error) {
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
    }

    if (error) {
      console.error('❌ Error fetching email preferences:', error)
      return NextResponse.json(
        { error: 'Failed to fetch preferences', details: error.message },
        { status: 500 }
      )
    }

    // If no preferences exist, create default ones
    if (!preferences) {
      console.log('📧 No preferences found, creating defaults for user:', user.id)

      const { data: newPreferences, error: createError } = await supabaseAdmin
        .from('email_preferences')
        .insert({
          user_id: user.id,
          transactional_enabled: true,
          operational_enabled: true,
          marketing_enabled: false,
          email_enabled: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      console.log('📧 Create result - Preferences:', newPreferences, 'Error:', createError)

      if (createError) {
        console.error('❌ Error creating email preferences:', createError)
        return NextResponse.json(
          { error: 'Failed to create preferences', details: createError.message },
          { status: 500 }
        )
      }

      console.log('✅ Created email preferences successfully')
      return NextResponse.json({ success: true, preferences: newPreferences })
    }

    return NextResponse.json({ success: true, preferences })

  } catch (error) {
    console.error('❌ Unexpected error in email preferences GET:', error)
    console.error('❌ Error stack:', error.stack)
    console.error('❌ Error name:', error.name)
    console.error('❌ Error message:', error.message)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// POST - Update user's email preferences
export async function POST(request) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { preferences } = body

    if (!preferences) {
      return NextResponse.json(
        { error: 'Preferences data is required' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS for reliable access
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Ensure transactional emails can never be disabled (legal requirement)
    const sanitizedPreferences = {
      ...preferences,
      user_id: user.id,
      transactional_enabled: true, // Always true
      last_modified_at: new Date().toISOString()
    }

    // Upsert preferences
    const { data: updatedPreferences, error } = await supabaseAdmin
      .from('email_preferences')
      .upsert(sanitizedPreferences, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('Error updating email preferences:', error)
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences,
      message: 'Email preferences updated successfully'
    })

  } catch (error) {
    console.error('Unexpected error in email preferences POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Unsubscribe from all non-essential emails
export async function DELETE(request) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Use service role client to bypass RLS for reliable access
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Disable all non-essential emails
    const { data: updatedPreferences, error } = await supabaseAdmin
      .from('email_preferences')
      .upsert({
        user_id: user.id,
        transactional_enabled: true, // Must remain enabled
        operational_enabled: false,
        operational_security_alerts: true, // Keep security alerts
        operational_service_updates: false,
        operational_billing_updates: false,
        release_status_updates: false,
        release_distribution_complete: false,
        release_platform_issues: false,
        revenue_monthly_reports: false,
        revenue_payment_processed: false,
        revenue_threshold_alerts: false,
        marketing_enabled: false,
        marketing_product_updates: false,
        marketing_tips_and_tricks: false,
        marketing_promotional_offers: false,
        platform_new_features: false,
        platform_maintenance_notices: false,
        platform_policy_changes: false,
        digest_enabled: false,
        email_enabled: true,
        unsubscribed_at: new Date().toISOString(),
        last_modified_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('Error unsubscribing from emails:', error)
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences,
      message: 'Successfully unsubscribed from all non-essential emails'
    })

  } catch (error) {
    console.error('Unexpected error in email preferences DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
