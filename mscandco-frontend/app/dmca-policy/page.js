import DMCAPolicyClient from './DMCAPolicyClient'

export const metadata = {
  title: 'DMCA Policy',
  description: 'MSC & Co DMCA Copyright Policy - learn how to file copyright infringement notices and protect your intellectual property',
  keywords: 'DMCA policy, copyright policy, copyright protection, DMCA takedown, intellectual property, copyright infringement',
  openGraph: {
    title: 'DMCA Policy | MSC & Co',
    description: 'MSC & Co DMCA Copyright Policy - learn how to file copyright infringement notices and protect your intellectual property',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'DMCA Policy | MSC & Co',
    description: 'MSC & Co DMCA Copyright Policy - learn how to file copyright infringement notices and protect your intellectual property',
  },
}

export default function DMCAPolicyPage() {
  return <DMCAPolicyClient />
}
