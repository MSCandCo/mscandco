import { useAuth0 } from '@auth0/auth0-react';
import { Button } from 'flowbite-react';

export default function LogoutButton({ className = '', children = 'Log Out' }) {
  const { logout, isLoading } = useAuth0();

  return (
    <Button
      onClick={() => logout({ 
        logoutParams: { 
          returnTo: window.location.origin 
        } 
      })}
      disabled={isLoading}
      className={`bg-red-500 hover:bg-red-600 ${className}`}
    >
      {isLoading ? 'Logging out...' : children}
    </Button>
  );
} 