import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration is missing')
  }
  
  return createClient(supabaseUrl, serviceRoleKey)
}

/**
 * POST /api/admin/earnings/add-simple
 * Add a new earnings entry to earnings_log table
 */
export async function POST(request) {
  try {
    // Authenticate user
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const supabaseAdmin = getSupabaseAdmin()
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError)
      return NextResponse.json(
        { 
          error: 'Failed to verify user permissions',
          message: profileError.message || 'Could not verify admin access'
        },
        { status: 500 }
      )
    }

    if (!profile || !['super_admin', 'company_admin', 'label_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      artist_id,
      earning_type,
      amount,
      currency = 'GBP',
      platform,
      territory,
      status = 'pending',
      payment_date,
      period_start,
      period_end,
      notes
    } = body

    // Validate UUID format for artist_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (artist_id && !uuidRegex.test(artist_id)) {
      return NextResponse.json(
        { 
          error: 'Invalid artist_id format',
          message: 'artist_id must be a valid UUID'
        },
        { status: 400 }
      )
    }

    // Convert empty strings to null for date fields
    const normalizeDate = (date) => {
      if (!date || date === '' || date === 'null' || date === 'undefined') {
        return null
      }
      // Validate date format (YYYY-MM-DD)
      if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return date
      }
      return null
    }

    // Validation
    if (!artist_id || !earning_type || !amount || !platform) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          message: 'artist_id, earning_type, amount, and platform are required'
        },
        { status: 400 }
      )
    }

    // Validate amount is a positive number
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { 
          error: 'Invalid amount',
          message: 'Amount must be a positive number'
        },
        { status: 400 }
      )
    }

    // Validate status value (database might have constraints)
    const validStatuses = ['pending', 'paid', 'held', 'processing', 'disputed']
    const normalizedStatus = validStatuses.includes(status) ? status : 'pending'

    // Build insert object - don't set created_at, let database handle it
    const insertData = {
      artist_id,
      earning_type,
      amount: amountNum,
      currency: currency || 'GBP',
      platform: (platform || '').trim(),
      status: normalizedStatus,
      created_by: session.user.id // Admin who created the entry
    }

    // Add optional fields only if they have values
    if (territory && territory.trim() !== '') {
      insertData.territory = territory.trim()
    }
    
    const normalizedPaymentDate = normalizeDate(payment_date)
    if (normalizedPaymentDate) {
      insertData.payment_date = normalizedPaymentDate
    }
    
    const normalizedPeriodStart = normalizeDate(period_start)
    if (normalizedPeriodStart) {
      insertData.period_start = normalizedPeriodStart
    }
    
    const normalizedPeriodEnd = normalizeDate(period_end)
    if (normalizedPeriodEnd) {
      insertData.period_end = normalizedPeriodEnd
    }
    
    if (notes && notes.trim() !== '') {
      insertData.notes = notes.trim()
    }

    console.log(`💰 Adding earnings entry: ${currency}${amountNum} ${earning_type} from ${platform} for artist ${artist_id}`)
    console.log('📋 Final insert data:', JSON.stringify(insertData, null, 2))

    // Insert earnings entry into earnings_log table
    const { data: earningsEntry, error: earningsError } = await supabaseAdmin
      .from('earnings_log')
      .insert(insertData)
      .select()
      .single()

    if (earningsError) {
      console.error('❌ Error inserting earnings entry:', {
        error: earningsError,
        message: earningsError.message,
        details: earningsError.details,
        hint: earningsError.hint,
        code: earningsError.code,
        insertData: insertData
      })
      
      // Provide more helpful error messages
      let errorMessage = earningsError.message || 'Failed to add earnings entry'
      if (earningsError.code === '23503') {
        errorMessage = 'Invalid artist_id: Artist not found in database'
      } else if (earningsError.code === '23514') {
        errorMessage = 'Invalid data: Check status, amount, or other field constraints'
      } else if (earningsError.code === '23505') {
        errorMessage = 'Duplicate entry: This earnings entry already exists'
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to add earnings entry',
          message: errorMessage,
          details: earningsError.details,
          hint: earningsError.hint,
          code: earningsError.code
        },
        { status: 500 }
      )
    }

    console.log('✅ Earnings entry added successfully:', earningsEntry.id)

    return NextResponse.json({
      success: true,
      message: 'Earnings entry added successfully',
      data: earningsEntry
    })

  } catch (error) {
    console.error('❌ Add earnings error:', {
      error: error,
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          message: 'Failed to parse request body. Please check the data format.'
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
        type: error.name
      },
      { status: 500 }
    )
  }
}

