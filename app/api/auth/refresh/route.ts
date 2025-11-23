// app/api/auth/refresh/route.ts


import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Find valid refresh token in database
    const tokens = await prisma.refreshToken.findMany({
      where: { user_id: payload.userId },
      include: { user: true },
    });

    let validToken = false;
    for (const token of tokens) {
      if (await bcrypt.compare(refreshToken, token.token)) {
        validToken = true;
        
        // Delete old token (rotate)
        await prisma.refreshToken.delete({ where: { id: token.id } });
        break;
      }
    }

    if (!validToken) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    const sanitizedPayload = {
      userId: payload.userId,
      userType: payload.userType,
      mobileNumber: payload.mobileNumber,
    };

    const newAccessToken = generateAccessToken(sanitizedPayload);
    const newRefreshToken = generateRefreshToken(sanitizedPayload);

    // Store new refresh token
    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 12);
    await prisma.refreshToken.create({
      data: {
        token: hashedNewRefreshToken,
        user_id: payload.userId,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const response = NextResponse.json({
      accessToken: newAccessToken,
    });

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Invalid refresh token' },
      { status: 401 }
    );
  }
}