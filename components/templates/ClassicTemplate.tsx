/**
 * Classic Template - Traditional medical prescription design
 * Features: Professional serif fonts, formal layout, traditional styling
 */

'use client';

import React from 'react';
import { PrescriptionData } from '@/types';
import { format } from 'date-fns';

interface ClassicTemplateProps {
  data: PrescriptionData;
}

export default function ClassicTemplate({ data }: ClassicTemplateProps) {
  const { patient, doctor, diagnosis, medications, tests, advice, date, followUpDate } = data;

  return (
    <div className="prescription-container bg-white p-10 max-w-4xl mx-auto font-serif" id="prescription-content">
      {/* Header with Border */}
      <div className="border-4 border-double border-gray-800 p-6 mb-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
          <p className="text-lg text-gray-700">{doctor.qualification}</p>
          <p className="text-md text-gray-600 italic">{doctor.specialization}</p>
          <div className="mt-3 pt-3 border-t border-gray-400">
            <p className="text-sm">{doctor.clinicName}</p>
            <p className="text-sm text-gray-600">{doctor.clinicAddress}</p>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>Tel: {doctor.contact} | Email: {doctor.email}</p>
            <p className="mt-1">Registration No: {doctor.registrationNumber}</p>
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="text-right mb-6">
        <p className="text-sm font-semibold">Date: {format(date, 'dd/MM/yyyy')}</p>
      </div>

      {/* Patient Details */}
      <div className="mb-6 border-b-2 border-gray-300 pb-4">
        <h2 className="text-xl font-bold mb-3 underline">Patient Details</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-semibold">Name: </span>
            <span>{patient.name}</span>
          </div>
          <div>
            <span className="font-semibold">Age/Sex: </span>
            <span>{patient.age} Years / {patient.gender}</span>
          </div>
          <div>
            <span className="font-semibold">Contact: </span>
            <span>{patient.contact}</span>
          </div>
          {patient.bloodGroup && (
            <div>
              <span className="font-semibold">Blood Group: </span>
              <span>{patient.bloodGroup}</span>
            </div>
          )}
          <div className="col-span-2">
            <span className="font-semibold">Address: </span>
            <span>{patient.address}</span>
          </div>
          {patient.allergies && (
            <div className="col-span-2">
              <span className="font-semibold text-red-700">Allergies: </span>
              <span className="text-red-700">{patient.allergies}</span>
            </div>
          )}
        </div>
      </div>

      {/* Diagnosis */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 underline">Diagnosis</h2>
        <p className="text-base pl-4">{diagnosis}</p>
      </div>

      {/* Prescription Symbol and Medications */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <span className="text-5xl font-bold text-gray-800 mr-3">℞</span>
          <h2 className="text-xl font-bold underline">Prescription</h2>
        </div>
        
        <table className="w-full border-collapse border-2 border-gray-800">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-800 p-2 text-left w-12">S.No</th>
              <th className="border border-gray-800 p-2 text-left">Medicine Name</th>
              <th className="border border-gray-800 p-2 text-left">Dosage</th>
              <th className="border border-gray-800 p-2 text-left">Frequency</th>
              <th className="border border-gray-800 p-2 text-left">Duration</th>
            </tr>
          </thead>
          <tbody>
            {medications.map((med, index) => (
              <tr key={med.id}>
                <td className="border border-gray-800 p-2 text-center">{index + 1}</td>
                <td className="border border-gray-800 p-2 font-semibold">{med.name}</td>
                <td className="border border-gray-800 p-2">{med.dosage}</td>
                <td className="border border-gray-800 p-2">{med.frequency}</td>
                <td className="border border-gray-800 p-2">{med.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Special Instructions */}
        {medications.some(med => med.instructions) && (
          <div className="mt-3 pl-4">
            <p className="font-semibold underline mb-1">Special Instructions:</p>
            <ul className="list-disc list-inside">
              {medications.filter(med => med.instructions).map((med) => (
                <li key={med.id} className="text-sm">
                  {med.name}: {med.instructions}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Investigations */}
      {tests.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 underline">Investigations Advised</h2>
          <ol className="list-decimal list-inside pl-4">
            {tests.map((test) => (
              <li key={test.id} className="mb-1">
                <span className="font-semibold">{test.name}</span>
                {test.description && <span className="text-sm text-gray-600"> - {test.description}</span>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Advice */}
      {advice && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 underline">Advice</h2>
          <p className="text-base pl-4 whitespace-pre-line">{advice}</p>
        </div>
      )}

      {/* Follow-up */}
      {followUpDate && (
        <div className="mb-6">
          <p className="font-semibold">
            Next Visit: <span className="underline">{format(followUpDate, 'dd MMMM yyyy')}</span>
          </p>
        </div>
      )}

      {/* Signature Section */}
      <div className="mt-12 pt-6">
        <div className="flex justify-end">
          <div className="text-center">
            {doctor.signature && (
              <div className="mb-2">
                <img src={doctor.signature} alt="Signature" className="h-16 mx-auto" />
              </div>
            )}
            <div className="border-t-2 border-gray-900 pt-2 min-w-[250px]">
              <p className="font-bold text-lg">{doctor.name}</p>
              <p className="text-sm">{doctor.qualification}</p>
              <p className="text-xs text-gray-600">Reg. No: {doctor.registrationNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 pt-4 border-t border-gray-400 text-center text-xs text-gray-600">
        <p>This prescription is valid for 30 days from the date of issue.</p>
        <p className="mt-1">For any queries, please contact the clinic during working hours.</p>
      </div>
    </div>
  );
}
