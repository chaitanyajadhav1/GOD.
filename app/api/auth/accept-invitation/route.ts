import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, generateRefreshToken, validatePassword } from '@/lib/auth';
import { createAuditLog, sendWelcomeEmail } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, mobileNumber, password, firstName, lastName } = await request.json();

    if (!token || !mobileNumber || !password) {
      return NextResponse.json(
        { error: 'Token, mobile number, and password are required' },
        { status: 400 }
      );
    }

    // Find valid invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        token,
        status: 'PENDING',
        expires_at: { gt: new Date() }
      },
      include: {
        hospital: true,
        sender: true
      }
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation token' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }

    // Check if mobile number already exists
    const existingUser = await prisma.user.findUnique({
      where: { mobile_number: mobileNumber },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Mobile number already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        mobile_number: mobileNumber,
        password_hash: passwordHash,
        user_type: invitation.role,
        status: 'ACTIVE',
        last_login: new Date(),
      },
    });

    // Create profile based on role
    const profile = await prisma.profile.create({
      data: {
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        profile_type: invitation.role === 'DOCTOR' ? 'DOCTOR' : 
                     invitation.role === 'HOSPITAL_ADMIN' ? 'ADMIN' : 'PATIENT',
      },
    });

    // Handle permissions - ensure it's a valid JSON object
    const permissions = invitation.permissions && typeof invitation.permissions === 'object' 
      ? invitation.permissions 
      : {};

    // Create specialized profile based on role
    if (invitation.role === 'DOCTOR') {
      await prisma.doctorProfile.create({
        data: {
          profile_id: profile.id,
        },
      });
    } else if (invitation.role === 'HOSPITAL_ADMIN') {
      await prisma.adminProfile.create({
        data: {
          profile_id: profile.id,
          permissions: permissions as any,
        },
      });
    }

    // Add user to hospital if specified
    if (invitation.hospital_id) {
      await prisma.hospitalUser.create({
        data: {
          hospital_id: invitation.hospital_id,
          user_id: user.id,
          role: invitation.role,
          invited_by: invitation.invited_by,
          invited_at: new Date(),
          joined_at: new Date(),
          status: 'ACTIVE',
          permissions: permissions as any,
        },
      });

      // If this is a hospital admin, update hospital admin reference
      if (invitation.role === 'HOSPITAL_ADMIN') {
        await prisma.hospital.update({
          where: { id: invitation.hospital_id },
          data: { admin_id: user.id },
        });
      }
    }

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        accepted_at: new Date(),
      },
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      userType: user.user_type,
      mobileNumber: user.mobile_number,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Send welcome email only if user has email
    if (user.email) {
      await sendWelcomeEmail(
        user.email,
        `${firstName} ${lastName}`.trim(),
        invitation.role
      );
    }

    // Create audit log
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Get hospital name safely (hospital might be null)
    const hospitalName = invitation.hospital?.name || 'Unknown Hospital';
    
    await createAuditLog(
      user.id,
      'INVITATION_ACCEPTED',
      'USER',
      user.id,
      { 
        email: invitation.email,
        role: invitation.role,
        hospitalId: invitation.hospital_id,
        hospitalName: hospitalName
      },
      invitation.hospital_id || undefined,
      ipAddress
    );

    // Set refresh token cookie
    const response = NextResponse.json({
      message: 'Invitation accepted successfully',
      accessToken,
      user: {
        id: user.id,
        mobileNumber: user.mobile_number,
        email: user.email,
        userType: user.user_type,
        status: user.status,
        profile: {
          firstName,
          lastName
        }
      },
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Accept invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}