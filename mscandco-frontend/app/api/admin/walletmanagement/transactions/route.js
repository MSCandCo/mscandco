/**
 * API: Wallet Transactions (App Router)
 * GET /api/admin/walletmanagement/transactions - Fetch wallet transactions
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

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

    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const type = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const per_page = parseInt(searchParams.get('per_page') || '50')

    console.log('💳 Fetching wallet transactions...')

    // Build query - note: wallet_transactions might not have FK, so we'll handle manually
    let query = supabaseAdmin
      .from('wallet_transactions')
      .select('*', { count: 'exact' })

    // Filter by user if specified
    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    // Filter by transaction type
    if (type !== 'all') {
      if (type === 'credit') {
        query = query.in('type', ['credit', 'topup', 'earning', 'refund'])
      } else if (type === 'debit') {
        query = query.in('type', ['debit', 'subscription_payment', 'payout', 'fee'])
      } else if (type === 'subscription') {
        query = query.eq('type', 'subscription_payment')
      } else if (type === 'topup') {
        query = query.eq('type', 'topup')
      } else if (type === 'earning') {
        query = query.eq('type', 'earning')
      }
    }

    // Pagination
    const offset = (page - 1) * per_page
    query = query.range(offset, offset + per_page - 1)

    // Order by most recent first
    query = query.order('created_at', { ascending: false })

    const { data: transactions, error, count } = await query

    if (error) {
      console.error('❌ Error fetching transactions:', error)
      return NextResponse.json({
        error: 'Failed to fetch transactions',
        details: error.message
      }, { status: 500 })
    }

    // Get user details for transactions
    const userIds = [...new Set(transactions.map(tx => tx.user_id).filter(Boolean))]
    const { data: users } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, first_name, last_name, artist_name, display_name, label_name, role')
      .in('id', userIds)

    const userMap = {}
    users?.forEach(user => {
      userMap[user.id] = user
    })

    // Enrich transaction data
    const enrichedTransactions = transactions.map(tx => {
      const user = userMap[tx.user_id]
      const userName = user?.artist_name ||
                       user?.label_name ||
                       user?.display_name ||
                       `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
                       'Unknown'

      return {
        id: tx.id,
        user_id: tx.user_id,
        user_name: userName,
        user_email: user?.email || 'Unknown',
        user_role: user?.role || 'Unknown',
        type: tx.type,
        amount: parseFloat(tx.amount) || 0,
        currency: tx.currency || 'GBP',
        description: tx.description,
        reference_id: tx.reference_id,
        reference_type: tx.reference_type,
        status: tx.status || 'completed',
        created_at: tx.created_at,
        processed_at: tx.processed_at
      }
    })

    console.log(`✅ Found ${transactions.length} transactions`)

    return NextResponse.json({
      success: true,
      transactions: enrichedTransactions,
      pagination: {
        page,
        per_page,
        total: count,
        total_pages: Math.ceil(count / per_page)
      }
    })

  } catch (error) {
    console.error('❌ Error in transactions API:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
