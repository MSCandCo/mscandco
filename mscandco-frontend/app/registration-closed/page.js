/**
 * Registration Closed Page - App Router Version
 *
 * Shown when registration is disabled
 */

import RegistrationClosedClient from './RegistrationClosedClient'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Registration Currently Closed',
  description: 'We are not accepting new users at this time. Join our waitlist to be notified when registration opens.'
}

export default async function RegistrationClosedPage() {
  return <RegistrationClosedClient />
}

