import TermsOfUseClient from './TermsOfUseClient'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Terms of Use',
  description: 'Read MSC & Co Terms of Use - understand our service terms, user agreements, pricing tiers, commission rates, and platform policies',
  keywords: 'terms of use, terms and conditions, user agreement, service terms, music distribution terms, platform terms',
  openGraph: {
    title: 'Terms of Use | MSC & Co',
    description: 'Read MSC & Co Terms of Use - understand our service terms, user agreements, pricing tiers, and platform policies',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Use | MSC & Co',
    description: 'Read MSC & Co Terms of Use - understand our service terms, user agreements, pricing tiers, and platform policies',
  },
}

export default function TermsOfUsePage() {
  return <TermsOfUseClient />
}
