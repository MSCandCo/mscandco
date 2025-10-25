import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/wallet/transactions
 * Get user's wallet transaction history
 */
export async function GET(request) {
  try {
    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get user's transaction history from wallet_transactions table
    const { data: transactions, error, count } = await supabase
      .from('wallet_transactions')
      .select('id, transaction_type, amount, description, processed, created_at, metadata, notes', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        })
      }
      throw error
    }

    // Format transactions for frontend
    const formattedTransactions = (transactions || []).map(transaction => {
      const createdAt = new Date(transaction.created_at)
      
      // Format date as YYYY-MM-DD
      const dateOnly = createdAt.toISOString().split('T')[0]
      
      // Format time as HH:MM with timezone
      const timeOnly = createdAt.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
      
      return {
        id: transaction.id,
        type: transaction.transaction_type,
        amount: transaction.amount,
        description: transaction.description || transaction.notes || 'Transaction',
        date: dateOnly,
        time: timeOnly,
        fullDate: transaction.created_at,
        status: transaction.processed ? 'completed' : 'pending',
        metadata: transaction.metadata
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Transaction history error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    }, { status: 500 })
  }
}

