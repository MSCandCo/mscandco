import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { userHasPermission } from '@/lib/permissions'
import LabelAdminSustainabilityClient from './SustainabilityClient'

export const metadata = {
  title: 'Label Sustainability',
  description: 'Track and offset carbon footprint from all your artists\' music streaming',
  keywords: 'label sustainability, carbon footprint, music streaming carbon, carbon offset, label admin sustainability',
  openGraph: {
    title: 'Label Sustainability | MSC & Co',
    description: 'Track and offset carbon footprint from all your artists\' music streaming',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Label Sustainability | MSC & Co',
    description: 'Track and offset carbon footprint from all your artists\' music streaming',
  },
}

export default async function LabelAdminSustainabilityPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Check if user has permission to access sustainability
  const hasPermission = await userHasPermission(
    session.user.id,
    'sustainability:track',
    true // use service role
  )

  if (!hasPermission) {
    redirect('/dashboard')
  }

  return <LabelAdminSustainabilityClient />
}

