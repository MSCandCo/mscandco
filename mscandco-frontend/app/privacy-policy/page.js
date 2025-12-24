import PrivacyPolicyClient from './PrivacyPolicyClient'


export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Privacy Policy',
  description: 'Read MSC & Co Privacy Policy - learn how we collect, use, and protect your personal information, data security, and privacy rights',
  keywords: 'privacy policy, data protection, privacy rights, GDPR, data security, personal information, privacy statement',
  openGraph: {
    title: 'Privacy Policy | MSC & Co',
    description: 'Read MSC & Co Privacy Policy - learn how we collect, use, and protect your personal information and data',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | MSC & Co',
    description: 'Read MSC & Co Privacy Policy - learn how we collect, use, and protect your personal information and data',
  },
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />
}
