/**
 * Analytics Management Page - App Router (Server Component)
 * 
 * View and manage artist analytics and performance metrics
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnalyticsManagementClient from './AnalyticsManagementClient'

export default async function AnalyticsManagementPage() {
  const supabase = await createClient()
  
  // Get session (already authenticated by layout)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return <AnalyticsManagementClient user={session.user} />
}
