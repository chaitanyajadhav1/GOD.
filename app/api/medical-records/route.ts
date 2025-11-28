//auth/medical-records/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/utils';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profile_id');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Verify user has access to this profile
    const profile = await prisma.profile.findFirst({
      where: { 
        id: profileId!,
        OR: [
          { user_id: payload.userId },
          { 
            family_members: {
              some: {
                family_group: {
                  primary_user_id: payload.userId
                }
              }
            }
          }
        ]
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const medicalRecords = await prisma.medicalRecord.findMany({
      where: { profile_id: profileId! },
      orderBy: { recorded_date: 'desc' },
    });

    return NextResponse.json({ medicalRecords });
  } catch (error) {
    console.error('Get medical records error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const {
      profile_id,
      record_type,
      title,
      description,
      file_url,
      recorded_date,
    } = await request.json();

    // Verify access (only doctors can create medical records for others)
    const profile = await prisma.profile.findFirst({
      where: { id: profile_id },
      include: {
        user: true,
        family_members: {
          include: {
            family_group: true
          }
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const hasAccess = 
      profile.user_id === payload.userId ||
      profile.family_members.some((fm: { family_group: { primary_user_id: string; }; }) => 
        fm.family_group.primary_user_id === payload.userId
      ) ||
      payload.userType === 'DOCTOR';

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        profile_id,
        record_type,
        title,
        description,
        file_url,
        recorded_date: recorded_date ? new Date(recorded_date) : new Date(),
      },
    });

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    await createAuditLog(
      payload.userId,
      'CREATE_MEDICAL_RECORD',
      'MEDICAL_RECORD',
      medicalRecord.id,
      { record_type, title, profile_id },
      undefined,
      ipAddress
    );

    return NextResponse.json({ medicalRecord });
  } catch (error) {
    console.error('Create medical record error:', error);
    return NextResponse.json(
      { error: 'Failed to create medical record' },
      { status: 500 }
    );
  }
}