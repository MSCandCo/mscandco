import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import BillingClient from './BillingClient'

export const metadata = {

export const dynamic = 'force-dynamic'

  title: 'Billing',
  description: 'Manage your billing and subscription - view invoices, update payment methods, and manage your plan',
  keywords: 'music distribution billing, subscription management, payment methods, invoices, music platform billing',
  openGraph: {
    title: 'Billing | MSC & Co',
    description: 'Manage your billing and subscription - view invoices, update payment methods, and manage your plan',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Billing | MSC & Co',
    description: 'Manage your billing and subscription - view invoices, update payment methods, and manage your plan',
  },
}

export default async function ArtistBillingPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Check if user has permission to access billing (uses settings:access which artists already have)
  const hasAccess = await userHasPermission(session.user.id, 'settings:access', true)

  if (!hasAccess) {
    redirect('/dashboard')
  }

  return <BillingClient userRole="artist" />
}