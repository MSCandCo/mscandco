/**
 * Pricing Page - App Router Version
 *
 * Shows 4-tier pricing: MSC Free, MSC Pro, MPP Partner, Investment Partner
 * Public page - no authentication required
 */

import { createClient } from '@/lib/supabase/server'
import NewPricingClient from './NewPricingClient'

export const metadata = {
  title: 'Pricing | MSC & Co',
  description: 'Simple, fair pricing. Start free. Lower rates as you grow. 20% → 15% → 10% → 2.5%'
}

export default async function PricingPage() {
  try {
    const supabase = await createClient()

    // Get session if exists
    const { data: { session } } = await supabase.auth.getSession()

    // Get user tier and stats if authenticated
    let user = null
    if (session?.user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, tier, commission_rate, total_earnings_this_year, total_streams_all_time, total_releases_all_time, total_commissions_paid')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        user = {
          id: profile.id,
          tier: profile.tier || 'free',
          commission_rate: profile.commission_rate,
          total_earnings_this_year: profile.total_earnings_this_year,
          total_streams_all_time: profile.total_streams_all_time,
          total_releases_all_time: profile.total_releases_all_time,
          total_commissions_paid: profile.total_commissions_paid
        }
      }
    }

    return <NewPricingClient user={user} />
  } catch (error) {
    console.error('Pricing page error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading pricing page</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }
}
