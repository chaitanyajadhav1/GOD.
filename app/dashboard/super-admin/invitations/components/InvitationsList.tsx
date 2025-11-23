// app/dashboard/super-admin/invitations/components/InvitationsList.tsx
'use client';

import { useState } from 'react';
import { authenticatedFetch } from '@/lib/api-client';

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
  hospital?: {
    name: string;
  };
  sender: {
    email: string;
  };
}

interface InvitationsListProps {
  invitations: Invitation[];
  onRefresh: () => void;
}

export default function InvitationsList({ invitations, onRefresh }: InvitationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitation.hospital?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || invitation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      ACCEPTED: { color: 'bg-green-100 text-green-800', label: 'Accepted' },
      EXPIRED: { color: 'bg-red-100 text-red-800', label: 'Expired' },
      REVOKED: { color: 'bg-gray-100 text-gray-800', label: 'Revoked' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      DOCTOR: { color: 'bg-blue-100 text-blue-800', label: 'Doctor' },
      HOSPITAL_ADMIN: { color: 'bg-purple-100 text-purple-800', label: 'Hospital Admin' },
      STAFF: { color: 'bg-gray-100 text-gray-800', label: 'Staff' },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || 
                   { color: 'bg-gray-100 text-gray-800', label: role };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await authenticatedFetch(`/api/super-admin/invitations/${invitationId}/resend`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Invitation resent successfully!');
        onRefresh();
      } else {
        alert('Failed to resend invitation');
      }
    } catch (error) {
      console.error('Error resending invitation:', error);
      alert('Error resending invitation');
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to revoke this invitation?')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/super-admin/invitations/${invitationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Invitation revoked successfully!');
        onRefresh();
      } else {
        alert('Failed to revoke invitation');
      }
    } catch (error) {
      console.error('Error revoking invitation:', error);
      alert('Error revoking invitation');
    }
  };

  if (invitations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">📧</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No invitations yet
        </h3>
        <p className="text-gray-500 mb-4">
          Send your first invitation to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header with filters */}
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              All Invitations ({filteredInvitations.length})
            </h2>
          </div>
          <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="EXPIRED">Expired</option>
              <option value="REVOKED">Revoked</option>
            </select>
            <input
              type="text"
              placeholder="Search invitations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Invitations Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invitation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hospital & Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInvitations.map((invitation) => (
              <tr key={invitation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {invitation.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      Sent by {invitation.sender.email}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {invitation.hospital?.name || 'No hospital'}
                  </div>
                  <div className="mt-1">
                    {getRoleBadge(invitation.role)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(invitation.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(invitation.expires_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {invitation.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleResendInvitation(invitation.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Resend
                        </button>
                        <button
                          onClick={() => handleRevokeInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Revoke
                        </button>
                      </>
                    )}
                    {invitation.status === 'ACCEPTED' && (
                      <span className="text-green-600">Accepted</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}