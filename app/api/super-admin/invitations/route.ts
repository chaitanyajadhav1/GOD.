import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';
import { sendInvitationEmail } from '@/lib/email';
import { createAuditLog } from '@/lib/utils';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const accessToken = authHeader?.replace(/^Bearer\s+/i, '').trim();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Invalid or expired token. Please login again.' },
        { status: 401 }
      );
    }

    // Verify super admin access
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.user_type !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const invitations = await prisma.invitation.findMany({
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
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const accessToken = authHeader?.replace(/^Bearer\s+/i, '').trim();
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Invalid or expired token. Please login again.' },
        { status: 401 }
      );
    }

    // Verify super admin access
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.user_type !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const { email, role, hospitalId, permissions } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
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

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        role: role as any,
        hospital_id: hospitalId,
        permissions: permissions || {},
        invited_by: user.id,
        expires_at: expiresAt,
      },
      include: {
        hospital: {
          select: { name: true }
        }
      }
    });

    // Send invitation email
    await sendInvitationEmail({
      email,
      role,
      hospitalName: invitation.hospital?.name,
      token,
      invitedBy: user.email || 'Super Admin'
    });

    // Create audit log
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    await createAuditLog(
      user.id,
      'SEND_INVITATION',
      'INVITATION',
      invitation.id,
      { email, role, hospitalId },
      hospitalId,
      ipAddress
    );

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      data: invitation
    });

  } catch (error) {
    console.error('Send invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}