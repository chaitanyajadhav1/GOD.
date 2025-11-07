/**
 * Doctor Input Form Component
 * Captures diagnosis, medications, tests, and medical advice
 */

'use client';

import React, { useState } from 'react';
import { Medication, Test } from '@/types';
import { Plus, Trash2, Stethoscope, Pill, FlaskConical, FileText } from 'lucide-react';

interface DoctorFormProps {
  onSubmit: (data: {
    diagnosis: string;
    medications: Medication[];
    tests: Test[];
    advice: string;
    followUpDate?: Date;
  }) => void;
  onBack: () => void;
}

export default function DoctorForm({ onSubmit, onBack }: DoctorFormProps) {
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [advice, setAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Medication form state
  const [medicationForm, setMedicationForm] = useState<Omit<Medication, 'id'>>({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });

  // Test form state
  const [testForm, setTestForm] = useState<Omit<Test, 'id'>>({
    name: '',
    description: '',
  });

  const addMedication = () => {
    if (medicationForm.name && medicationForm.dosage && medicationForm.frequency) {
      setMedications([
        ...medications,
        { ...medicationForm, id: Date.now().toString() },
      ]);
      setMedicationForm({
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      });
    }
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter((med) => med.id !== id));
  };

  const addTest = () => {
    if (testForm.name) {
      setTests([...tests, { ...testForm, id: Date.now().toString() }]);
      setTestForm({ name: '', description: '' });
    }
  };

  const removeTest = (id: string) => {
    setTests(tests.filter((test) => test.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (diagnosis && medications.length > 0) {
      onSubmit({
        diagnosis,
        medications,
        tests,
        advice,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      });
    } else {
      alert('Please provide at least diagnosis and one medication');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-8 animate-fadeIn">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <Stethoscope className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-800">Prescription Details</h2>
      </div>

      {/* Diagnosis Section */}
      <div>
        <label htmlFor="diagnosis" className="form-label text-lg font-semibold">
          <FileText className="w-5 h-5 inline mr-2" />
          Diagnosis *
        </label>
        <textarea
          id="diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          className="form-input"
          placeholder="Enter patient diagnosis"
          rows={3}
          required
        />
      </div>

      {/* Medications Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Pill className="w-5 h-5 text-primary-600" />
          Medications *
        </h3>

        {/* Add Medication Form */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Medicine Name</label>
              <input
                type="text"
                value={medicationForm.name}
                onChange={(e) =>
                  setMedicationForm({ ...medicationForm, name: e.target.value })
                }
                className="form-input"
                placeholder="e.g., Paracetamol"
              />
            </div>
            <div>
              <label className="form-label">Dosage</label>
              <input
                type="text"
                value={medicationForm.dosage}
                onChange={(e) =>
                  setMedicationForm({ ...medicationForm, dosage: e.target.value })
                }
                className="form-input"
                placeholder="e.g., 500mg"
              />
            </div>
            <div>
              <label className="form-label">Frequency</label>
              <select
                value={medicationForm.frequency}
                onChange={(e) =>
                  setMedicationForm({ ...medicationForm, frequency: e.target.value })
                }
                className="form-input"
              >
                <option value="">Select frequency</option>
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="Four times daily">Four times daily</option>
                <option value="Every 4 hours">Every 4 hours</option>
                <option value="Every 6 hours">Every 6 hours</option>
                <option value="Every 8 hours">Every 8 hours</option>
                <option value="Before meals">Before meals</option>
                <option value="After meals">After meals</option>
                <option value="At bedtime">At bedtime</option>
                <option value="As needed">As needed</option>
              </select>
            </div>
            <div>
              <label className="form-label">Duration</label>
              <input
                type="text"
                value={medicationForm.duration}
                onChange={(e) =>
                  setMedicationForm({ ...medicationForm, duration: e.target.value })
                }
                className="form-input"
                placeholder="e.g., 5 days"
              />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Special Instructions</label>
              <input
                type="text"
                value={medicationForm.instructions}
                onChange={(e) =>
                  setMedicationForm({ ...medicationForm, instructions: e.target.value })
                }
                className="form-input"
                placeholder="e.g., Take with food"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={addMedication}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Medication
          </button>
        </div>

        {/* Medications List */}
        {medications.length > 0 && (
          <div className="space-y-2">
            {medications.map((med) => (
              <div
                key={med.id}
                className="flex items-start justify-between bg-white border border-gray-200 p-4 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{med.name}</h4>
                  <p className="text-sm text-gray-600">
                    {med.dosage} • {med.frequency} • {med.duration}
                  </p>
                  {med.instructions && (
                    <p className="text-sm text-gray-500 italic mt-1">{med.instructions}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeMedication(med.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tests Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary-600" />
          Recommended Tests
        </h3>

        {/* Add Test Form */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Test Name</label>
              <input
                type="text"
                value={testForm.name}
                onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                className="form-input"
                placeholder="e.g., Complete Blood Count"
              />
            </div>
            <div>
              <label className="form-label">Description (Optional)</label>
              <input
                type="text"
                value={testForm.description}
                onChange={(e) =>
                  setTestForm({ ...testForm, description: e.target.value })
                }
                className="form-input"
                placeholder="Additional notes"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={addTest}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Test
          </button>
        </div>

        {/* Tests List */}
        {tests.length > 0 && (
          <div className="space-y-2">
            {tests.map((test) => (
              <div
                key={test.id}
                className="flex items-start justify-between bg-white border border-gray-200 p-4 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{test.name}</h4>
                  {test.description && (
                    <p className="text-sm text-gray-600">{test.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeTest(test.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advice Section */}
      <div>
        <label htmlFor="advice" className="form-label text-lg font-semibold">
          Medical Advice & Instructions
        </label>
        <textarea
          id="advice"
          value={advice}
          onChange={(e) => setAdvice(e.target.value)}
          className="form-input"
          placeholder="Enter general advice, lifestyle recommendations, precautions, etc."
          rows={4}
        />
      </div>

      {/* Follow-up Date */}
      <div>
        <label htmlFor="followUpDate" className="form-label">
          Follow-up Date (Optional)
        </label>
        <input
          type="date"
          id="followUpDate"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
          className="form-input max-w-xs"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button type="button" onClick={onBack} className="btn-secondary">
          Back to Patient Info
        </button>
        <button type="submit" className="btn-primary">
          Continue to Template Selection
        </button>
      </div>
    </form>
  );
}
