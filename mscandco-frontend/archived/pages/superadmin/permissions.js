import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SuperAdminPermissionsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/permissions');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to admin panel...</p>
      </div>
    </div>
  );
}