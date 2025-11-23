import DevelopersClient from './DevelopersClient'

export const metadata = {
  title: 'Developers',
  description: 'Developer resources for MSC & Co - API documentation, developer tools, SDKs, and integration guides',
  keywords: 'developers, API documentation, developer tools, music API, SDK, integration, developer resources',
  openGraph: {
    title: 'Developers | MSC & Co',
    description: 'Developer resources for MSC & Co - API documentation, developer tools, SDKs, and integration guides',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Developers | MSC & Co',
    description: 'Developer resources for MSC & Co - API documentation, developer tools, SDKs, and integration guides',
  },
}

export default function DevelopersPage() {
  return <DevelopersClient />
}
