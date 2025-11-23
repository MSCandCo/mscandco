import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AssetLibraryClient from './AssetLibraryClient'

export const metadata = {
  title: 'Asset Library',
  description: 'Manage platform asset library - browse and manage music files, artwork, and media assets',
  keywords: 'asset library, media library, music files, artwork management, asset management',
  openGraph: {
    title: 'Asset Library | MSC & Co',
    description: 'Manage platform asset library - browse and manage music files, artwork, and media assets',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Asset Library | MSC & Co',
    description: 'Manage platform asset library - browse and manage music files, artwork, and media assets',
  },
}

export default async function AssetLibraryPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <AssetLibraryClient user={session.user} />
    </div>
  )
}