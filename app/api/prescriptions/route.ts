import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { createAuditLog } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim()
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profile_id')

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let payload
    try {
      payload = verifyAccessToken(token)
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // If profileId provided, verify access similar to medical records
    if (profileId) {
      const profile = await prisma.profile.findFirst({
        where: { id: profileId },
        include: { user: true, family_members: { include: { family_group: true } } }
      })
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }
      const hasAccess =
        profile.user_id === payload.userId ||
        profile.family_members.some((fm: any) => fm.family_group.primary_user_id === payload.userId) ||
        payload.userType === 'DOCTOR'
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const prescriptions = await prisma.medicalRecord.findMany({
      where: { record_type: 'PRESCRIPTION', ...(profileId ? { profile_id: profileId } : {}) },
      orderBy: { recorded_date: 'desc' },
    })

    return NextResponse.json({ success: true, data: prescriptions })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { profile_id, title, description, recorded_date } = await request.json()

    if (!profile_id || !title) {
      return NextResponse.json({ error: 'profile_id and title are required' }, { status: 400 })
    }

    // Doctor access or own/family
    const profile = await prisma.profile.findFirst({
      where: { id: profile_id },
      include: { user: true, family_members: { include: { family_group: true } } }
    })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    const hasAccess =
      profile.user_id === payload.userId ||
      profile.family_members.some((fm: any) => fm.family_group.primary_user_id === payload.userId) ||
      payload.userType === 'DOCTOR'
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const record = await prisma.medicalRecord.create({
      data: {
        profile_id,
        record_type: 'PRESCRIPTION',
        title,
        description,
        recorded_date: recorded_date ? new Date(recorded_date) : new Date(),
      }
    })

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    await createAuditLog(
      payload.userId,
      'CREATE_MEDICAL_RECORD',
      'MEDICAL_RECORD',
      record.id,
      { record_type: 'PRESCRIPTION', title, profile_id },
      undefined,
      ip
    )

    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save prescription' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Prescription ID is required' }, { status: 400 })
    }

    const record = await prisma.medicalRecord.findUnique({ where: { id } })
    if (!record || record.record_type !== 'PRESCRIPTION') {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    await prisma.medicalRecord.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Prescription deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete prescription' }, { status: 500 })
  }
}
