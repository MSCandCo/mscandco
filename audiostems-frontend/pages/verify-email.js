import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import EmailVerificationStep from '@/components/auth/EmailVerificationStep';

export default function VerifyEmailPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        setEmail(user.email);
      } else {
        // If not logged in, redirect to login
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  const handleVerificationComplete = (nextStep) => {
    // Redirect to next step in registration flow
    if (nextStep === 'backup_codes_setup') {
      router.push('/setup-backup-codes');
    } else {
      router.push('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <EmailVerificationStep 
      email={email}
      onVerificationComplete={handleVerificationComplete}
    />
  );
}
