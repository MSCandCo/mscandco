/**
 * Earnings Management Page - App Router (Server Component)
 * 
 * Manage platform earnings and financial data
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EarningsManagementClient from './EarningsManagementClient'

export default async function EarningsManagementPage() {
  const supabase = await createClient()
  
  // Get session (already authenticated by layout)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return <EarningsManagementClient user={session.user} />
}
