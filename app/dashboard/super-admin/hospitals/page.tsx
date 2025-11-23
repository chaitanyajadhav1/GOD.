'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import HospitalForm from './components/HospitalForm';
import HospitalsList from './components/HospitalsList';
import { authenticatedFetch } from '@/lib/api-client';

interface Hospital {
  id: string;
  name: string;
  address?: string;
  contact_number?: string;
  email?: string;
  status: string;
  created_at: string;
  admin?: {
    email?: string;
    mobile_number?: string;
  };
  creator: {
    email?: string;
    mobile_number?: string;
  };
}

export default function HospitalsPage() {
  const searchParams = useSearchParams();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);

  useEffect(() => {
    if (searchParams.get('create') === 'new') {
      setShowForm(true);
    }
    fetchHospitals();
  }, [searchParams]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authenticatedFetch('/api/super-admin/hospitals');

      if (response.ok) {
        const data = await response.json();
        setHospitals(data.data || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch hospitals' }));
        setError(errorData.error || 'Failed to fetch hospitals');
      }
    } catch (error: any) {
      console.error('Error fetching hospitals:', error);
      setError(error.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHospital = () => {
    setEditingHospital(null);
    setShowForm(true);
  };

  const handleEditHospital = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingHospital(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingHospital(null);
    fetchHospitals();
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
          <h1 className="text-2xl font-bold text-gray-900">Hospitals</h1>
          <p className="text-gray-600 mt-1">
            Manage all hospitals in the system
          </p>
        </div>
        <button
          onClick={handleCreateHospital}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="mr-2">+</span>
          Add Hospital
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Hospital Form Modal */}
      {showForm && (
        <HospitalForm
          hospital={editingHospital}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Hospitals List */}
      <HospitalsList
        hospitals={hospitals}
        onEdit={handleEditHospital}
        onRefresh={fetchHospitals}
      />
    </div>
  );
}
