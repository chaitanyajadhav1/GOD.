/**
 * Modern Template - Clean and contemporary design with blue accents
 * Features: Gradient header, card-based layout, modern typography
 */

'use client';

import React from 'react';
import { PrescriptionData } from '@/types';
import { format } from 'date-fns';
import { Phone, Mail, MapPin, Calendar, User, Activity } from 'lucide-react';

interface ModernTemplateProps {
  data: PrescriptionData;
}

export default function ModernTemplate({ data }: ModernTemplateProps) {
  const { patient, doctor, diagnosis, medications, tests, advice, date, followUpDate } = data;

  return (
    <div className="prescription-container bg-white p-8 max-w-4xl mx-auto" id="prescription-content">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 rounded-t-lg -mx-8 -mt-8 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{doctor.name}</h1>
            <p className="text-primary-100 text-lg">{doctor.qualification}</p>
            <p className="text-primary-100">{doctor.specialization}</p>
            <p className="text-primary-100 text-sm mt-1">Reg. No: {doctor.registrationNumber}</p>
          </div>
          <div className="text-right text-sm">
            <p className="flex items-center justify-end gap-2 mb-1">
              <Phone className="w-4 h-4" /> {doctor.contact}
            </p>
            <p className="flex items-center justify-end gap-2 mb-1">
              <Mail className="w-4 h-4" /> {doctor.email}
            </p>
            <p className="flex items-center justify-end gap-2 mt-2 text-primary-100">
              <Calendar className="w-4 h-4" /> {format(date, 'dd MMM yyyy')}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-primary-400">
          <p className="font-semibold">{doctor.clinicName}</p>
          <p className="text-sm text-primary-100 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {doctor.clinicAddress}
          </p>
        </div>
      </div>

      {/* Patient Information Card */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-600" />
          Patient Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 font-medium">Name:</span>
            <p className="font-semibold text-gray-800">{patient.name}</p>
          </div>
          <div>
            <span className="text-gray-600 font-medium">Age/Gender:</span>
            <p className="font-semibold text-gray-800">{patient.age} / {patient.gender}</p>
          </div>
          <div>
            <span className="text-gray-600 font-medium">Contact:</span>
            <p className="font-semibold text-gray-800">{patient.contact}</p>
          </div>
          {patient.bloodGroup && (
            <div>
              <span className="text-gray-600 font-medium">Blood Group:</span>
              <p className="font-semibold text-gray-800">{patient.bloodGroup}</p>
            </div>
          )}
        </div>
        {patient.allergies && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            <span className="text-red-600 font-medium text-sm">⚠️ Allergies:</span>
            <p className="text-sm text-gray-800 mt-1">{patient.allergies}</p>
          </div>
        )}
      </div>

      {/* Diagnosis */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-600" />
          Diagnosis
        </h2>
        <div className="bg-primary-50 p-4 rounded-lg border-l-4 border-primary-600">
          <p className="text-gray-800">{diagnosis}</p>
        </div>
      </div>

      {/* Medications */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">℞ Medications</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary-600 text-white">
                <th className="p-3 text-left rounded-tl-lg">#</th>
                <th className="p-3 text-left">Medicine Name</th>
                <th className="p-3 text-left">Dosage</th>
                <th className="p-3 text-left">Frequency</th>
                <th className="p-3 text-left rounded-tr-lg">Duration</th>
              </tr>
            </thead>
            <tbody>
              {medications.map((med, index) => (
                <tr key={med.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-3 border border-gray-200">{index + 1}</td>
                  <td className="p-3 border border-gray-200 font-semibold">{med.name}</td>
                  <td className="p-3 border border-gray-200">{med.dosage}</td>
                  <td className="p-3 border border-gray-200">{med.frequency}</td>
                  <td className="p-3 border border-gray-200">{med.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {medications.some(med => med.instructions) && (
          <div className="mt-3 text-sm">
            <p className="font-semibold text-gray-700 mb-1">Special Instructions:</p>
            {medications.filter(med => med.instructions).map((med) => (
              <p key={med.id} className="text-gray-600 ml-4">
                • {med.name}: {med.instructions}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Tests */}
      {tests.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">🔬 Recommended Tests</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <ul className="space-y-2">
              {tests.map((test, index) => (
                <li key={test.id} className="flex items-start">
                  <span className="font-semibold text-primary-600 mr-2">{index + 1}.</span>
                  <div>
                    <span className="font-semibold text-gray-800">{test.name}</span>
                    {test.description && (
                      <span className="text-gray-600 text-sm ml-2">- {test.description}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Advice */}
      {advice && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">💡 Medical Advice</h2>
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <p className="text-gray-800 whitespace-pre-line">{advice}</p>
          </div>
        </div>
      )}

      {/* Follow-up */}
      {followUpDate && (
        <div className="mb-6">
          <div className="bg-primary-100 p-3 rounded-lg inline-block">
            <p className="text-sm font-semibold text-primary-800">
              📅 Follow-up Date: {format(followUpDate, 'dd MMMM yyyy')}
            </p>
          </div>
        </div>
      )}

      {/* Signature */}
      <div className="mt-8 pt-6 border-t-2 border-gray-300">
        <div className="flex justify-end">
          <div className="text-center">
            {doctor.signature && (
              <div className="mb-2">
                <img src={doctor.signature} alt="Signature" className="h-16 mx-auto" />
              </div>
            )}
            <div className="border-t-2 border-gray-800 pt-2 min-w-[200px]">
              <p className="font-bold text-gray-800">{doctor.name}</p>
              <p className="text-sm text-gray-600">{doctor.qualification}</p>
              <p className="text-xs text-gray-500">Reg. No: {doctor.registrationNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
        <p>This is a digitally generated prescription. For any queries, please contact the clinic.</p>
      </div>
    </div>
  );
}
