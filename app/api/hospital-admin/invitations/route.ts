import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';
import { sendDoctorInvitationEmail } from '@/lib/email';
import { createAuditLog } from '@/lib/utils';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);

    // Verify hospital admin access
    const hospitalUser = await prisma.hospitalUser.findFirst({
      where: { 
        user_id: payload.userId,
        role: 'HOSPITAL_ADMIN',
        status: 'ACTIVE'
      },
      include: { 
        hospital: true,
        user: {
          select: { email: true } // Include user relation
        }
      }
    });

    if (!hospitalUser) {
      return NextResponse.json({ error: 'Hospital admin access required' }, { status: 403 });
    }

    const invitations = await prisma.invitation.findMany({
      where: {
        hospital_id: hospitalUser.hospital_id,
        invited_by: payload.userId
      },
      include: {
        hospital: {
          select: { name: true }
        },
        sender: {
          select: { email: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: invitations,
      count: invitations.length
    });

  } catch (error) {
    console.error('Get invitations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);

    // Verify hospital admin access - FIXED: Include user relation
    const hospitalUser = await prisma.hospitalUser.findFirst({
      where: { 
        user_id: payload.userId,
        role: 'HOSPITAL_ADMIN',
        status: 'ACTIVE'
      },
      include: { 
        hospital: true,
        user: { // Add this to include the user relation
          select: { email: true }
        }
      }
    });

    if (!hospitalUser) {
      return NextResponse.json({ error: 'Hospital admin access required' }, { status: 403 });
    }

    const { email, permissions } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Check if user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        hospital_id: hospitalUser.hospital_id,
        status: 'PENDING',
        expires_at: { gt: new Date() }
      }
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Pending invitation already exists for this email' },
        { status: 400 }
      );
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation for doctor
    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        role: 'DOCTOR',
        hospital_id: hospitalUser.hospital_id,
        permissions: permissions || {},
        invited_by: payload.userId,
        expires_at: expiresAt,
      },
      include: {
        hospital: {
          select: { name: true }
        }
      }
    });

    // Send doctor invitation email - FIXED: Now hospitalUser.user exists
    await sendDoctorInvitationEmail({
      email,
      hospitalName: hospitalUser.hospital.name,
      token,
      invitedBy: hospitalUser.user?.email || 'Hospital Admin' // Use optional chaining
    });

    // Create audit log
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    await createAuditLog(
      payload.userId,
      'SEND_DOCTOR_INVITATION',
      'INVITATION',
      invitation.id,
      { email, role: 'DOCTOR', hospitalId: hospitalUser.hospital_id },
      hospitalUser.hospital_id,
      ipAddress
    );

    return NextResponse.json({
      success: true,
      message: 'Doctor invitation sent successfully',
      data: invitation
    });

  } catch (error) {
    console.error('Send doctor invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to send doctor invitation' },
      { status: 500 }
    );
  }
}