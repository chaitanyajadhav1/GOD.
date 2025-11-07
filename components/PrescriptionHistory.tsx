/**
 * Prescription History Component
 * Displays list of previously generated prescriptions with search and view options
 */

'use client';

import React, { useState, useEffect } from 'react';
import { PrescriptionData } from '@/types';
import { getPrescriptionHistory, deletePrescription } from '@/lib/storage';
import { format } from 'date-fns';
import { Search, Eye, Trash2, Calendar, User, FileText } from 'lucide-react';

interface PrescriptionHistoryProps {
  onViewPrescription: (prescription: PrescriptionData) => void;
}

export default function PrescriptionHistory({ onViewPrescription }: PrescriptionHistoryProps) {
  const [history, setHistory] = useState<PrescriptionData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<PrescriptionData[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [searchTerm, history]);

  const loadHistory = () => {
    const data = getPrescriptionHistory();
    setHistory(data);
  };

  const filterHistory = () => {
    if (!searchTerm.trim()) {
      setFilteredHistory(history);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = history.filter(
      (p) =>
        p.patient.name.toLowerCase().includes(term) ||
        p.diagnosis.toLowerCase().includes(term) ||
        p.patient.contact.includes(term)
    );
    setFilteredHistory(filtered);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this prescription?')) {
      deletePrescription(id);
      loadHistory();
    }
  };

  if (history.length === 0) {
    return (
      <div className="card text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Prescription History</h3>
        <p className="text-gray-500">
          Prescriptions you create will appear here for easy access and reference.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Prescription History</h2>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by patient name, diagnosis, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No prescriptions found matching your search.
          </div>
        ) : (
          filteredHistory.map((prescription) => (
            <div
              key={prescription.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {prescription.patient.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      ({prescription.patient.age} yrs, {prescription.patient.gender})
                    </span>
                  </div>
                  
                  <div className="ml-8 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Diagnosis:</span> {prescription.diagnosis}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Medications:</span>{' '}
                      {prescription.medications.length} prescribed
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {format(prescription.date, 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onViewPrescription(prescription)}
                    className="btn-primary flex items-center gap-2"
                    title="View Prescription"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(prescription.id)}
                    className="btn-secondary text-red-600 hover:bg-red-50 flex items-center gap-2"
                    title="Delete Prescription"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredHistory.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          Showing {filteredHistory.length} of {history.length} prescriptions
        </div>
      )}
    </div>
  );
}
