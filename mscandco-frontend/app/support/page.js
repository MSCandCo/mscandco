import SupportClient from './SupportClient'

export const metadata = {
  title: 'Support',
  description: 'Get help with MSC & Co - find answers to frequently asked questions, contact support, and access helpful resources for music distribution',
  keywords: 'support, help, FAQ, contact support, music distribution help, customer support, technical support',
  openGraph: {
    title: 'Support | MSC & Co',
    description: 'Get help with MSC & Co - find answers to frequently asked questions, contact support, and access helpful resources',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Support | MSC & Co',
    description: 'Get help with MSC & Co - find answers to frequently asked questions, contact support, and access helpful resources',
  },
}

export default function SupportPage() {
  return <SupportClient />
}
