import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyAccessToken(accessToken)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user || user.user_type !== 'PATIENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get('hospitalId') || undefined

    let hospitalIds: string[] = []
    if (hospitalId) {
      hospitalIds = [hospitalId]
    } else {
      const memberships = await prisma.hospitalUser.findMany({
        where: { user_id: payload.userId, role: 'PATIENT', status: 'ACTIVE' }
      })
      hospitalIds = memberships.map((m) => m.hospital_id)
    }

    if (hospitalIds.length === 0) {
      return NextResponse.json({ doctors: [] })
    }

    const doctors = await prisma.hospitalUser.findMany({
      where: { hospital_id: { in: hospitalIds }, role: 'DOCTOR', status: 'ACTIVE' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            mobile_number: true,
            profiles: {
              where: { profile_type: 'DOCTOR' },
              include: { doctor_profile: true }
            }
          }
        },
        hospital: { select: { id: true, name: true } }
      }
    })

    const normalized = doctors.map((d) => {
      const profile = d.user?.profiles?.[0]
      return {
        userId: d.user_id,
        name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
        specialization: profile?.doctor_profile?.specialization || null,
        email: d.user?.email || null,
        mobile: d.user?.mobile_number || null,
        hospital: d.hospital?.name || null,
        hospitalId: d.hospital?.id || null,
      }
    })

    return NextResponse.json({ doctors: normalized })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 })
  }
}