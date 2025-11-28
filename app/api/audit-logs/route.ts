import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospital_id');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const whereCondition: Record<string, unknown> = {};

    if (payload.userType === 'SUPER_ADMIN') {
    } else if (hospitalId && (payload.userType === 'HOSPITAL_ADMIN' || payload.userType === 'DOCTOR')) {
      const hospitalUser = await prisma.hospitalUser.findFirst({
        where: {
          hospital_id: hospitalId,
          user_id: payload.userId,
        },
      });

      if (!hospitalUser) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      whereCondition.hospital_id = hospitalId;
    } else {
      whereCondition.user_id = payload.userId;
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