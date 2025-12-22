import { NextResponse } from 'next/server'

/**
 * POST /api/user/cookie-consent
 *
 * Save user's cookie consent preferences
 * Can be called by authenticated or anonymous users
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { consent, timestamp } = body

    if (!consent) {
      return NextResponse.json(
        { error: 'Consent data required' },
        { status: 400 }
      )
    }

    // Try to get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Save to database for logged-in users
      const { error } = await supabase
        .from('user_cookie_consent')
        .upsert({
          user_id: user.id,
          necessary: consent.necessary,
          analytics: consent.analytics || false,
          functional: consent.functional || false,
          consent_date: timestamp || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Error saving cookie consent:', error)
        return NextResponse.json(
          { error: 'Failed to save consent' },
          { status: 500 }
        )
      }
    }

    // Return success even for anonymous users (they use localStorage only)
    return NextResponse.json({
      success: true,
      message: 'Cookie consent saved'
    })

  } catch (error) {
    console.error('Error in cookie consent API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/user/cookie-consent
 *
 * Retrieve user's cookie consent preferences
 */
export async function GET(request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { data: consent, error } = await supabase
      .from('user_cookie_consent')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching cookie consent:', error)
      return NextResponse.json(
        { error: 'Failed to fetch consent' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      consent: consent || null
    })

  } catch (error) {
    console.error('Error in cookie consent API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
