import OpenDataClient from './OpenDataClient'

export const metadata = {
  title: 'Open Data',
  description: 'Access open data API, view usage statistics, manage API keys, and explore public music data insights',
  keywords: 'open data, API access, music data API, open data platform, music analytics API, data export',
  openGraph: {
    title: 'Open Data | MSC & Co',
    description: 'Access open data API, view usage statistics, manage API keys, and explore public music data insights',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Open Data | MSC & Co',
    description: 'Access open data API, view usage statistics, manage API keys, and explore public music data insights',
  },
}

export default function OpenDataPage() {
  return <OpenDataClient />
}
