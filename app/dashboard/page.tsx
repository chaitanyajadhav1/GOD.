'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SuperAdminDashboard from './super-admin/page';
import HospitalAdminDashboard from './hospital-admin/page';
import DoctorDashboard from './doctor/page';
import PatientDashboard from './patient/page';

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user type
  const userType = user?.userType || '';

  if (userType === 'SUPER_ADMIN') {
    return <SuperAdminDashboard />;
  }

  if (userType === 'HOSPITAL_ADMIN') {
    return <HospitalAdminDashboard />;
  }

  if (userType === 'DOCTOR') {
    return <DoctorDashboard />;
  }

  // Default to patient dashboard
  return <PatientDashboard />;
}