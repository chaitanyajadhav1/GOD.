//api/doctor/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Doctor } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // In production, fetch from database or user session
    const sampleDoctor: Doctor = {
      name: 'Dr. Sarah Johnson',
      qualification: 'MBBS, MD (Internal Medicine)',
      specialization: 'General Physician',
      registrationNumber: 'MCI-12345',
      contact: '+1 (555) 123-4567',
      email: 'dr.sarah@healthclinic.com',
      clinicName: 'HealthCare Medical Center',
      clinicAddress: '123 Medical Plaza, Suite 400, New York, NY 10001',
    };

    return NextResponse.json({
      success: true,
      data: sampleDoctor,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctor information' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const doctor: Doctor = body;

    // Validate doctor data
    if (!doctor.name || !doctor.qualification || !doctor.registrationNumber) {
      return NextResponse.json(
        { success: false, error: 'Invalid doctor data' },
        { status: 400 }
      );
    }

    // In production, update in database
    return NextResponse.json({
      success: true,
      message: 'Doctor information updated successfully',
      data: doctor,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update doctor information' },
      { status: 500 }
    );
  }
}
