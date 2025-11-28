'use client';

import { useAuth } from '@/components/AuthProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 w-screen">
        <nav className="bg-white shadow-sm border-b w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Dashboard
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Welcome, {user?.mobileNumber}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {user?.userType.toLowerCase().replace('_', ' ')}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="w-full py-6 px-0 sm:px-4 lg:px-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}