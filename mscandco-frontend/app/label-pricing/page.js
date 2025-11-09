/**
 * Label Pricing Page - App Router Version
 *
 * Shows 4-tier label pricing: Starter, Pro, Partner, Enterprise
 * Public page - no authentication required
 */

import { createClient } from '@/lib/supabase/server'
import LabelPricingClient from './LabelPricingClient'

export const metadata = {
  title: 'Label Pricing | MSC & Co',
  description: 'Progressive label pricing that rewards growth. Lower commission rates as you scale. 25% → 18% → 12% → 5%'
}

export default async function LabelPricingPage() {
  try {
    const supabase = await createClient()

    // Get session if exists
    const { data: { session } } = await supabase.auth.getSession()

    // Get label tier and stats if authenticated
    let user = null
    if (session?.user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, role, label_tier, label_artist_count, label_releases_this_year, label_tracks_this_year, label_apollo_queries_this_month, label_total_earnings, label_qualified_for_partner')
        .eq('id', session.user.id)
        .single()

      if (profile && profile.role === 'label_admin') {
        user = {
          id: profile.id,
          tier: profile.label_tier || 'label_starter',
          artist_count: profile.label_artist_count,
          releases_this_year: profile.label_releases_this_year,
          tracks_this_year: profile.label_tracks_this_year,
          apollo_queries_this_month: profile.label_apollo_queries_this_month,
          total_earnings: profile.label_total_earnings,
          qualified_for_partner: profile.label_qualified_for_partner
        }
      }
    }

    return <LabelPricingClient user={user} />
  } catch (error) {
    console.error('Label pricing page error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading label pricing page</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }
}
