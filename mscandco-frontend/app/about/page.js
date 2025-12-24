import AboutClient from './AboutClient'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'About',
  description: 'Learn about MSC & Co - the world\'s most advanced AI-native, blockchain-verified, carbon-neutral music distribution platform. Discover our mission, values, and innovative features.',
  keywords: 'about MSC & Co, music distribution platform, AI-native music platform, blockchain music distribution, carbon-neutral music, music technology, independent artists, music industry innovation',
  openGraph: {
    title: 'About | MSC & Co',
    description: 'Learn about MSC & Co - the world\'s most advanced AI-native, blockchain-verified, carbon-neutral music distribution platform.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | MSC & Co',
    description: 'Learn about MSC & Co - the world\'s most advanced AI-native, blockchain-verified, carbon-neutral music distribution platform.',
  },
}

export default function AboutPage() {
  return <AboutClient />
}
