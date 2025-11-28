// app/dashboard/super-admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authenticatedFetch } from '@/lib/api-client';

interface DashboardStats {
  totalHospitals: number;
  activeHospitals: number;
  pendingInvitations: number;
  totalUsers: number;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalHospitals: 0,
    activeHospitals: 0,
    pendingInvitations: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch hospitals
      const hospitalsRes = await authenticatedFetch('/api/super-admin/hospitals');

      // Fetch invitations
      const invitationsRes = await authenticatedFetch('/api/super-admin/invitations');

      let totalHospitals = 0;
      let activeHospitals = 0;
      let pendingInvitations = 0;

      if (hospitalsRes.ok) {
        const hospitalsData = await hospitalsRes.json();
        const hospitals = hospitalsData.data || [];
        totalHospitals = hospitals.length;
        activeHospitals = hospitals.filter((h: any) => h.status === 'ACTIVE').length;
      }

      if (invitationsRes.ok) {
        const invitationsData = await invitationsRes.json();
        const invitations = invitationsData.data || [];
        pendingInvitations = invitations.filter((inv: any) => inv.status === 'PENDING').length;
      }

      setStats({
        totalHospitals,
        activeHospitals,
        pendingInvitations,
        totalUsers: 0, // TODO: Add API endpoint for total users count
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
          Welcome, Super Admin
        </h1>
        <p className="text-gray-600">
          Manage hospitals, users, and invitations from this dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Hospitals"
          value={stats.totalHospitals}
          icon="🏥"
          color="blue"
          href="/dashboard/super-admin/hospitals"
        />
        <StatCard
          title="Active Hospitals"
          value={stats.activeHospitals}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Pending Invitations"
          value={stats.pendingInvitations}
          icon="📧"
          color="yellow"
          href="/dashboard/super-admin/invitations"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard
          title="Create New Hospital"
          description="Add a new hospital to the platform"
          icon="🏥"
          buttonText="Create Hospital"
          href="/dashboard/super-admin/hospitals?create=new"
          color="blue"
        />
        <QuickActionCard
          title="Send Invitations"
          description="Invite doctors and staff to hospitals"
          icon="📧"
          buttonText="Send Invite"
          href="/dashboard/super-admin/invitations?create=new"
          color="green"
        />
      </div>

      {/* Recent Activity - Fetch from audit logs */}
      <RecentActivity />
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color, href }: {
  title: string;
  value: number;
  icon: string;
  color: string;
  href?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  const content = (
    <div className={`p-6 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
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

// Quick Action Card Component
function QuickActionCard({ title, description, icon, buttonText, href, color }: {
  title: string;
  description: string;
  icon: string;
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
            <span className="text-2xl mr-3">{icon}</span>
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

// Recent Activity Component
function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const response = await authenticatedFetch('/api/audit-logs?limit=5');

      if (response.ok) {
        const data = await response.json();
        setActivities(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const formatDescription = (activity: any) => {
    const d = activity.details || {};
    const hospital = activity.hospital?.name;
    switch (activity.action_type) {
      case 'USER_LOGIN': {
        const iden = d.email || d.mobileNumber || 'user';
        const method = d.method ? String(d.method) : 'login';
        return `${method} for ${iden}${hospital ? ` at ${hospital}` : ''}`;
      }
      case 'LOGIN_FAILED': {
        const iden = d.email || d.mobileNumber || 'user';
        const reason = d.reason ? String(d.reason) : 'failed';
        return `Login failed for ${iden} (${reason})`;
      }
      case 'USER_LOGOUT': {
        return 'User logged out';
      }
      case 'SEND_INVITATION': {
        const email = d.email || 'unknown';
        const role = d.role || 'user';
        return `Invitation sent to ${email} for ${String(role).toLowerCase().replace('_',' ')}${hospital ? ` • ${hospital}` : ''}`;
      }
      case 'INVITATION_ACCEPTED': {
        const email = d.email || 'unknown';
        const role = d.role || 'user';
        const h = d.hospitalName || hospital;
        return `Invitation accepted by ${email}${h ? ` • ${h}` : ''} (${String(role).toLowerCase().replace('_',' ')})`;
      }
      case 'CREATE_HOSPITAL': {
        const name = d.name || 'Hospital';
        const admin = d.adminEmail || 'admin';
        return `Created hospital ${name} • Admin ${admin}`;
      }
      case 'USER_SETUP_COMPLETED': {
        const iden = d.email || d.mobileNumber || 'user';
        return `Setup completed for ${iden}`;
      }
      default: {
        try {
          return JSON.stringify(activity.details || {});
        } catch {
          return 'No details';
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              action={activity.action_type.replace(/_/g, ' ')}
              description={formatDescription(activity)}
              time={formatTime(activity.created_at)}
              user={activity.user?.email || 'System'}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        )}
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ action, description, time, user }: {
  action: string;
  description: string;
  time: string;
  user: string;
}) {
  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 capitalize">
          {action}
        </p>
        <p className="text-sm text-gray-600 truncate">
          {description}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {time} • By {user}
        </p>
      </div>
    </div>
  );
}