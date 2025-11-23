'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import InvitationForm from './components/InvitationForm';
import InvitationsList from './components/InvitationsList';
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
  sender?: {
    email?: string;
  };
}

interface Hospital {
  id: string;
  name: string;
}

export default function InvitationsPage() {
  const searchParams = useSearchParams();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<string>('');

  useEffect(() => {
    if (searchParams.get('create') === 'new') {
      setShowForm(true);
    }
    const hospitalId = searchParams.get('hospital');
    if (hospitalId) {
      setSelectedHospital(hospitalId);
      setShowForm(true);
    }
    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch invitations
      const invitationsResponse = await authenticatedFetch('/api/super-admin/invitations');

      // Fetch hospitals for dropdown
      const hospitalsResponse = await authenticatedFetch('/api/super-admin/hospitals');

      if (invitationsResponse.ok && hospitalsResponse.ok) {
        const invitationsData = await invitationsResponse.json();
        const hospitalsData = await hospitalsResponse.json();
        
        setInvitations(invitationsData.data || []);
        setHospitals(hospitalsData.data || []);
      } else {
        setError('Failed to fetch data');
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = () => {
    setSelectedHospital('');
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedHospital('');
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedHospital('');
    fetchData();
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
          <p className="text-gray-600 mt-1">
            Manage invitations for doctors and staff
          </p>
        </div>
        <button
          onClick={handleCreateInvitation}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <span className="mr-2">📧</span>
          Send Invitation
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Invitation Form Modal */}
      {showForm && (
        <InvitationForm
          hospitals={hospitals}
          selectedHospital={selectedHospital}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Invitations List */}
      <InvitationsList
        invitations={invitations}
        onRefresh={fetchData}
      />
    </div>
  );
}
