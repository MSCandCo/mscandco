import { Auth0Provider } from '@auth0/auth0-react';
import { auth0Config } from '@/lib/auth0-config';

export default function Auth0ProviderWrapper({ children }) {
  return (
    <Auth0Provider {...auth0Config}>
      {children}
    </Auth0Provider>
  );
} 