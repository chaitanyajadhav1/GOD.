import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim()
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let payload
    try {
      payload = verifyAccessToken(token)
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user || user.user_type !== 'DOCTOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const patients = await prisma.profile.findMany({
      where: { profile_type: 'PATIENT' },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        created_at: true,
        patient_profile: true,
        user: { select: { mobile_number: true, email: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 50
    })

    return NextResponse.json({ success: true, data: patients, count: patients.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
  }
}