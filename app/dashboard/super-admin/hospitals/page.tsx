'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import HospitalForm from './components/HospitalForm';
import HospitalsList from './components/HospitalsList';
import { authenticatedFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus } from 'lucide-react';

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
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospitals</h1>
          <p className="text-gray-600 mt-1">
            Manage all hospitals in the system
          </p>
        </div>
        <Button onClick={handleCreateHospital}>
          <Plus className="mr-2 h-4 w-4" />
          Add Hospital
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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