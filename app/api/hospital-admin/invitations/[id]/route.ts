import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyAccessToken(token)

    const hospitalUser = await prisma.hospitalUser.findFirst({
      where: { user_id: payload.userId, role: 'HOSPITAL_ADMIN', status: 'ACTIVE' }
    })

    if (!hospitalUser) {
      return NextResponse.json({ error: 'Hospital admin access required' }, { status: 403 })
    }

    const invitation = await prisma.invitation.findUnique({ where: { id: params.id } })
    if (!invitation || invitation.hospital_id !== hospitalUser.hospital_id) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    const updated = await prisma.invitation.update({ where: { id: invitation.id }, data: { status: 'REVOKED' } })
    return NextResponse.json({ success: true, message: 'Invitation revoked', data: { id: updated.id, status: updated.status } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to revoke invitation' }, { status: 500 })
  }
}