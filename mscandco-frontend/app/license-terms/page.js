import LicenseTermsClient from './LicenseTermsClient'

export const metadata = {
  title: 'License Terms',
  description: 'MSC & Co Music License Terms - understand licensing agreements, permitted uses, restrictions, and attribution requirements',
  keywords: 'license terms, music licensing, licensing agreement, music license, usage rights, copyright licensing',
  openGraph: {
    title: 'License Terms | MSC & Co',
    description: 'MSC & Co Music License Terms - understand licensing agreements, permitted uses, and restrictions',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'License Terms | MSC & Co',
    description: 'MSC & Co Music License Terms - understand licensing agreements, permitted uses, and restrictions',
  },
}

export default function LicenseTermsPage() {
  return <LicenseTermsClient />
}
