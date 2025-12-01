// app/api/auth/create-super-admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { secretCode, email, password, mobileNumber, firstName, lastName } = await request.json();

    // Verify secret code
    const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET_CODE;

    if (!SUPER_ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Super Admin creation is not configured' },
        { status: 500 }
      );
    }

    if (secretCode !== SUPER_ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret code' },
        { status: 401 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' },
        { status: 400 }
      );
    }

    // Validate mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber)) {
      return NextResponse.json(
        { error: 'Invalid mobile number. Must be 10 digits starting with 6-9' },
        { status: 400 }
      );
    }

    // Normalize mobile number
    const normalizedMobile = `+91${mobileNumber}`;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { mobile_number: normalizedMobile }
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'mobile number';
      return NextResponse.json(
        { error: `User already exists with this ${field}` },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        email,
        mobile_number: normalizedMobile,
        password_hash: passwordHash,
        user_type: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
    });

    // Create profile
    await prisma.profile.create({
      data: {
        user_id: superAdmin.id,
        first_name: firstName,
        last_name: lastName,
        profile_type: 'ADMIN',
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Super Admin created successfully',
        userId: superAdmin.id 
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating super admin:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User with this email or mobile number already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}