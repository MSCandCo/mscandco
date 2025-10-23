/**
 * Pricing Page - App Router Version
 *
 * Shows pricing plans for different user roles
 * Public page - no authentication required
 */

import { createClient } from '@/lib/supabase/server'
import PricingClient from './PricingClient'

export const metadata = {
  title: 'Pricing | MSC & Co',
  description: 'Simple, transparent pricing for artists and labels'
}

export default async function PricingPage() {
  const supabase = await createClient()

  // Get session if exists
  const { data: { session } } = await supabase.auth.getSession()

  // Get user role if authenticated
  let userRole = null
  if (session?.user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    userRole = profile?.role || null
  }

  return <PricingClient user={session?.user} userRole={userRole} />
}
