'use client';

import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = [] 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (!isLoading && isAuthenticated && requiredRole.length > 0) {
      if (!requiredRole.includes(user!.userType)) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole.length > 0 && !requiredRole.includes(user!.userType)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}