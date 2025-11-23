'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface Hospital {
  id: string;
  name: string;
  address?: string;
  contact_details?: any;
  created_at: string;
  creator: {
    mobile_number: string;
    user_type: string;
  };
}

export default function HospitalDashboard() {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/hospitals', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHospitals(data.hospitals || []);
      } else {
        setError('Failed to fetch hospitals');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Hospital Management</h1>
        {user?.userType === 'SUPER_USER' && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Add Hospital
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => (
          <div
            key={hospital.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {hospital.name}
            </h3>
            {hospital.address && (
              <p className="text-gray-600 mb-2">{hospital.address}</p>
            )}
            <div className="text-sm text-gray-500">
              <p>Created by: {hospital.creator.mobile_number}</p>
              <p>Created: {new Date(hospital.created_at).toLocaleDateString()}</p>
            </div>
            <div className="mt-4 flex space-x-2">
              <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200">
                View Details
              </button>
              <button className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200">
                Manage Users
              </button>
            </div>
          </div>
        ))}
      </div>

      {hospitals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hospitals found</p>
          <p className="text-gray-400 mt-2">
            {user?.userType === 'SUPER_USER' 
              ? 'Create your first hospital to get started' 
              : 'You are not associated with any hospitals yet'}
          </p>
        </div>
      )}
    </div>
  );
}