/**
 * API: Wallet Management - Main (App Router)
 * GET /api/admin/walletmanagement - Fetch user wallets with pagination
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration is missing')
  }
  
  const { createClient } = require('@supabase/supabase-js')
  return createClient(supabaseUrl, serviceRoleKey)
}
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

    // Order by created_at descending (we'll sort by balance after calculating from earnings_log)
    query = query.order('created_at', { ascending: false })

    // Pagination
    const offset = (page - 1) * per_page
    query = query.range(offset, offset + per_page - 1)

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
    
    // Calculate balances from earnings_log (single source of truth)
    let earningsData = []
    let earningsError = null
    
    if (walletIds.length > 0) {
      const earningsResult = await supabaseAdmin
        .from('earnings_log')
        .select('artist_id, amount, status, currency')
        .in('artist_id', walletIds)
        .neq('status', 'cancelled')
      
      earningsData = earningsResult.data || []
      earningsError = earningsResult.error
    }

    if (earningsError) {
      console.error('❌ Error fetching earnings:', earningsError)
    }

    // Calculate balance per user from earnings_log
    const balanceMap = {}
    earningsData?.forEach(earning => {
      const userId = earning.artist_id
      if (!balanceMap[userId]) {
        balanceMap[userId] = {
          total: 0,
          paid: 0,
          pending: 0,
          currency: earning.currency || 'GBP'
        }
      }
      const amount = parseFloat(earning.amount) || 0
      balanceMap[userId].total += amount
      if (earning.status === 'paid') {
        balanceMap[userId].paid += amount
      } else if (earning.status === 'pending') {
        balanceMap[userId].pending += amount
      }
    })

    // Get transaction counts from wallet_transactions (if table exists)
    let txCounts = null
    try {
      const { data } = await supabaseAdmin
        .from('wallet_transactions')
        .select('user_id')
        .in('user_id', walletIds)
      txCounts = data
    } catch (err) {
      // wallet_transactions table might not exist, that's okay
      console.log('ℹ️ wallet_transactions table not available, using earnings_log for transaction counts')
    }

    // Count transactions per user
    const txCountMap = {}
    txCounts?.forEach(tx => {
      txCountMap[tx.user_id] = (txCountMap[tx.user_id] || 0) + 1
    })

    // Enrich wallet data with calculated balances from earnings_log
    const enrichedWallets = wallets.map(wallet => {
      const name = wallet.artist_name ||
                   wallet.label_name ||
                   wallet.display_name ||
                   `${wallet.first_name || ''} ${wallet.last_name || ''}`.trim() ||
                   wallet.email

      // Use calculated balance from earnings_log, fallback to wallet_balance if no earnings
      const calculatedBalance = balanceMap[wallet.id]?.total || 0
      const storedBalance = parseFloat(wallet.wallet_balance) || 0
      // Use the maximum of both to ensure no money is lost during migration
      const finalBalance = Math.max(calculatedBalance, storedBalance)

      return {
        id: wallet.id,
        name,
        email: wallet.email,
        role: wallet.role,
        balance: finalBalance,
        paid_balance: balanceMap[wallet.id]?.paid || 0,
        pending_balance: balanceMap[wallet.id]?.pending || 0,
        currency: balanceMap[wallet.id]?.currency || wallet.wallet_currency || 'GBP',
        transaction_count: txCountMap[wallet.id] || (earningsData?.filter(e => e.artist_id === wallet.id).length || 0),
        created_at: wallet.created_at
      }
    })

    // Re-sort by calculated balance
    enrichedWallets.sort((a, b) => b.balance - a.balance)

    console.log(`✅ Found ${wallets.length} wallets with balances calculated from earnings_log`)

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
