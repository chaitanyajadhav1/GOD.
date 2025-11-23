'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Stethoscope, Users, FileText, Calendar } from 'lucide-react';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingPrescriptions: number;
  hospitalName: string;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingPrescriptions: 0,
    hospitalName: 'Hospital',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch doctor's data
      const token = localStorage.getItem('accessToken');
      const profileRes = await fetch('/api/doctor/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (profileRes.ok) {
        const data = await profileRes.json();
        // Update stats based on fetched data
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome, Doctor
        </h1>
        <p className="text-gray-600">
          Manage your patients and consultations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={<Calendar className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Pending Prescriptions"
          value={stats.pendingPrescriptions}
          icon={<FileText className="h-6 w-6" />}
          color="yellow"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard
          title="View Patients"
          description="Access patient records and medical history"
          icon={<Users className="h-6 w-6" />}
          buttonText="View Patients"
          href="/dashboard/doctor/patients"
          color="blue"
        />
        <QuickActionCard
          title="Create Prescription"
          description="Create a new prescription for a patient"
          icon={<Stethoscope className="h-6 w-6" />}
          buttonText="New Prescription"
          href="/dashboard/doctor/prescriptions/new"
          color="green"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
  };

  return (
    <div className={`p-6 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="opacity-50">
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, icon, buttonText, href, color }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  href: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
  };

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className="mr-3 opacity-70">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 mb-4">{description}</p>
          <a
            href={href}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {buttonText}
          </a>
        </div>
      </div>
    </div>
  );
}

