import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SplitConfigurationClient from './SplitConfigurationClient'

export const metadata = {

export const dynamic = 'force-dynamic'

  title: 'Split Configuration',
  description: 'Configure revenue splits and royalty distribution - manage split percentages and payment configurations',
  keywords: 'split configuration, revenue splits, royalty distribution, payment splits, split management',
  openGraph: {
    title: 'Split Configuration | MSC & Co',
    description: 'Configure revenue splits and royalty distribution - manage split percentages and payment configurations',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Split Configuration | MSC & Co',
    description: 'Configure revenue splits and royalty distribution - manage split percentages and payment configurations',
  },
}

export default async function SplitConfigurationPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <SplitConfigurationClient user={session.user} />
    </div>
  )
}