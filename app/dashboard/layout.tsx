'use client';

import { useAuth } from '@/components/AuthProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut } from 'lucide-react';

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
                <Badge variant="secondary" className="capitalize">
                  {user?.userType.toLowerCase().replace('_', ' ')}
                </Badge>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  size="sm"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
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