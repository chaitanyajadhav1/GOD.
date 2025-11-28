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
    if (!user || user.user_type !== 'DOCTOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const now = new Date()
    const appointments = await prisma.appointment.findMany({
      where: { doctor_user_id: payload.userId, date: { gte: now }, status: 'SCHEDULED' },
      include: {
        patient: {
          select: { id: true, first_name: true, last_name: true }
        }
      },
      orderBy: [{ date: 'asc' }, { start_time: 'asc' }]
    })

    return NextResponse.json({ success: true, appointments })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyAccessToken(accessToken)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user || user.user_type !== 'DOCTOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { patient_profile_id, date, start_time, end_time, title, description } = body
    if (!patient_profile_id || !date || !start_time || !end_time) {
      return NextResponse.json({ error: 'patient_profile_id, date, start_time and end_time are required' }, { status: 400 })
    }

    const hospitalUser = await prisma.hospitalUser.findFirst({
      where: { user_id: payload.userId, role: 'DOCTOR', status: 'ACTIVE' },
    })

    const appointment = await prisma.appointment.create({
      data: {
        hospital_id: hospitalUser?.hospital_id,
        doctor_user_id: payload.userId,
        patient_profile_id,
        title: title || null,
        description: description || null,
        date: new Date(date),
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        status: 'SCHEDULED'
      }
    })

    return NextResponse.json({ success: true, appointment }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}