/**
 * Type definitions for the Prescription Builder application
 */

// Patient information interface
export interface Patient {
  id?: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  address: string;
  bloodGroup?: string;
  allergies?: string;
}

// Doctor information interface
export interface Doctor {
  name: string;
  qualification: string;
  specialization: string;
  registrationNumber: string;
  contact: string;
  email: string;
  clinicName: string;
  clinicAddress: string;
  signature?: string;
}

// Medication interface
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// Test recommendation interface
export interface Test {
  id: string;
  name: string;
  description?: string;
}

// Prescription data interface
export interface PrescriptionData {
  id: string;
  date: Date;
  patient: Patient;
  doctor: Doctor;
  diagnosis: string;
  medications: Medication[];
  tests: Test[];
  advice: string;
  followUpDate?: Date;
  templateId: string;
}

// Template types
export type TemplateType = 'modern' | 'classic' | 'minimal';

export interface Template {
  id: TemplateType;
  name: string;
  description: string;
  preview: string;
}
