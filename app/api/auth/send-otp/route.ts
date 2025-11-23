// app/api/auth/send-otp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { sendOTP } from '@/lib/twilio';
import { generateOTP } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { validateIndianPhone, normalizeIndianPhone } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { mobileNumber, purpose = 'LOGIN' } = await request.json();

    if (!mobileNumber) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      );
    }

    // Validate Indian phone number
    if (!validateIndianPhone(mobileNumber)) {
      return NextResponse.json(
        { error: 'Invalid Indian mobile number. Must be 10 digits starting with 6-9' },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = normalizeIndianPhone(mobileNumber);

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in database (instead of Redis for better audit trail)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.oTPVerification.create({
      data: {
        mobile_number: normalizedPhone,
        otp_code: otp,
        purpose: purpose as any, // 'LOGIN' or 'REGISTRATION'
        expires_at: expiresAt,
      },
    });

    // Send OTP via SMS
    await sendOTP(normalizedPhone, otp);

    // Log the action (console only - no audit log for anonymous actions)
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    console.log('📱 OTP sent to:', normalizedPhone, 'Purpose:', purpose, 'IP:', ipAddress);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully',
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}