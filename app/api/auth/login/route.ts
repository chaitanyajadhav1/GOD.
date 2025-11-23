// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, generateRefreshToken, normalizeIndianPhone } from '@/lib/auth';
import { createAuditLog } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, mobileNumber, password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (!email && !mobileNumber) {
      return NextResponse.json(
        { error: 'Email or mobile number is required' },
        { status: 400 }
      );
    }

    // Find user by email or mobile number
    let user;
    if (email) {
      // Hospital staff login with email
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          profiles: true,
        },
      });
    } else {
      // Patient login with mobile number
      const normalizedPhone = normalizeIndianPhone(mobileNumber);
      user = await prisma.user.findUnique({
        where: { mobile_number: normalizedPhone },
        include: {
          profiles: true,
        },
      });
    }

    if (!user || !user.password_hash) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Please complete your account setup first' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      // Log failed attempt
      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
      await createAuditLog(
        user.id,
        'LOGIN_FAILED',
        'USER',
        user.id,
        { 
          email: email || undefined,
          mobileNumber: mobileNumber || undefined, 
          reason: 'invalid_password' 
        },
        undefined,
        ipAddress
      );

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      userType: user.user_type,
      mobileNumber: user.mobile_number,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token (hashed)
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    
    await prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Log successful login
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    await createAuditLog(
      user.id,
      'USER_LOGIN',
      'USER',
      user.id,
      { 
        email: email || undefined,
        mobileNumber: mobileNumber || undefined, 
        method: 'password' 
      },
      undefined,
      ipAddress
    );

    // Set cookie and return
    const response = NextResponse.json({
      accessToken,
      user: {
        id: user.id,
        mobileNumber: user.mobile_number,
        email: user.email,
        userType: user.user_type,
        status: user.status,
        profile: user.profiles[0] || null,
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}