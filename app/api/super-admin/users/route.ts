import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim()
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let payload
    try {
      payload = verifyAccessToken(token)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user || user.user_type !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 })
    }

    const where: Record<string, unknown> = {}
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { mobile_number: { contains: q } }
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        mobile_number: true,
        user_type: true,
        status: true,
        created_at: true,
        last_login: true,
        profiles: {
          select: {
            id: true,
            profile_type: true,
            first_name: true,
            last_name: true,
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    })

    const count = await prisma.user.count({ where })

    return NextResponse.json({ success: true, data: users, count })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}