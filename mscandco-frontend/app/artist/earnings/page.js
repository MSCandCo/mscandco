import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import EarningsClient from './EarningsClient'

export const metadata = {
  title: 'Earnings',
  description: 'View your music earnings and revenue - track payments, royalties, and income from streaming platforms',
  keywords: 'music earnings, music revenue, royalties, streaming revenue, music income, artist payments',
  openGraph: {
    title: 'Earnings | MSC & Co',
    description: 'View your music earnings and revenue - track payments, royalties, and income from streaming platforms',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Earnings | MSC & Co',
    description: 'View your music earnings and revenue - track payments, royalties, and income from streaming platforms',
  },
}

export default async function ArtistEarningsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Check permission
  const hasPermission = await userHasPermission(session.user.id, 'earnings:access', true)
  if (!hasPermission) {
    redirect('/unauthorized')
  }

  return <EarningsClient user={session.user} />
}