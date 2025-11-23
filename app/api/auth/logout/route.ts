// app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAuditLog } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    let userId = 'unknown';

    if (refreshToken) {
      // Find and delete the refresh token
      const tokens = await prisma.refreshToken.findMany();
      
      for (const token of tokens) {
        if (await bcrypt.compare(refreshToken, token.token)) {
          userId = token.user_id;
          await prisma.refreshToken.delete({ where: { id: token.id } });
          break;
        }
      }

      // Log logout
      await createAuditLog(
        userId,
        'USER_LOGOUT',
        'USER',
        userId,
        {},
        undefined,
        ipAddress
      );
    }

    const response = NextResponse.json({ success: true });
    
    // Clear refresh token cookie
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}