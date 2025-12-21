/**
 * API: Wallet Management Stats (App Router)
 * GET /api/admin/walletmanagement/stats - Fetch wallet statistics
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
async function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration is missing')
  }
  
  const { createClient } = await import('@supabase/supabase-js')
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

    console.log('📊 Fetching wallet management statistics...')

    // Get all user wallets with balances from earnings_log (single source of truth)
    const { data: allUsers, error: usersError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, wallet_balance, wallet_currency, role')
      .in('role', ['artist', 'label_admin'])

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    const userIds = allUsers.map(u => u.id)

    // Calculate balances from earnings_log
    let earningsData = []
    let earningsError = null
    
    if (userIds.length > 0) {
      const earningsResult = await supabaseAdmin
        .from('earnings_log')
        .select('artist_id, amount, status, currency, created_at')
        .in('artist_id', userIds)
        .neq('status', 'cancelled')
      
      earningsData = earningsResult.data || []
      earningsError = earningsResult.error
    }

    if (earningsError) {
      console.error('❌ Error fetching earnings:', earningsError)
      // Continue with empty earnings data - return stats with zeros
    }

    // Calculate total balance from earnings_log
    const totalBalance = (earningsData || []).reduce((sum, e) => {
      return sum + (parseFloat(e.amount) || 0)
    }, 0)

    // Get monthly transactions (last 30 days) from earnings_log
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const monthlyEarnings = (earningsData || []).filter(e => {
      if (!e.created_at) return false
      const createdAt = new Date(e.created_at)
      return createdAt >= thirtyDaysAgo
    })

    const monthlyTransactions = monthlyEarnings.length
    const monthlyVolume = monthlyEarnings.reduce((sum, e) => sum + Math.abs(parseFloat(e.amount) || 0), 0)

    // Get subscription revenue this month (from wallet_transactions if exists, otherwise 0)
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    let subscriptionRevenue = 0
    try {
      const { data: subTx, error: subTxError } = await supabaseAdmin
        .from('wallet_transactions')
        .select('amount')
        .eq('type', 'subscription_payment')
        .gte('created_at', firstDayOfMonth.toISOString())

      if (!subTxError && subTx) {
        subscriptionRevenue = subTx.reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount) || 0), 0)
      }
    } catch (err) {
      // wallet_transactions table might not exist, that's okay
      console.log('ℹ️ wallet_transactions table not available, using 0 for subscription revenue')
    }

    // Get active users (users with earnings in last 30 days)
    const uniqueActiveUsers = new Set(monthlyEarnings.map(e => e.artist_id))
    const activeUsers = uniqueActiveUsers.size

    // Count total wallets (users with any earnings or stored balance)
    const walletsWithEarnings = new Set(earningsData?.map(e => e.artist_id) || [])
    const walletsWithStoredBalance = allUsers.filter(u => parseFloat(u.wallet_balance) > 0).map(u => u.id)
    const totalWallets = new Set([...walletsWithEarnings, ...walletsWithStoredBalance]).size

    console.log('✅ Statistics calculated successfully from earnings_log')

    return NextResponse.json({
      success: true,
      stats: {
        total_balance: totalBalance,
        total_wallets: totalWallets,
        monthly_transactions: monthlyTransactions,
        monthly_volume: monthlyVolume,
        subscription_revenue: subscriptionRevenue,
        active_users: activeUsers
      }
    })

  } catch (error) {
    console.error('❌ Error in wallet stats API:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
