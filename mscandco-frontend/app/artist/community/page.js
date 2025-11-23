import CommunityClient from './CommunityClient'

export const metadata = {
  title: 'Community',
  description: 'Connect with other artists, discover new music, follow creators, and build your music community network',
  keywords: 'music community, artist community, music networking, discover artists, follow artists, music social network',
  openGraph: {
    title: 'Community | MSC & Co',
    description: 'Connect with other artists, discover new music, follow creators, and build your music community network',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Community | MSC & Co',
    description: 'Connect with other artists, discover new music, follow creators, and build your music community network',
  },
}

export default function CommunityPage() {
  return <CommunityClient />
}
