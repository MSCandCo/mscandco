import { useAuth0 } from '@auth0/auth0-react';
import { Button } from 'flowbite-react';

export default function LoginButton({ className = '', children = 'Log In' }) {
  const { loginWithRedirect, isLoading } = useAuth0();

  return (
    <Button
      onClick={() => loginWithRedirect()}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Logging in...' : children}
    </Button>
  );
} 