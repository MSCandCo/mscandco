import AccessibilityClient from './AccessibilityClient'

export const metadata = {
  title: 'Accessibility',
  description: 'Manage accessibility features for your music releases - generate accessible content, track compliance, and ensure your music reaches all audiences',
  keywords: 'music accessibility, accessible music, accessibility compliance, music for all, inclusive music distribution',
  openGraph: {
    title: 'Accessibility | MSC & Co',
    description: 'Manage accessibility features for your music releases - generate accessible content and track compliance',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Accessibility | MSC & Co',
    description: 'Manage accessibility features for your music releases - generate accessible content and track compliance',
  },
}

export default function AccessibilityPage() {
  return <AccessibilityClient />
}
