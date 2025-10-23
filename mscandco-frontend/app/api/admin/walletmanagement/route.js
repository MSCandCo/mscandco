/**
 * API: Wallet Management - Main (App Router)
 * GET /api/admin/walletmanagement - Fetch user wallets with pagination
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
    const role = searchParams.get('role') || 'all'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const per_page = parseInt(searchParams.get('per_page') || '20')

    console.log('💼 Fetching user wallets...')

    // Build query
    let query = supabaseAdmin
      .from('user_profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        artist_name,
        display_name,
        label_name,
        role,
        wallet_balance,
        wallet_currency,
        created_at
      `, { count: 'exact' })

    // Filter by role
    if (role === 'artist') {
      query = query.eq('role', 'artist')
    } else if (role === 'label_admin') {
      query = query.eq('role', 'label_admin')
    } else {
      // All external users (artists and label admins)
      query = query.in('role', ['artist', 'label_admin'])
    }

    // Search by name or email
    if (search) {
      query = query.or(`email.ilike.%${search}%,artist_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,display_name.ilike.%${search}%,label_name.ilike.%${search}%`)
    }

    // Pagination
    const offset = (page - 1) * per_page
    query = query.range(offset, offset + per_page - 1)

    // Order by balance descending
    query = query.order('wallet_balance', { ascending: false, nullsFirst: false })

    const { data: wallets, error, count } = await query

    if (error) {
      console.error('❌ Error fetching wallets:', error)
      return NextResponse.json({
        error: 'Failed to fetch wallets',
        details: error.message
      }, { status: 500 })
    }

    // Get transaction counts for each wallet
    const walletIds = wallets.map(w => w.id)
    const { data: txCounts } = await supabaseAdmin
      .from('wallet_transactions')
      .select('user_id')
      .in('user_id', walletIds)

    // Count transactions per user
    const txCountMap = {}
    txCounts?.forEach(tx => {
      txCountMap[tx.user_id] = (txCountMap[tx.user_id] || 0) + 1
    })

    // Enrich wallet data
    const enrichedWallets = wallets.map(wallet => {
      const name = wallet.artist_name ||
                   wallet.label_name ||
                   wallet.display_name ||
                   `${wallet.first_name || ''} ${wallet.last_name || ''}`.trim() ||
                   wallet.email

      return {
        id: wallet.id,
        name,
        email: wallet.email,
        role: wallet.role,
        balance: parseFloat(wallet.wallet_balance) || 0,
        currency: wallet.wallet_currency || 'GBP',
        transaction_count: txCountMap[wallet.id] || 0,
        created_at: wallet.created_at
      }
    })

    console.log(`✅ Found ${wallets.length} wallets`)

    return NextResponse.json({
      success: true,
      wallets: enrichedWallets,
      pagination: {
        page,
        per_page,
        total: count,
        total_pages: Math.ceil(count / per_page)
      }
    })

  } catch (error) {
    console.error('❌ Error in wallets API:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
