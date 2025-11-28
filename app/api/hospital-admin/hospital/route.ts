import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyAccessToken(token)

    const hospitalUser = await prisma.hospitalUser.findFirst({
      where: { user_id: payload.userId, role: 'HOSPITAL_ADMIN', status: 'ACTIVE' },
      include: { hospital: true }
    })

    if (!hospitalUser || !hospitalUser.hospital) {
      return NextResponse.json({ error: 'Hospital admin access required' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: hospitalUser.hospital })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch hospital' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyAccessToken(token)
    const { name, address, contact_number, email, website } = await request.json()

    const hospitalUser = await prisma.hospitalUser.findFirst({
      where: { user_id: payload.userId, role: 'HOSPITAL_ADMIN', status: 'ACTIVE' },
      include: { hospital: true }
    })

    if (!hospitalUser || !hospitalUser.hospital) {
      return NextResponse.json({ error: 'Hospital admin access required' }, { status: 403 })
    }

    const updated = await prisma.hospital.update({
      where: { id: hospitalUser.hospital_id },
      data: { name, address, contact_number, email, website }
    })

    return NextResponse.json({ success: true, message: 'Hospital updated', data: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update hospital' }, { status: 500 })
  }
}