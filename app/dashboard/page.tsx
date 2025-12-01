'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
      return;
    }

    // Redirect to specific dashboard route instead of rendering component
    if (!isLoading && user) {
      const userType = user.userType || '';
      
      switch (userType) {
        case 'SUPER_ADMIN':
          router.replace('/dashboard/super-admin');
          break;
        case 'HOSPITAL_ADMIN':
          router.replace('/dashboard/hospital-admin');
          break;
        case 'DOCTOR':
          router.replace('/dashboard/doctor');
          break;
        default:
          router.replace('/dashboard/patient');
      }
    }
  }, [user, isLoading, router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );
}