import { useUser } from '@/components/providers/SupabaseProvider';
import { getUserRoleSync } from '@/lib/user-utils';
import MainLayout from '@/components/layouts/mainLayout';

export default function DebugUser() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not logged in</div>;
  }

  const detectedRole = getUserRoleSync(user);

  return (
    <MainLayout>
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">User Debug Information</h1>
        
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-lg font-semibold mb-2">User Object:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-blue-100 p-4 rounded mb-4">
          <h2 className="text-lg font-semibold mb-2">Role Detection:</h2>
          <p><strong>Detected Role:</strong> {detectedRole}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User Metadata Role:</strong> {user.user_metadata?.role || 'None'}</p>
          <p><strong>App Metadata Role:</strong> {user.app_metadata?.role || 'None'}</p>
        </div>

        <div className="bg-yellow-100 p-4 rounded mb-4">
          <h2 className="text-lg font-semibold mb-2">Session Storage:</h2>
          <p><strong>Ghost Mode:</strong> {typeof window !== 'undefined' ? sessionStorage.getItem('ghost_mode') || 'false' : 'N/A'}</p>
          <p><strong>Ghost Target User:</strong> {typeof window !== 'undefined' ? sessionStorage.getItem('ghost_target_user') || 'None' : 'N/A'}</p>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Actions:</h2>
          <button 
            onClick={() => {
              sessionStorage.removeItem('ghost_mode');
              sessionStorage.removeItem('ghost_target_user');
              window.location.reload();
            }}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
          >
            Clear Ghost Mode
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
