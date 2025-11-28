'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { Building2, Users, Mail, UserPlus } from 'lucide-react';

interface DashboardStats {
  totalDoctors: number;
  pendingInvitations: number;
  totalPatients: number;
  hospitalName: string;
}

export default function HospitalAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDoctors: 0,
    pendingInvitations: 0,
    totalPatients: 0,
    hospitalName: 'Your Hospital',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const hospitalRes = await fetch('/api/hospital-admin/hospital', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (hospitalRes.ok) {
        const data = await hospitalRes.json();
        if (data.data) {
          setStats(prev => ({ ...prev, hospitalName: data.data.name }));
        }
      }

      // Fetch invitations
      const invitationsRes = await fetch('/api/hospital-admin/invitations', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (invitationsRes.ok) {
        const invitationsData = await invitationsRes.json();
        const pending = invitationsData.data?.filter((inv: any) => inv.status === 'PENDING').length || 0;
        setStats(prev => ({ ...prev, pendingInvitations: pending }));
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
          Welcome, Hospital Admin
        </h1>
        <p className="text-gray-600">
          Manage your hospital: {stats.hospitalName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Doctors"
          value={stats.totalDoctors}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Pending Invitations"
          value={stats.pendingInvitations}
          icon={<Mail className="h-6 w-6" />}
          color="yellow"
          href="/dashboard/hospital-admin/invitations"
        />
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={<Users className="h-6 w-6" />}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard
          title="Invite Doctor"
          description="Send invitation to a new doctor"
          icon={<UserPlus className="h-6 w-6" />}
          buttonText="Send Invitation"
          href="/dashboard/hospital-admin/invitations?create=new"
          color="blue"
        />
        <QuickActionCard
          title="Manage Hospital"
          description="View and edit hospital details"
          icon={<Building2 className="h-6 w-6" />}
          buttonText="View Hospital"
          href="/dashboard/hospital-admin/hospital"
          color="green"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, href }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  href?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
  };

  const content = (
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

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
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
          <Link
            href={href}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}

