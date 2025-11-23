import LyricsAnalysisClient from './LyricsAnalysisClient'

export const metadata = {
  title: 'Lyrics Analysis AI',
  description: 'Analyze your song lyrics with AI - get insights on themes, sentiment, structure, and lyrical quality',
  keywords: 'lyrics analysis, AI lyrics analysis, song lyrics analysis, lyrics insights, music AI, lyrics quality',
  openGraph: {
    title: 'Lyrics Analysis AI | MSC & Co',
    description: 'Analyze your song lyrics with AI - get insights on themes, sentiment, structure, and lyrical quality',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Lyrics Analysis AI | MSC & Co',
    description: 'Analyze your song lyrics with AI - get insights on themes, sentiment, structure, and lyrical quality',
  },
}

export default function LyricsAnalysisPage() {
  return <LyricsAnalysisClient />
}
