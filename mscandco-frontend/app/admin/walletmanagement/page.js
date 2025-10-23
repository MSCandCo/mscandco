/**
 * Wallet Management Page - App Router (Server Component)
 * 
 * Manage platform wallets and financial transactions
 * Full UI restoration with all original functionality
 */

import { createClient } from '@/lib/supabase/server'
import { getUserPermissions } from '@/lib/permissions'
import { redirect } from 'next/navigation'
import WalletManagementClient from './WalletManagementClient'

export default async function WalletManagementPage() {
  const supabase = await createClient()

  // Get session (already authenticated by layout)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  // Get permissions
  const permissions = await getUserPermissions(session.user.id, true)
  
  // Load initial data server-side
  let initialData = null
  try {
    // Load wallets
    const { data: wallets } = await supabase
      .from('wallets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    // Load recent transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    // Calculate initial stats
    const totalBalance = wallets?.reduce((sum, wallet) => sum + (wallet.balance || 0), 0) || 0
    const totalTransactions = transactions?.length || 0
    const totalWallets = wallets?.length || 0

    initialData = {
      stats: {
        totalBalance,
        totalTransactions,
        totalWallets,
        currency: 'GBP'
      },
      wallets: wallets || [],
      transactions: transactions || []
    }
  } catch (error) {
    console.error('Error loading initial data:', error)
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        💰 Wallet Management - Full UI Restored
      </h1>
      
      <WalletManagementClient 
        initialData={initialData}
        user={session.user}
      />
    </div>
  )
}