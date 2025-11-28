import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { sendDoctorInvitationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyAccessToken(token)

    const hospitalUser = await prisma.hospitalUser.findFirst({
      where: { user_id: payload.userId, role: 'HOSPITAL_ADMIN', status: 'ACTIVE' },
      include: { hospital: true, user: { select: { email: true } } }
    })

    if (!hospitalUser) {
      return NextResponse.json({ error: 'Hospital admin access required' }, { status: 403 })
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: params.id },
      include: { hospital: { select: { name: true } } }
    })

    if (!invitation || invitation.hospital_id !== hospitalUser.hospital_id) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending invitations can be resent' }, { status: 400 })
    }

    const newToken = crypto.randomBytes(32).toString('hex')
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await prisma.invitation.update({ where: { id: invitation.id }, data: { token: newToken, expires_at: newExpiresAt } })

    await sendDoctorInvitationEmail({
      email: invitation.email,
      hospitalName: invitation.hospital?.name || hospitalUser.hospital.name,
      token: newToken,
      invitedBy: hospitalUser.user?.email || 'Hospital Admin'
    })

    return NextResponse.json({ success: true, message: 'Invitation resent', data: { id: invitation.id, expires_at: newExpiresAt } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 })
  }
}