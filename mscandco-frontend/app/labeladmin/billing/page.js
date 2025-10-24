import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import BillingClient from './BillingClient'

export default async function LabelAdminBillingPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  // Check if user has permission to access billing (uses settings:access which label admins already have)
  const hasAccess = await userHasPermission(session.user.id, 'settings:access', true)
  
  console.log('🔐 Label Admin Billing Page - Permission Check:', {
    userId: session.user.id,
    email: session.user.email,
    hasAccess,
    requiredPermission: 'settings:access'
  })

  if (!hasAccess) {
    console.log('❌ Access denied - redirecting to dashboard')
    redirect('/dashboard')
  }

  console.log('✅ Access granted - rendering BillingClient for label admin')
  
  return <BillingClient userRole="label_admin" />
}

