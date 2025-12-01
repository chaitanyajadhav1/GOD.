// app/dashboard/super-admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authenticatedFetch } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Building2, CheckCircle2, Mail, Users, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch all data in parallel instead of sequentially
      const [hospitalsRes, invitationsRes] = await Promise.allSettled([
        authenticatedFetch('/api/super-admin/hospitals'),
        authenticatedFetch('/api/super-admin/invitations'),
      ]);

      let totalHospitals = 0;
      let activeHospitals = 0;
      let pendingInvitations = 0;

      // Handle hospitals response
      if (hospitalsRes.status === 'fulfilled' && hospitalsRes.value.ok) {
        const hospitalsData = await hospitalsRes.value.json();
        const hospitals = hospitalsData.data || [];
        totalHospitals = hospitals.length;
        activeHospitals = hospitals.filter((h: any) => h.status === 'ACTIVE').length;
      }

      // Handle invitations response
      if (invitationsRes.status === 'fulfilled' && invitationsRes.value.ok) {
        const invitationsData = await invitationsRes.value.json();
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
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="mt-2 flex items-center justify-between">
          <span>{error}</span>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchDashboardStats();
            }}
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, Super Admin</h1>
        <p className="text-muted-foreground mt-2">
          Manage hospitals, users, and invitations from this dashboard.
        </p>
      </div>

      <Separator />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Hospitals"
          value={stats.totalHospitals}
          icon={Building2}
          color="blue"
          href="/dashboard/super-admin/hospitals"
        />
        <StatCard
          title="Active Hospitals"
          value={stats.activeHospitals}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Pending Invitations"
          value={stats.pendingInvitations}
          icon={Mail}
          color="yellow"
          href="/dashboard/super-admin/invitations"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <QuickActionCard
            title="Create New Hospital"
            description="Add a new hospital to the platform"
            icon={Building2}
            buttonText="Create Hospital"
            href="/dashboard/super-admin/hospitals?create=new"
            color="blue"
          />
          <QuickActionCard
            title="Send Invitations"
            description="Invite doctors and staff to hospitals"
            icon={Mail}
            buttonText="Send Invite"
            href="/dashboard/super-admin/invitations?create=new"
            color="green"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, href }: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  href?: string;
}) {
  const colorClasses = {
    blue: 'hover:bg-blue-50 border-blue-200',
    green: 'hover:bg-green-50 border-green-200',
    yellow: 'hover:bg-yellow-50 border-yellow-200',
    purple: 'hover:bg-purple-50 border-purple-200',
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
  };

  const content = (
    <Card className={`transition-colors ${colorClasses[color as keyof typeof colorClasses]} ${href ? 'cursor-pointer' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColorClasses[color as keyof typeof iconColorClasses]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  return content;
}

// Quick Action Card Component
function QuickActionCard({ title, description, icon: Icon, buttonText, href, color }: {
  title: string;
  description: string;
  icon: React.ElementType;
  buttonText: string;
  href: string;
  color: string;
}) {
  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColorClasses[color as keyof typeof iconColorClasses]}`} />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href={href}>
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// Recent Activity Component
function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await authenticatedFetch('/api/audit-logs?limit=5', {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setActivities(data.logs || []);
      } else {
        setError('Failed to load activity');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('Request timed out');
      } else {
        console.error('Error fetching recent activity:', error);
        setError('Unable to load activity');
      }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions and events in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-2 w-2 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="mt-2 flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  fetchRecentActivity();
                }}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && (
          <div className="space-y-4">
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
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
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
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium capitalize leading-none">
          {action}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        <p className="text-xs text-muted-foreground">
          {time} • {user}
        </p>
      </div>
    </div>
  );
}