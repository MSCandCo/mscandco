import { useAuth0 } from '@auth0/auth0-react';
import { Button } from 'flowbite-react';

export default function LoginButton({ className = '', children = 'Log In' }) {
  const { loginWithRedirect, isLoading } = useAuth0();

  return (
    <Button
      onClick={() => loginWithRedirect()}
      disabled={isLoading}
      className={`
        bg-transparent 
        text-[#1f2937] 
        border 
        border-[#1f2937] 
        rounded-xl 
        px-8 
        py-3 
        font-bold 
        shadow 
        transition-all 
        duration-300 
        hover:bg-[#1f2937] 
        hover:text-white 
        hover:shadow-lg 
        hover:-translate-y-1
        focus:outline-none
        focus:ring-2
        focus:ring-[#1f2937]
        ${className}
      `}
      style={{
        backgroundColor: 'transparent',
        color: '#1f2937',
        borderColor: '#1f2937'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#1f2937';
        e.target.style.color = 'white';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
        e.target.style.color = '#1f2937';
      }}
    >
      {isLoading ? 'Logging in...' : children}
    </Button>
  );
} 