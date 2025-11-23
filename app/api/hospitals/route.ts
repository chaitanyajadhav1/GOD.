import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);

    // Verify super admin access
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    // Use the correct enum value for comparison
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
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyAccessToken(accessToken);

    // Verify super admin access
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    // Use the correct enum value for comparison
    if (!user || user.user_type !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }

    const { name, address, contact_number, email, website, adminEmail } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Hospital name is required' }, { status: 400 });
    }

    // Create hospital data object
    const hospitalData: any = {
      name,
      address,
      email,
      website,
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

    // If admin email is provided, find or create admin and assign to hospital
    if (adminEmail) {
      let adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });

      if (!adminUser) {
        // Create new admin user (they'll need to complete setup)
        adminUser = await prisma.user.create({
          data: {
            email: adminEmail,
            mobile_number: `temp-${Date.now()}`, // Temporary, will be updated during setup
            user_type: 'HOSPITAL_ADMIN', // Use the correct enum value
            status: 'PENDING',
          },
        });
      }

      // Assign admin to hospital
      await prisma.hospitalUser.create({
        data: {
          hospital_id: hospital.id,
          user_id: adminUser.id,
          role: 'HOSPITAL_ADMIN', // Use the correct enum value
          invited_by: user.id,
          joined_at: new Date(),
          status: 'ACTIVE',
        },
      });

      // Update hospital with admin
      await prisma.hospital.update({
        where: { id: hospital.id },
        data: { admin_id: adminUser.id },
      });
    }

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

    return NextResponse.json({
      success: true,
      message: 'Hospital created successfully',
      data: hospital
    });

  } catch (error) {
    console.error('Create hospital error:', error);
    return NextResponse.json(
      { error: 'Failed to create hospital' },
      { status: 500 }
    );
  }
}