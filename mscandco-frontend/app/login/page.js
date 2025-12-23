import LoginClient from './LoginClient'

export const metadata = {
  title: 'Login',
  description: 'Login to your MSC & Co account - access your music distribution dashboard, manage releases, and track your earnings',
  keywords: 'login, sign in, account login, music distribution login, artist login, MSC & Co login',
  openGraph: {
    title: 'Login | MSC & Co',
    description: 'Login to your MSC & Co account - access your music distribution dashboard and manage your releases',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Login | MSC & Co',
    description: 'Login to your MSC & Co account - access your music distribution dashboard and manage your releases',
  },
}

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return <LoginClient />
}

