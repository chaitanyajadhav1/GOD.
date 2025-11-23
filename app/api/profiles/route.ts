import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/utils';

// Get all profiles for authenticated user
export async function GET(request: NextRequest) {
  try {
    // Extract and verify access token
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);

    console.log('📋 Fetching profiles for user:', payload.userId);

    const profiles = await prisma.profile.findMany({
      where: { user_id: payload.userId },
      include: {
        admin_profile: true,
        doctor_profile: true,
        medical_records: {
          take: 5,
          orderBy: { created_at: 'desc' }
        },
      },
      orderBy: { created_at: 'desc' }
    });

    console.log('✅ Found', profiles.length, 'profiles');

    return NextResponse.json({
      success: true,
      profiles,
      count: profiles.length
    });

  } catch (error: any) {
    console.error('❌ Get profiles error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}

// Create new profile for authenticated user
export async function POST(request: NextRequest) {
  try {
    // Extract and verify access token
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(accessToken);

    const body = await request.json();
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      profile_type,
      // Admin fields
      employee_id,
      department,
      permissions,
      // Doctor fields
      medical_license_number,
      specialization,
      consultation_fee,
      qualifications,
      experience_years,
    } = body;

    // Validation
    if (!profile_type) {
      return NextResponse.json(
        { error: 'profile_type is required' },
        { status: 400 }
      );
    }

    const validProfileTypes = ['ADMIN', 'DOCTOR', 'PATIENT'];
    if (!validProfileTypes.includes(profile_type)) {
      return NextResponse.json(
        { error: `profile_type must be one of: ${validProfileTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify user type matches profile type
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user type is compatible with profile type - FIXED: Use correct enum values
    if (profile_type === 'ADMIN' && user.user_type !== 'HOSPITAL_ADMIN' && user.user_type !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only HOSPITAL_ADMIN or SUPER_ADMIN users can create ADMIN profiles' },
        { status: 403 }
      );
    }

    if (profile_type === 'DOCTOR' && user.user_type !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Only DOCTOR users can create DOCTOR profiles' },
        { status: 403 }
      );
    }

    console.log('👤 Creating profile for user:', payload.userId, 'Type:', profile_type);

    // Create base profile
    const profile = await prisma.profile.create({
      data: {
        user_id: payload.userId,
        first_name,
        last_name,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
        gender,
        profile_type,
      },
    });

    console.log('✅ Base profile created:', profile.id);

    // Create specialized profile based on type
    if (profile_type === 'ADMIN') {
      const adminProfile = await prisma.adminProfile.create({
        data: {
          profile_id: profile.id,
          employee_id: employee_id || null,
          department: department || null,
          permissions: permissions || {},
        },
      });
      console.log('✅ Admin profile created:', adminProfile.id);
    } 
    
    else if (profile_type === 'DOCTOR') {
      if (!medical_license_number) {
        return NextResponse.json(
          { error: 'medical_license_number is required for DOCTOR profiles' },
          { status: 400 }
        );
      }

      // FIXED: Remove department field from DoctorProfile since it doesn't exist
      const doctorProfileData: any = {
        profile_id: profile.id,
        medical_license_number,
        specialization: specialization || null,
        consultation_fee: consultation_fee || null,
        qualifications: qualifications || [],
      };

      // Only add experience_years if provided
      if (experience_years !== undefined) {
        doctorProfileData.experience_years = experience_years;
      }

      const doctorProfile = await prisma.doctorProfile.create({
        data: doctorProfileData,
      });
      console.log('✅ Doctor profile created:', doctorProfile.id);
    }

    // Create audit log
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    
    await createAuditLog(
      payload.userId,
      'CREATE_PROFILE',
      'PROFILE',
      profile.id,
      { profile_type, first_name, last_name },
      undefined,
      ipAddress
    );

    // Fetch complete profile with relationships
    const completeProfile = await prisma.profile.findUnique({
      where: { id: profile.id },
      include: {
        admin_profile: true,
        doctor_profile: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      profile: completeProfile
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Create profile error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create profile',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}