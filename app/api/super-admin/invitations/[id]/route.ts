import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const invitation = await prisma.invitation.findUnique({ where: { id: params.id } })
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    const updated = await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'REVOKED' }
    })

    return NextResponse.json({ success: true, message: 'Invitation revoked', data: { id: updated.id, status: updated.status } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to revoke invitation' }, { status: 500 })
  }
}