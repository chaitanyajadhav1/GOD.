import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userType = request.headers.get('x-user-type');
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospital_id');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let whereCondition: any = {};

    // Regular users can only see their own logs
    if (userType === 'PATIENT' || userType === 'USER' || userType === 'FAMILY_MEMBER') {
      whereCondition.user_id = userId;
    } 
    // Hospital staff can see hospital logs
    else if (hospitalId && (userType === 'HOSPITAL_ADMIN' || userType === 'DOCTOR')) {
      // Verify user has access to this hospital
      const hospitalUser = await prisma.hospitalUser.findFirst({
        where: {
          hospital_id: hospitalId,
          user_id: userId,
        },
      });

      if (!hospitalUser) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      whereCondition.hospital_id = hospitalId;
    }
    // Super admin can see all logs
    else if (userType === 'SUPER_ADMIN') {
      // No restrictions - can see all logs
    } else {
      whereCondition.user_id = userId;
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { email: true, mobile_number: true, user_type: true }
        },
        hospital: {
          select: { name: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    return NextResponse.json({ 
      logs: auditLogs,
      count: auditLogs.length 
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}