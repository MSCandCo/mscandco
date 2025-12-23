/**
 * Earnings Management Page - App Router (Server Component)
 *
 * Manage platform earnings and financial data
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EarningsManagementClient from './EarningsManagementClient'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Earnings Management',
  description: 'Manage platform earnings and financial data - track revenue, payments, and financial transactions',
  keywords: 'earnings management, financial management, revenue tracking, payment management, platform earnings',
  openGraph: {
    title: 'Earnings Management | MSC & Co',
    description: 'Manage platform earnings and financial data - track revenue, payments, and financial transactions',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Earnings Management | MSC & Co',
    description: 'Manage platform earnings and financial data - track revenue, payments, and financial transactions',
  },
}

export default async function EarningsManagementPage() {
  const supabase = await createClient()

  // Get session (already authenticated by layout)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return <EarningsManagementClient user={session.user} />
}