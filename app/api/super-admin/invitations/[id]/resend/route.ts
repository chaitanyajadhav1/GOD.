import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { sendInvitationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    if (!user || user.user_type !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 })
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: params.id },
      include: { hospital: { select: { name: true } } }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending invitations can be resent' }, { status: 400 })
    }

    const newToken = crypto.randomBytes(32).toString('hex')
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const updated = await prisma.invitation.update({
      where: { id: invitation.id },
      data: { token: newToken, expires_at: newExpiresAt }
    })

    await sendInvitationEmail({
      email: invitation.email,
      role: invitation.role as string,
      hospitalName: invitation.hospital?.name,
      token: newToken,
      invitedBy: user.email || 'Super Admin'
    })

    return NextResponse.json({ success: true, message: 'Invitation resent', data: { id: updated.id, expires_at: updated.expires_at } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 })
  }
}