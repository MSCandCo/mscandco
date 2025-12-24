/**
 * Admin Touring Management Page
 * Comprehensive admin backend for touring platform
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TouringAdminClient from './TouringAdminClient'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function TouringAdminPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login?redirectedFrom=/admin/touring')
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
    redirect('/unauthorized')
  }

  return <TouringAdminClient user={session.user} />
}

