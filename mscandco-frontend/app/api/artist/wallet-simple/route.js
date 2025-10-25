import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/artist/wallet-simple
 * Fetch artist earnings from earnings_log table (single source of truth)
 */
export async function GET(request) {
  try {
    // Authenticate user
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const artistId = user.id
    console.log('💰 Fetching wallet data for artist:', artistId)

    // Fetch all earnings from earnings_log (single source of truth)
    const { data: earnings, error } = await supabase
      .from('earnings_log')
      .select('*')
      .eq('artist_id', artistId)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching earnings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch earnings', details: error.message },
        { status: 500 }
      )
    }

    // Calculate balance from earnings_log
    const totalBalance = earnings.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0)
    
    // Separate positive (credits) and negative (debits) transactions
    const credits = earnings.filter(e => parseFloat(e.amount) > 0)
    const debits = earnings.filter(e => parseFloat(e.amount) < 0)
    
    const totalEarned = credits.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0)
    const totalSpent = Math.abs(debits.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0))

    // Group earnings by type
    const earningsByType = {}
    credits.forEach(earning => {
      const type = earning.earning_type || 'other'
      if (!earningsByType[type]) {
        earningsByType[type] = {
          type,
          total: 0,
          count: 0,
          entries: []
        }
      }
      earningsByType[type].total += parseFloat(earning.amount || 0)
      earningsByType[type].count += 1
      earningsByType[type].entries.push(earning)
    })

    // Group earnings by platform
    const earningsByPlatform = {}
    credits.forEach(earning => {
      const platform = earning.platform || 'Unknown'
      if (!earningsByPlatform[platform]) {
        earningsByPlatform[platform] = {
          platform,
          total: 0,
          count: 0,
          entries: []
        }
      }
      earningsByPlatform[platform].total += parseFloat(earning.amount || 0)
      earningsByPlatform[platform].count += 1
      earningsByPlatform[platform].entries.push(earning)
    })

    // Group earnings by status
    const earningsByStatus = {}
    earnings.forEach(earning => {
      const status = earning.status || 'pending'
      if (!earningsByStatus[status]) {
        earningsByStatus[status] = {
          status,
          total: 0,
          count: 0,
          entries: []
        }
      }
      earningsByStatus[status].total += parseFloat(earning.amount || 0)
      earningsByStatus[status].count += 1
      earningsByStatus[status].entries.push(earning)
    })

    // Calculate pending vs paid
    const paidEarnings = earnings.filter(e => e.status === 'paid')
    const pendingEarnings = earnings.filter(e => e.status === 'pending')
    
    const totalPaid = paidEarnings.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0)
    const totalPending = pendingEarnings.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0)

    console.log(`✅ Wallet data loaded: Balance ${totalBalance.toFixed(2)}, Earned ${totalEarned.toFixed(2)}, Spent ${totalSpent.toFixed(2)}`)

    return NextResponse.json({
      success: true,
      // Main wallet properties (matching client expectations)
      available_balance: totalPaid, // Only paid earnings are available for withdrawal
      pending_balance: totalPending, // Pending earnings
      total_earned: totalEarned,
      total_withdrawn: totalSpent,
      minimum_payout: 50, // Minimum payout threshold
      last_updated: new Date().toISOString(),
      currency: 'GBP',
      
      // Legacy properties for backward compatibility
      balance: totalBalance,
      totalEarned,
      totalSpent,
      totalPaid,
      totalPending,
      
      // Summary data
      summary: {
        totalBalance,
        totalEarned,
        totalSpent,
        totalPaid,
        totalPending,
        transactionCount: earnings.length,
        creditCount: credits.length,
        debitCount: debits.length
      },
      
      // Breakdowns
      breakdowns: {
        byType: Object.values(earningsByType),
        byPlatform: Object.values(earningsByPlatform),
        byStatus: Object.values(earningsByStatus)
      },
      
      // Recent transactions
      recent_history: earnings.slice(0, 20).map(earning => ({
        id: earning.id,
        amount: parseFloat(earning.amount || 0),
        earning_type: earning.earning_type || 'other',
        platform: earning.platform || 'Unknown',
        status: earning.status || 'pending',
        payment_date: earning.payment_date || earning.created_at,
        description: earning.notes || `${earning.earning_type || 'Earning'} from ${earning.platform || 'Platform'}`,
        currency: earning.currency || 'GBP',
        created_at: earning.created_at
      })),
      
      // Pending entries
      pending_entries: pendingEarnings.map(earning => ({
        id: earning.id,
        amount: parseFloat(earning.amount || 0),
        earning_type: earning.earning_type || 'other',
        platform: earning.platform || 'Unknown',
        status: 'pending',
        payment_date: earning.payment_date || earning.created_at,
        description: earning.notes || `${earning.earning_type || 'Earning'} from ${earning.platform || 'Platform'}`,
        currency: earning.currency || 'GBP',
        created_at: earning.created_at
      }))
    })

  } catch (error) {
    console.error('❌ Wallet API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

