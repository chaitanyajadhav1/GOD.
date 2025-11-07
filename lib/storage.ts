/**
 * Local Storage Utility
 * Manages prescription history and doctor information persistence
 */

import { PrescriptionData, Doctor } from '@/types';

const PRESCRIPTIONS_KEY = 'prescriptions_history';
const DOCTOR_INFO_KEY = 'doctor_info';

// Prescription History Management
export function savePrescription(prescription: PrescriptionData): void {
  try {
    const history = getPrescriptionHistory();
    history.unshift(prescription); // Add to beginning
    
    // Keep only last 50 prescriptions
    const limitedHistory = history.slice(0, 50);
    
    localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Error saving prescription:', error);
  }
}

export function getPrescriptionHistory(): PrescriptionData[] {
  try {
    const data = localStorage.getItem(PRESCRIPTIONS_KEY);
    if (!data) return [];
    
    const history = JSON.parse(data);
    // Convert date strings back to Date objects
    return history.map((p: any) => ({
      ...p,
      date: new Date(p.date),
      followUpDate: p.followUpDate ? new Date(p.followUpDate) : undefined,
    }));
  } catch (error) {
    console.error('Error loading prescription history:', error);
    return [];
  }
}

export function getPrescriptionById(id: string): PrescriptionData | null {
  const history = getPrescriptionHistory();
  return history.find(p => p.id === id) || null;
}

export function deletePrescription(id: string): void {
  try {
    const history = getPrescriptionHistory();
    const filtered = history.filter(p => p.id !== id);
    localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting prescription:', error);
  }
}

export function clearPrescriptionHistory(): void {
  try {
    localStorage.removeItem(PRESCRIPTIONS_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

// Doctor Information Management
export function saveDoctorInfo(doctor: Doctor): void {
  try {
    localStorage.setItem(DOCTOR_INFO_KEY, JSON.stringify(doctor));
  } catch (error) {
    console.error('Error saving doctor info:', error);
  }
}

export function getDoctorInfo(): Doctor | null {
  try {
    const data = localStorage.getItem(DOCTOR_INFO_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading doctor info:', error);
    return null;
  }
}

export function clearDoctorInfo(): void {
  try {
    localStorage.removeItem(DOCTOR_INFO_KEY);
  } catch (error) {
    console.error('Error clearing doctor info:', error);
  }
}

// Sample Doctor Data (for demo purposes)
export function getSampleDoctorData(): Doctor {
  return {
    name: 'Dr. Sarah Johnson',
    qualification: 'MBBS, MD (Internal Medicine)',
    specialization: 'General Physician',
    registrationNumber: 'MCI-12345',
    contact: '+1 (555) 123-4567',
    email: 'dr.sarah@healthclinic.com',
    clinicName: 'HealthCare Medical Center',
    clinicAddress: '123 Medical Plaza, Suite 400, New York, NY 10001',
  };
}
