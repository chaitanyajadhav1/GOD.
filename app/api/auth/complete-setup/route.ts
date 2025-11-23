import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, validatePassword } from '@/lib/auth';
import { createAuditLog } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);

    // Get user to verify they exist and are in PENDING status
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        profiles: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only allow setup for PATIENT users who are in PENDING status
    if (user.user_type !== 'PATIENT' && user.user_type !== 'USER') {
      return NextResponse.json(
        { error: 'This endpoint is only for patient registration' },
        { status: 403 }
      );
    }

    if (user.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'User setup already completed' },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
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

    // Check if email is already taken by another user
    const existingUserWithEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserWithEmail && existingUserWithEmail.id !== user.id) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user with email and password, set status to ACTIVE
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        password_hash: passwordHash,
        status: 'ACTIVE',
      },
      include: {
        profiles: true,
      },
    });

    // Create or update profile
    if (firstName || lastName) {
      if (updatedUser.profiles.length > 0) {
        // Update existing profile
        await prisma.profile.update({
          where: { id: updatedUser.profiles[0].id },
          data: {
            first_name: firstName || updatedUser.profiles[0].first_name,
            last_name: lastName || updatedUser.profiles[0].last_name,
          },
        });
      } else {
        // Create new profile
        await prisma.profile.create({
          data: {
            user_id: updatedUser.id,
            first_name: firstName,
            last_name: lastName,
            profile_type: 'PATIENT',
          },
        });
      }
    }

    // Generate new tokens
    const tokenPayload = {
      userId: updatedUser.id,
      userType: updatedUser.user_type,
      mobileNumber: updatedUser.mobile_number,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        user_id: updatedUser.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Create audit log
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    await createAuditLog(
      updatedUser.id,
      'USER_SETUP_COMPLETED',
      'USER',
      updatedUser.id,
      { email, mobileNumber: updatedUser.mobile_number },
      undefined,
      ipAddress
    );

    // Set refresh token cookie
    const response = NextResponse.json({
      message: 'Setup completed successfully',
      accessToken: newAccessToken,
      user: {
        id: updatedUser.id,
        mobileNumber: updatedUser.mobile_number,
        email: updatedUser.email,
        userType: updatedUser.user_type,
        status: updatedUser.status,
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

  } catch (error: any) {
    console.error('Complete setup error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to complete setup' },
      { status: 500 }
    );
  }
}
