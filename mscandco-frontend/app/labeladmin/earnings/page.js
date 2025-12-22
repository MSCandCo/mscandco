import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EarningsClient from './EarningsClient'

export const metadata = {
  title: 'Label Earnings',
  description: 'Track your label earnings and revenue - view payments, royalties, and income from all label artists',
  keywords: 'label earnings, label revenue, label royalties, label income, label payments',
  openGraph: {
    title: 'Label Earnings | MSC & Co',
    description: 'Track your label earnings and revenue - view payments, royalties, and income from all label artists',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Label Earnings | MSC & Co',
    description: 'Track your label earnings and revenue - view payments, royalties, and income from all label artists',
  },
}

export default async function LabelEarningsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Layout already verified label admin access
  return <EarningsClient user={session.user} />
}