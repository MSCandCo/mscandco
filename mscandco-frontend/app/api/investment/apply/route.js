import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// POST - Submit investment application

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, phone, company, investmentAmount, message } = body

    // Validate required fields
    if (!name || !email || !investmentAmount || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, investmentAmount, message' },
        { status: 400 }
      )
    }

    // Use service role client for database operations
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get user's IP address
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Insert investment application
    const { data: application, error } = await serviceSupabase
      .from('investment_applications')
      .insert({
        user_id: user.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        investment_amount: investmentAmount,
        message: message.trim(),
        status: 'pending',
        submitted_ip: ip,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating investment application:', error)
      return NextResponse.json(
        { error: 'Failed to submit application', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        submitted_at: application.created_at
      },
      message: 'Investment application submitted successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error in investment application POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Get user's investment applications (optional, for viewing status)
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use service role client for database operations
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: applications, error } = await serviceSupabase
      .from('investment_applications')
      .select('id, investment_amount, status, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching investment applications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      applications: applications || []
    })

  } catch (error) {
    console.error('Unexpected error in investment application GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

