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
    const slots = await prisma.doctorAvailability.findMany({
      where: { doctor_user_id: payload.userId, date: { gte: now }, status: 'ACTIVE' },
      orderBy: [{ date: 'asc' }, { start_time: 'asc' }]
    })

    return NextResponse.json({ success: true, slots })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
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
    const { date, start_time, end_time, status } = body
    if (!date || !start_time || !end_time) {
      return NextResponse.json({ error: 'date, start_time and end_time are required' }, { status: 400 })
    }

    const slot = await prisma.doctorAvailability.create({
      data: {
        doctor_user_id: payload.userId,
        date: new Date(date),
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        status: status || 'ACTIVE'
      }
    })

    return NextResponse.json({ success: true, slot }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create availability' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, date, start_time, end_time, status } = body
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const updated = await prisma.doctorAvailability.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        start_time: start_time ? new Date(start_time) : undefined,
        end_time: end_time ? new Date(end_time) : undefined,
        status: status || undefined
      }
    })

    return NextResponse.json({ success: true, slot: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 })
  }
}