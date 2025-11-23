/**
 * Type definitions for the Prescription Builder application
 */
import { UserRole, UserStatus, HospitalStatus, ProfileType } from '@prisma/client';


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






export { UserRole, UserStatus, HospitalStatus, ProfileType };

export interface User {
  id: string;
  email?: string;
  mobile_number: string;
  user_type: UserRole;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface Hospital {
  id: string;
  name: string;
  address?: string;
  contact_number?: string;
  email?: string;
  website?: string;
  status: HospitalStatus;
  created_by: string;
  admin_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: Date;
  gender?: string;
  profile_type: ProfileType;
  created_at: Date;
  updated_at: Date;
}


export interface FamilyGroup {
  id: string;
  primary_user_id: string;
  group_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MedicalRecord {
  id: string;
  profile_id: string;
  record_type: 'MEDICATION' | 'AILMENT' | 'TEST_REPORT' | 'DOCUMENT';
  title: string;
  description?: string;
  file_url?: string;
  recorded_date?: Date;
  created_at: Date;
  updated_at: Date;
}