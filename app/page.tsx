/**
 * Main Application Page
 * Orchestrates the prescription builder workflow
 */

'use client';

import React, { useState } from 'react';
import { Patient, PrescriptionData, TemplateType, Medication, Test } from '@/types';
import { getSampleDoctorData, savePrescription } from '@/lib/storage';
import PatientForm from '@/components/PatientForm';
import DoctorForm from '@/components/DoctorForm';
import TemplateSelector from '@/components/TemplateSelector';
import PrescriptionView from '@/components/PrescriptionView';
import PrescriptionHistory from '@/components/PrescriptionHistory';
import DynamicPayment from '@/components/DynamicPayment';
import { FileText, History, Home as HomeIcon, CreditCard } from 'lucide-react';

type Step = 'home' | 'patient' | 'doctor' | 'template' | 'preview' | 'history' | 'payment';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('home');
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);

  // Sample doctor data - in production, this would come from user profile
  const doctorInfo = getSampleDoctorData();

  const handlePatientSubmit = (patient: Patient) => {
    setPatientData(patient);
    setCurrentStep('doctor');
  };

  const handleDoctorSubmit = (data: {
    diagnosis: string;
    medications: Medication[];
    tests: Test[];
    advice: string;
    followUpDate?: Date;
  }) => {
    if (!patientData) return;

    const prescription: PrescriptionData = {
      id: Date.now().toString(),
      date: new Date(),
      patient: patientData,
      doctor: doctorInfo,
      diagnosis: data.diagnosis,
      medications: data.medications,
      tests: data.tests,
      advice: data.advice,
      followUpDate: data.followUpDate,
      templateId: 'modern', // Default, will be updated in template selector
    };

    setPrescriptionData(prescription);
    setCurrentStep('template');
  };

  const handleTemplateSelect = (templateId: TemplateType) => {
    if (!prescriptionData) return;

    const updatedPrescription = {
      ...prescriptionData,
      templateId,
    };

    setPrescriptionData(updatedPrescription);
    savePrescription(updatedPrescription);
    setCurrentStep('preview');
  };

  const handleViewPrescription = (prescription: PrescriptionData) => {
    setPrescriptionData(prescription);
    setCurrentStep('preview');
  };

  const handleNewPrescription = () => {
    setPatientData(null);
    setPrescriptionData(null);
    setCurrentStep('patient');
  };

  const handleBackToHome = () => {
    setCurrentStep('home');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'home':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Prescription Builder
              </h1>
              <p className="text-xl text-gray-600">
                Create professional medical prescriptions with multiple template options
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={handleNewPrescription}
                className="card hover:shadow-xl transition-shadow text-left group"
              >
                <FileText className="w-12 h-12 text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  New Prescription
                </h2>
                <p className="text-gray-600">
                  Create a new prescription with patient information, diagnosis, and medications
                </p>
              </button>

              <button
                onClick={() => setCurrentStep('history')}
                className="card hover:shadow-xl transition-shadow text-left group"
              >
                <History className="w-12 h-12 text-primary-600 mb-4 group-hover:scale-110 transition-transform" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Prescription History
                </h2>
                <p className="text-gray-600">
                  View, search, and manage previously created prescriptions
                </p>
              </button>

              <button
                onClick={() => setCurrentStep('payment')}
                className="card hover:shadow-xl transition-shadow text-left group bg-gradient-to-br from-green-50 to-blue-50"
              >
                <CreditCard className="w-12 h-12 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Make Payment
                </h2>
                <p className="text-gray-600">
                  Secure payment gateway with multiple payment options
                </p>
              </button>
            </div>

            {/* Features Section */}
            <div className="mt-16 card bg-gradient-to-r from-primary-50 to-primary-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Key Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">📋</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Complete Patient Data
                  </h4>
                  <p className="text-sm text-gray-600">
                    Capture all essential patient information including allergies and blood group
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">🎨</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Multiple Templates
                  </h4>
                  <p className="text-sm text-gray-600">
                    Choose from Modern, Classic, or Minimal templates with live preview
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">📄</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    PDF Export & Print
                  </h4>
                  <p className="text-sm text-gray-600">
                    Export prescriptions as PDF or print directly from the browser
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'patient':
        return (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleBackToHome}
              className="btn-secondary mb-6 flex items-center gap-2"
            >
              <HomeIcon className="w-4 h-4" />
              Back to Home
            </button>
            <PatientForm onSubmit={handlePatientSubmit} />
          </div>
        );

      case 'doctor':
        return (
          <div className="max-w-4xl mx-auto">
            <DoctorForm
              onSubmit={handleDoctorSubmit}
              onBack={() => setCurrentStep('patient')}
            />
          </div>
        );

      case 'template':
        return (
          <div className="max-w-6xl mx-auto">
            {prescriptionData && (
              <TemplateSelector
                prescriptionData={prescriptionData}
                onTemplateSelect={handleTemplateSelect}
                onBack={() => setCurrentStep('doctor')}
              />
            )}
          </div>
        );

      case 'preview':
        return (
          <div className="max-w-5xl mx-auto">
            {prescriptionData && (
              <PrescriptionView
                prescription={prescriptionData}
                onBack={handleBackToHome}
              />
            )}
          </div>
        );

      case 'history':
        return (
          <div className="max-w-6xl mx-auto">
            <button
              onClick={handleBackToHome}
              className="btn-secondary mb-6 flex items-center gap-2"
            >
              <HomeIcon className="w-4 h-4" />
              Back to Home
            </button>
            <PrescriptionHistory onViewPrescription={handleViewPrescription} />
          </div>
        );

      case 'payment':
        return (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleBackToHome}
              className="btn-secondary mb-6 flex items-center gap-2"
            >
              <HomeIcon className="w-4 h-4" />
              Back to Home
            </button>
            
            <div className="card">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                Payment Gateway
              </h1>
              <p className="text-gray-600 text-center mb-8">
                Choose your payment method and enter the amount
              </p>
              
              <DynamicPayment
                businessName="Prescription Builder"
                description="Payment for Prescription Services"
                onSuccess={(response) => {
                  console.log('Payment successful:', response);
                  alert('Payment successful! Thank you.');
                  setCurrentStep('home');
                }}
                onFailure={(error) => {
                  console.error('Payment failed:', error);
                  alert('Payment failed. Please try again.');
                }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        {renderStep()}
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-500">
        <p>Prescription Builder v1.0 - Professional Medical Prescription Management</p>
      </footer>
    </div>
  );
}
