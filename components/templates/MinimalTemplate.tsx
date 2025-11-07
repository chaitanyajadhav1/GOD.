/**
 * Minimal Template - Clean, modern, and minimalist design
 * Features: Lots of whitespace, subtle colors, clean typography
 */

'use client';

import React from 'react';
import { PrescriptionData } from '@/types';
import { format } from 'date-fns';

interface MinimalTemplateProps {
  data: PrescriptionData;
}

export default function MinimalTemplate({ data }: MinimalTemplateProps) {
  const { patient, doctor, diagnosis, medications, tests, advice, date, followUpDate } = data;

  return (
    <div className="prescription-container bg-white p-12 max-w-4xl mx-auto" id="prescription-content">
      {/* Minimalist Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-light text-gray-900 mb-1">{doctor.name}</h1>
        <p className="text-sm text-gray-500 uppercase tracking-wide">{doctor.qualification} • {doctor.specialization}</p>
        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <p>{doctor.clinicName}</p>
          <p>{doctor.clinicAddress}</p>
          <p>{doctor.contact} • {doctor.email}</p>
        </div>
        <div className="mt-4 text-right">
          <p className="text-xs text-gray-400">{format(date, 'MMMM dd, yyyy')}</p>
        </div>
      </div>

      <div className="h-px bg-gray-200 mb-10"></div>

      {/* Patient Info - Minimal Grid */}
      <div className="mb-10">
        <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-4">Patient</h2>
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-1">Name</p>
            <p className="font-medium text-gray-900">{patient.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Age</p>
            <p className="font-medium text-gray-900">{patient.age} years</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Gender</p>
            <p className="font-medium text-gray-900">{patient.gender}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Contact</p>
            <p className="font-medium text-gray-900">{patient.contact}</p>
          </div>
          {patient.bloodGroup && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Blood Group</p>
              <p className="font-medium text-gray-900">{patient.bloodGroup}</p>
            </div>
          )}
        </div>
        {patient.allergies && (
          <div className="mt-4 p-3 bg-red-50 border-l-2 border-red-400">
            <p className="text-xs text-red-600 font-medium">ALLERGIES</p>
            <p className="text-sm text-red-800 mt-1">{patient.allergies}</p>
          </div>
        )}
      </div>

      <div className="h-px bg-gray-200 mb-10"></div>

      {/* Diagnosis */}
      <div className="mb-10">
        <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-3">Diagnosis</h2>
        <p className="text-base text-gray-800 leading-relaxed">{diagnosis}</p>
      </div>

      {/* Medications - Clean List */}
      <div className="mb-10">
        <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-4">Prescription</h2>
        <div className="space-y-4">
          {medications.map((med, index) => (
            <div key={med.id} className="border-l-2 border-gray-300 pl-4 py-2">
              <div className="flex items-baseline gap-3">
                <span className="text-xs text-gray-400 font-mono">{String(index + 1).padStart(2, '0')}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{med.name}</p>
                  <div className="flex gap-4 mt-1 text-sm text-gray-600">
                    <span>{med.dosage}</span>
                    <span>•</span>
                    <span>{med.frequency}</span>
                    <span>•</span>
                    <span>{med.duration}</span>
                  </div>
                  {med.instructions && (
                    <p className="text-xs text-gray-500 mt-1 italic">{med.instructions}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tests */}
      {tests.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-4">Laboratory Tests</h2>
          <div className="space-y-2">
            {tests.map((test, index) => (
              <div key={test.id} className="flex items-start gap-3">
                <span className="text-xs text-gray-400 font-mono mt-1">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{test.name}</p>
                  {test.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{test.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advice */}
      {advice && (
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-wider text-gray-400 mb-3">Medical Advice</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{advice}</p>
        </div>
      )}

      {/* Follow-up */}
      {followUpDate && (
        <div className="mb-10">
          <div className="inline-block px-4 py-2 bg-gray-100 rounded">
            <p className="text-xs text-gray-500">Next Appointment</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {format(followUpDate, 'EEEE, MMMM dd, yyyy')}
            </p>
          </div>
        </div>
      )}

      <div className="h-px bg-gray-200 my-12"></div>

      {/* Signature - Minimal */}
      <div className="flex justify-end">
        <div className="text-right">
          {doctor.signature && (
            <div className="mb-3">
              <img src={doctor.signature} alt="Signature" className="h-12 ml-auto" />
            </div>
          )}
          <p className="font-medium text-gray-900">{doctor.name}</p>
          <p className="text-xs text-gray-500 mt-1">{doctor.qualification}</p>
          <p className="text-xs text-gray-400 mt-0.5">Reg. {doctor.registrationNumber}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-xs text-gray-400">Digital Prescription</p>
      </div>
    </div>
  );
}
