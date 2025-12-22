/**
 * Upgrade Tier Page
 * Allows users to upgrade their subscription tier
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UpgradeClient from './UpgradeClient'

export const metadata = {
  title: 'Upgrade Your Plan',
  description: 'Upgrade to unlock more features and lower commission rates'
}

export default async function UpgradePage({ searchParams }) {
  const supabase = await createClient()

  // Get session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login?redirect=/billing/upgrade')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    redirect('/dashboard')
  }

  const { tier: targetTier, period } = await searchParams

  return (
    <UpgradeClient
      user={profile}
      targetTier={targetTier}
      billingPeriod={period || 'annual'}
    />
  )
}
