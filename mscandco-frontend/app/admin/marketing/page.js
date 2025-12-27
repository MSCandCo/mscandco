/**
 * Marketing Email Campaigns Page - App Router (Server Component)
 *
 * Manage marketing email campaigns with intelligent user filtering
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MarketingClient from './MarketingClient'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Marketing Campaigns',
  description: 'Create and manage marketing email campaigns with intelligent user filtering',
}

export default async function MarketingPage() {
  const supabase = await createClient()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session?.user) {
    redirect('/login')
  }

  // Check admin permissions
  const { createServiceRoleClient } = await import('@/lib/supabase/server')
  const supabaseAdmin = await createServiceRoleClient()
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || !['super_admin', 'company_admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return <MarketingClient />
}

