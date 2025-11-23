// api/doctor/profile/route.ts - Doctor-specific Profile
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);

    // Verify user is a doctor
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        profiles: {
          where: { profile_type: 'DOCTOR' },
          include: {
            doctor_profile: true
          }
        }
      }
    });

    if (!user || user.user_type !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Access denied. Doctor account required.' },
        { status: 403 }
      );
    }

    const doctorProfile = user.profiles[0];

    if (!doctorProfile) {
      return NextResponse.json(
        { error: 'Doctor profile not found. Please complete your profile.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        name: `${doctorProfile.first_name} ${doctorProfile.last_name}`,
        firstName: doctorProfile.first_name,
        lastName: doctorProfile.last_name,
        dateOfBirth: doctorProfile.date_of_birth,
        gender: doctorProfile.gender,
        medicalLicenseNumber: doctorProfile.doctor_profile?.medical_license_number,
        specialization: doctorProfile.doctor_profile?.specialization,
        consultationFee: doctorProfile.doctor_profile?.consultation_fee,
        contact: user.mobile_number,
        email: user.email,
      }
    });

  } catch (error) {
    console.error('❌ Get doctor profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);
    const body = await request.json();

    // Verify user is a doctor
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        profiles: {
          where: { profile_type: 'DOCTOR' },
          include: { doctor_profile: true }
        }
      }
    });

    if (!user || user.user_type !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Access denied. Doctor account required.' },
        { status: 403 }
      );
    }

    const profile = user.profiles[0];

    if (!profile) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    const {
      firstName,
      lastName,
      medicalLicenseNumber,
      specialization,
      department,
      consultationFee,
    } = body;

    // Update profile
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    });

    // Update doctor profile
    if (profile.doctor_profile) {
      await prisma.doctorProfile.update({
        where: { profile_id: profile.id },
        data: {
          medical_license_number: medicalLicenseNumber,
          specialization,
          consultation_fee: consultationFee,
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Doctor profile updated successfully'
    });

  } catch (error) {
    console.error('❌ Update doctor profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update doctor profile' },
      { status: 500 }
    );
  }
}