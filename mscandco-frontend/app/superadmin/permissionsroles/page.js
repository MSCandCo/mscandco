/**
 * Permissions & Roles Page - App Router
 *
 * Manage user permissions and roles
 * Server-side authentication check happens in the layout
 */

import PermissionsRolesClient from './PermissionsRolesClient'

export const metadata = {
  title: 'Permissions & Roles',
  description: 'Manage user permissions and roles - configure access control and security policies',
  keywords: 'permissions, roles, access control, security, user permissions, role management',
  openGraph: {
    title: 'Permissions & Roles | MSC & Co',
    description: 'Manage user permissions and roles - configure access control and security policies',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Permissions & Roles | MSC & Co',
    description: 'Manage user permissions and roles - configure access control and security policies',
  },
}

export default function PermissionsRolesPage() {
  return <PermissionsRolesClient />
}