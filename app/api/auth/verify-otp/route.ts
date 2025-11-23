// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAccessToken, normalizeIndianPhone, validateIndianPhone } from '@/lib/auth';
import { createAuditLog } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON format in request body',
          details: 'Please ensure your request body is valid JSON'
        },
        { status: 400 }
      );
    }

    const { mobileNumber, otp, userType = 'PATIENT' } = body;

    // Detailed validation
    if (!mobileNumber) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      );
    }

    if (!otp) {
      return NextResponse.json(
        { error: 'OTP is required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!validateIndianPhone(mobileNumber)) {
      return NextResponse.json(
        { error: 'Invalid Indian mobile number format. Must be 10 digits starting with 6-9' },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = normalizeIndianPhone(mobileNumber);

    // Validate OTP format (should be 6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format. OTP must be 6 digits' },
        { status: 400 }
      );
    }

    // OTP login is only for PATIENT/USER types - Hospital staff (DOCTOR/ADMIN) should use email+password
    const allowedUserTypes = ['PATIENT', 'USER'];
    if (!allowedUserTypes.includes(userType)) {
      return NextResponse.json(
        { 
          error: 'OTP login is only available for patients. Hospital staff should use email and password login.',
          hint: 'If you are a doctor or admin, please use the email+password login option'
        },
        { status: 400 }
      );
    }

    console.log('📥 Verify OTP Request:', {
      mobileNumber: normalizedPhone,
      otp: `${otp.substring(0, 2)}****`,
      userType,
      timestamp: new Date().toISOString()
    });

    // Find the most recent OTP for this mobile number
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        mobile_number: normalizedPhone,
        otp_code: otp,
        verified_at: null, // Not yet verified
        expires_at: {
          gt: new Date(), // Not expired
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // If OTP not found, provide detailed debugging info
    if (!otpRecord) {
      console.log('❌ No matching OTP found for:', normalizedPhone);
      
      // Check if any OTP exists for this number (for debugging)
      const recentOtps = await prisma.oTPVerification.findMany({
        where: { mobile_number: normalizedPhone },
        orderBy: { created_at: 'desc' },
        take: 3,
      });

      if (recentOtps.length === 0) {
        console.log('📋 No OTP records found for this number. User may need to request OTP first.');
        return NextResponse.json(
          { 
            error: 'No OTP found for this mobile number',
            hint: 'Please request an OTP first using /api/auth/send-otp'
          },
          { status: 400 }
        );
      }

      // Log details about existing OTPs for debugging
      console.log('📋 Recent OTPs for', normalizedPhone, ':');
      recentOtps.forEach((record, index) => {
        const isExpired = record.expires_at < new Date();
        const isVerified = record.verified_at !== null;
        console.log(`  ${index + 1}. OTP: ${record.otp_code.substring(0, 2)}****, ` +
          `Expired: ${isExpired}, Verified: ${isVerified}, ` +
          `Created: ${record.created_at.toISOString()}, ` +
          `Expires: ${record.expires_at.toString()}`
        );
      });

      // Provide specific error message based on what we found
      const latestOtp = recentOtps[0];
      const isExpired = new Date(latestOtp.expires_at) < new Date();
      const isVerified = latestOtp.verified_at !== null;

      if (isExpired) {
        return NextResponse.json(
          { 
            error: 'OTP has expired',
            hint: 'Please request a new OTP'
          },
          { status: 400 }
        );
      }

      if (isVerified) {
        return NextResponse.json(
          { 
            error: 'OTP has already been used',
            hint: 'Please request a new OTP'
          },
          { status: 400 }
        );
      }

      // OTP code mismatch
      return NextResponse.json(
        { 
          error: 'Invalid OTP code',
          hint: 'Please check the OTP and try again'
        },
        { status: 400 }
      );
    }

    console.log('✅ Valid OTP found, marking as verified');

    // Mark OTP as verified
    await prisma.oTPVerification.update({
      where: { id: otpRecord.id },
      data: { verified_at: new Date() },
    });

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { mobile_number: normalizedPhone },
      include: {
        profiles: true,
      },
    });

    const isNewUser = !user;
    let requiresSetup = false;

    if (!user) {
      console.log('👤 Creating new user with PENDING status');
      
      // Create NEW user with PENDING status - FIXED: Use correct UserRole enum values
      try {
        user = await prisma.user.create({
          data: {
            mobile_number: normalizedPhone,
            user_type: userType as any, // This will now be 'PATIENT' by default
            status: 'PENDING', // User needs to complete setup
          },
          include: {
            profiles: true,
          },
        });
        requiresSetup = true;
        console.log('✅ New user created:', user.id);
      } catch (createError: any) {
        console.error('❌ Error creating user:', createError);
        
        // Handle duplicate user error
        if (createError.code === 'P2002') {
          return NextResponse.json(
            { error: 'User with this mobile number already exists' },
            { status: 409 }
          );
        }
        
        throw createError;
      }
    } else {
      console.log('👤 Existing user found:', user.id);
      
      // Existing user - check if they completed setup
      requiresSetup = user.status === 'PENDING' || !user.password_hash || !user.email;
      
      console.log('📋 User setup status:', {
        status: user.status,
        hasPassword: !!user.password_hash,
        hasEmail: !!user.email,
        requiresSetup
      });
    }

    // Generate temporary token for completing registration
    const tempToken = generateAccessToken({
      userId: user.id,
      userType: user.user_type,
      mobileNumber: user.mobile_number,
    });

    console.log('🔑 Generated temporary token for user:', user.id);

    // Log the action
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    
    try {
      await createAuditLog(
        user.id,
        isNewUser ? 'USER_REGISTER' : 'OTP_VERIFIED',
        'USER',
        user.id,
        { mobileNumber: normalizedPhone },
        undefined,
        ipAddress
      );
    } catch (auditError) {
      // Don't fail the request if audit log fails
      console.error('⚠️ Failed to create audit log:', auditError);
    }

    console.log('✅ OTP verification successful for user:', user.id);

    return NextResponse.json({
      message: 'OTP verified successfully',
      isNewUser,
      requiresSetup,
      tempToken,
      user: {
        id: user.id,
        mobileNumber: user.mobile_number,
        userType: user.user_type,
        email: user.email,
        status: user.status,
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Verify OTP Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      timestamp: new Date().toISOString()
    });

    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate record' },
        { status: 409 }
      );
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Token generation failed' },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: 'Failed to verify OTP',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}