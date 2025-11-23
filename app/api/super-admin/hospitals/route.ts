import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/utils';
import { sendInvitationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Try to get token from Authorization header (case-insensitive)
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

    const hospitals = await prisma.hospital.findMany({
      include: {
        creator: {
          select: { email: true, mobile_number: true }
        },
        admin: {
          select: { email: true, mobile_number: true }
        },
        hospital_users: {
          include: {
            user: {
              select: { email: true, mobile_number: true, user_type: true }
            }
          }
        },
        departments: true,
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: hospitals,
      count: hospitals.length
    });

  } catch (error) {
    console.error('Get hospitals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hospitals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header (case-insensitive)
    const authHeader = (request.headers.get('authorization') || request.headers.get('Authorization') || '').trim();
    // Extract token, handling both 'Bearer token' and raw token formats
    const accessToken = authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : authHeader;
    
    if (!accessToken) {
      console.error('❌ No access token found in request headers');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch (error: any) {
      console.error('❌ Token verification failed:', error.message);
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

    const { name, address, contact_number, email, adminEmail } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Hospital name is required' }, { status: 400 });
    }

    if (!adminEmail) {
      return NextResponse.json({ error: 'Admin email is required to create a hospital' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      return NextResponse.json({ error: 'Invalid admin email format' }, { status: 400 });
    }

    // Check if user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
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
        email: adminEmail,
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

    // Create hospital data object
    const hospitalData: any = {
      name,
      address: address || undefined,
      email: email || undefined,
      created_by: user.id,
    };

    // Only add contact_number if it exists in the schema
    if (contact_number !== undefined) {
      hospitalData.contact_number = contact_number;
    }

    // Create hospital
    const hospital = await prisma.hospital.create({
      data: hospitalData,
    });

    // Generate invitation token for admin
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation for hospital admin
    const invitation = await prisma.invitation.create({
      data: {
        email: adminEmail,
        token: invitationToken,
        role: 'HOSPITAL_ADMIN',
        hospital_id: hospital.id,
        permissions: {},
        invited_by: user.id,
        expires_at: expiresAt,
      },
    });

    // Send invitation email to admin
    await sendInvitationEmail({
      email: adminEmail,
      role: 'HOSPITAL_ADMIN',
      hospitalName: hospital.name,
      token: invitationToken,
      invitedBy: user.email || 'Super Admin'
    });

    // Create audit log
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    await createAuditLog(
      user.id,
      'CREATE_HOSPITAL',
      'HOSPITAL',
      hospital.id,
      { name, address, adminEmail },
      hospital.id,
      ipAddress
    );

    await createAuditLog(
      user.id,
      'SEND_INVITATION',
      'INVITATION',
      invitation.id,
      { email: adminEmail, role: 'HOSPITAL_ADMIN', hospitalId: hospital.id },
      hospital.id,
      ipAddress
    );

    return NextResponse.json({
      success: true,
      message: 'Hospital created successfully and invitation sent to admin',
      data: {
        hospital,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          status: invitation.status
        }
      }
    });

  } catch (error) {
    console.error('Create hospital error:', error);
    return NextResponse.json(
      { error: 'Failed to create hospital' },
      { status: 500 }
    );
  }
}