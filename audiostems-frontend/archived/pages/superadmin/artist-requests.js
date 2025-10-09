// Super Admin Artist Requests - Same as Company Admin but with Super Admin branding
import CompanyAdminArtistRequests from '../companyadmin/artist-requests';

export default function SuperAdminArtistRequests() {
  // Super Admin uses the same component as Company Admin
  // The API will handle role verification (both company_admin and super_admin are allowed)
  return <CompanyAdminArtistRequests />;
}
