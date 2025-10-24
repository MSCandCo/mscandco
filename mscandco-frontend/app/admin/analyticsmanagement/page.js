/**
 * Analytics Management Page - App Router (Server Component)
 * 
 * View and manage artist analytics and performance metrics
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import AnalyticsManagementClient from './AnalyticsManagementClient'

export default async function AnalyticsManagementPage() {
  const supabase = await createClient()
  
  // Get session (already authenticated by layout)
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  // Check if user has permission to manage analytics
  const hasPermission = await userHasPermission(
    session.user.id,
    'analytics:analytics_management:read',
    true // use service role
  )
  
  if (!hasPermission) {
    console.error('❌ User does not have analytics management permission:', session.user.email)
    redirect('/dashboard')
  }
  
  return <AnalyticsManagementClient user={session.user} />
}
