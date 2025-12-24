/**
 * API: Wallet Management - Main (App Router)
 * GET /api/admin/walletmanagement - Fetch user wallets with pagination
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
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
