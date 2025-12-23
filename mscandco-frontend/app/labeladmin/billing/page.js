import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import BillingClient from './BillingClient'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Label Billing',
  description: 'Manage your label billing and subscription - invoices, payment methods, and plan management',
  keywords: 'label billing, label subscription, label payment, label invoices, label account management',
  openGraph: {
    title: 'Label Billing | MSC & Co',
    description: 'Manage your label billing and subscription - invoices, payment methods, and plan management',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Label Billing | MSC & Co',
    description: 'Manage your label billing and subscription - invoices, payment methods, and plan management',
  },
}

export default async function LabelAdminBillingPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Check if user has permission to access billing (uses settings:access which label admins already have)
  const hasAccess = await userHasPermission(session.user.id, 'settings:access', true)

  if (!hasAccess) {
    redirect('/dashboard')
  }

  return <BillingClient userRole="label_admin" />
}