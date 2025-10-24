import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * GET /api/user/currency-preference
 * Get user's currency preference
 */
export async function GET(request) {
  try {
    const supabase = await createClient()
    
    // Get the user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role to bypass RLS
    const serviceSupabase = await createServiceRoleClient()
    
    // Get user's currency preference
    const { data, error } = await serviceSupabase
      .from('user_profiles')
      .select('preferred_currency')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching currency preference:', error)
      return NextResponse.json(
        { error: 'Failed to fetch currency preference' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      currency: data?.preferred_currency || 'GBP' 
    })
  } catch (error) {
    console.error('Currency preference GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/currency-preference
 * Save user's currency preference
 */
export async function POST(request) {
  try {
    const supabase = await createClient()
    
    // Get the user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { currency } = body

    if (!currency) {
      return NextResponse.json(
        { error: 'Currency is required' },
        { status: 400 }
      )
    }

    // Validate currency code
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'NGN', 'GHS', 'KES', 'ZAR', 'ZMW']
    if (!validCurrencies.includes(currency)) {
      return NextResponse.json(
        { error: 'Invalid currency code' },
        { status: 400 }
      )
    }

    // Use service role to bypass RLS
    const serviceSupabase = await createServiceRoleClient()

    const { error } = await serviceSupabase
      .from('user_profiles')
      .update({ preferred_currency: currency })
      .eq('id', user.id)

    if (error) {
      console.error('Error saving currency preference:', error)
      return NextResponse.json(
        { error: 'Failed to save currency preference' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      currency 
    })
  } catch (error) {
    console.error('Currency preference POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

