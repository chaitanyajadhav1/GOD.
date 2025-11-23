// app/dashboard/super-admin/hospitals/components/HospitalsList.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  };
  creator: {
    email?: string;
  };
}

interface HospitalsListProps {
  hospitals: Hospital[];
  onEdit: (hospital: Hospital) => void;
  onRefresh: () => void;
}

export default function HospitalsList({ hospitals, onEdit, onRefresh }: HospitalsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (hospitals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">🏥</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hospitals yet
        </h3>
        <p className="text-gray-500 mb-4">
          Get started by creating your first hospital.
        </p>
        <button
          onClick={() => onEdit({} as Hospital)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <span className="mr-2">+</span>
          Create Hospital
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header with search */}
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              All Hospitals ({hospitals.length})
            </h2>
          </div>
          <div className="mt-2 sm:mt-0">
            <input
              type="text"
              placeholder="Search hospitals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Hospitals Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hospital
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredHospitals.map((hospital) => (
              <tr key={hospital.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {hospital.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {hospital.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {hospital.contact_number || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {hospital.email || 'No email'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {hospital.admin?.email || 'Not assigned'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    hospital.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {hospital.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(hospital)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <Link
                      href={`/dashboard/super-admin/invitations?hospital=${hospital.id}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Invite
                    </Link>
                    <button className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
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